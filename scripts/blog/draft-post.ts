/**
 * Drafts one blog post with Claude and writes it to content/blog/<slug>.md.
 *
 *   bun scripts/blog/draft-post.ts [--topic "..."] [--date YYYY-MM-DD]
 *                                  [--dry-run] [--pr-body <file>]
 *
 * Topic order: --topic, then the first bullet in content/blog/_topics.md
 * (removed once used), then a seasonal topic Claude picks. Output is checked
 * against the same guardrails as the test suite before anything is written.
 * The post is meant to land in a pull request for Drew to review; nothing here
 * publishes directly.
 */
import fs from "node:fs"
import path from "node:path"
import { parseArgs } from "node:util"
import Anthropic from "@anthropic-ai/sdk"
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod"
import { z } from "zod"
import {
  coverageSummary,
  faqs,
  locations,
  money,
  referral,
  services,
  site,
} from "../../lib/content"
import {
  BLOG_DIR,
  MIN_WORDS,
  type PostFrontmatter,
  buildPost,
  frontmatterSchema,
  postSlugPattern,
  publishedPaths,
  readAllPostFiles,
  serializePost,
  validatePost,
} from "../../lib/blog"

const MODEL = "claude-haiku-5-5"
const TOPICS_FILE = path.join(BLOG_DIR, "_topics.md")
const MAX_ATTEMPTS = 2

const { values: args } = parseArgs({
  options: {
    topic: { type: "string" },
    date: { type: "string" },
    "dry-run": { type: "boolean", default: false },
    "pr-body": { type: "string" },
  },
})

const today =
  args.date ??
  new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago" }).format(
    new Date()
  )

// --- Topic selection -------------------------------------------------------

function nextQueuedTopic() {
  if (!fs.existsSync(TOPICS_FILE)) return undefined
  const lines = fs.readFileSync(TOPICS_FILE, "utf8").split("\n")
  const index = lines.findIndex((l) => /^\s*-\s+\S/.test(l))
  if (index === -1) return undefined
  return {
    topic: lines[index].replace(/^\s*-\s+/, "").trim(),
    consume() {
      lines.splice(index, 1)
      fs.writeFileSync(TOPICS_FILE, lines.join("\n"))
    },
  }
}

const queued = args.topic ? undefined : nextQueuedTopic()
const topic = args.topic ?? queued?.topic

// --- Prompt ----------------------------------------------------------------

const existing = readAllPostFiles()
const facts = {
  business: site.name,
  owner: "Drew, who personally provides all care",
  homeBase: "Fox River Grove, Illinois 60021",
  coverage: coverageSummary,
  services: services.map((s) => ({
    slug: s.slug,
    name: s.name,
    startingRate:
      s.price === null
        ? "personally quoted"
        : `${money(s.price)} per ${s.unit}`,
    description: s.description,
    includes: s.includes,
    bestFor: s.best,
    commonQuestion: { q: s.question, a: s.answer },
  })),
  towns: locations.map((l) => ({
    slug: l.slug,
    name: l.name,
    core: l.core,
    localNote: l.tip,
  })),
  faqs: faqs.map(([q, a]) => ({ q, a })),
  referral: `A ${referral.credit} credit toward the referrer's next booking after a referred friend's first paid booking.`,
  howBookingWorks:
    "Owners send a free request at /book. Drew follows up personally about fit, availability and an exact quote, usually with a meet & greet. A request is not a confirmed booking and needs no payment.",
}

const system = `You write blog posts for ${site.name}, a one-person pet-sitting business in Fox River Grove, Illinois. Posts appear at ${site.url}/blog under Drew's name, so write in Drew's first-person voice: warm, plain-spoken and practical, like a neighbor who looks after pets for a living. Each post should be useful to a local owner even if they never book.

Everything you say about the business must come from the facts below. These rules protect real customers and the site's standing with search engines:

- Never invent experiences, anecdotes, pets, customers, quotes, testimonials, reviews, ratings, statistics, credentials, certifications, insurance, years of experience, partnerships, or awards. Describe how Drew works only as the facts describe it. If a personal story would help, add a review note suggesting where Drew could add a real one.
- Mention only the prices in the facts, written exactly as given (for example "$55"). Write no other dollar amounts. Say that final quotes depend on dates, pets and care needs, and link to /guides/pet-sitting-rates.
- Make no promises about availability, response times, or 24-hour supervision. Never claim to be the best, cheapest or most trusted.
- Keep pet health and safety advice general and widely accepted. Recommend the pet's own veterinarian for anything medical, and give no doses or treatment plans.
- Do not name specific local businesses, vets, parks, trails, events, or weather data. You may name the towns in the facts, and the Fox River in general terms.
- Only use internal links from this list: ${[...publishedPaths(existing.map((p) => p.slug))].join(", ")}. Use /book?service=<service-slug> to point at a specific service request. Include 2 to 5 internal links where they help the reader, with one invitation to /book near the end. External links, if any, must be https links to authoritative sources such as the AVMA or ASPCA. Always write links as Markdown with descriptive link text, never a bare URL or a path as the visible text.
- Do not stuff town names or keywords. Mention a town only where it is natural; a general post does not need any.

Format: 700 to 1,200 words of GitHub-flavored Markdown. Answer the post's core question directly in the first paragraph, use ## and ### headings (never #), keep paragraphs short, and use lists or a small table where they genuinely help. Do not repeat the title as a heading, and do not end with a sign-off line.

Business facts (JSON):
${JSON.stringify(facts, null, 2)}`

const existingList = existing.length
  ? existing
      .map((p) => `- ${p.date}: "${p.title}" (/blog/${p.slug})`)
      .join("\n")
  : "(none yet)"

function userPrompt(previous?: { draft: Draft; problems: string[] }) {
  const parts = [
    `Today is ${today}. Write one new post for the blog.`,
    topic
      ? `Topic from Drew's queue: ${topic}`
      : "Choose a topic that fits the current season and local pet owners' needs, and that no existing post already covers. Prefer practical how-to questions an owner might actually search for.",
    `Existing posts. Do not duplicate their angle, and link to one if it is genuinely relevant:\n${existingList}`,
    "In review_notes, list each factual claim Drew should double-check, plus any spot where a real photo or a real story from his own care would make the post better.",
  ]
  if (previous)
    parts.push(
      `Your previous draft failed these checks. Fix every one and return the complete corrected post:\n${previous.problems.map((p) => `- ${p}`).join("\n")}\n\nPrevious draft:\n${JSON.stringify(previous.draft)}`
    )
  return parts.join("\n\n")
}

// --- Generation ------------------------------------------------------------

const DraftSchema = z.object({
  title: z.string().describe("Clear, specific, 40-70 characters"),
  slug: z.string().describe("lowercase-hyphenated, 3-7 words, no dates"),
  description: z
    .string()
    .describe("Meta description, 120-160 characters, plain sentence"),
  tags: z.array(z.string()).describe("1-4 short lowercase tags"),
  services: z
    .array(z.enum(services.map((s) => s.slug) as [string, ...string[]]))
    .describe("Service slugs the post is genuinely about"),
  locations: z
    .array(z.enum(locations.map((l) => l.slug) as [string, ...string[]]))
    .describe("Town slugs only if the post is specifically about them"),
  body_markdown: z.string(),
  review_notes: z.array(z.string()),
})
type Draft = z.infer<typeof DraftSchema>

const client = new Anthropic()

async function requestDraft(previous?: { draft: Draft; problems: string[] }) {
  const response = await client.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    output_config: { effort: "high", format: zodOutputFormat(DraftSchema) },
    system,
    messages: [{ role: "user", content: userPrompt(previous) }],
  })
  if (response.stop_reason === "refusal")
    throw new Error(
      `Model declined: ${response.stop_details?.explanation ?? "no detail"}`
    )
  if (response.stop_reason === "max_tokens")
    throw new Error("Draft was cut off at max_tokens.")
  if (!response.parsed_output) throw new Error("No structured draft returned.")
  console.error(
    `model=${response.model} input=${response.usage.input_tokens} output=${response.usage.output_tokens}`
  )
  return response.parsed_output
}

function toPost(draft: Draft) {
  const front: PostFrontmatter = {
    title: draft.title.trim(),
    description: draft.description.trim(),
    date: today,
    tags: draft.tags.map((t) => t.trim().toLowerCase()).slice(0, 4),
    services: [...new Set(draft.services)],
    locations: [...new Set(draft.locations)],
    draft: false,
  }
  const problems: string[] = []
  const checked = frontmatterSchema.safeParse(front)
  if (!checked.success)
    problems.push(
      ...checked.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`)
    )
  if (!postSlugPattern.test(draft.slug))
    problems.push(
      `slug "${draft.slug}" must be lowercase words joined by hyphens.`
    )
  if (existing.some((p) => p.slug === draft.slug))
    problems.push(
      `slug "${draft.slug}" is already used; pick a different angle and slug.`
    )
  const post = buildPost(front, draft.body_markdown, draft.slug)
  problems.push(
    ...validatePost(
      post,
      existing.map((p) => p.slug)
    )
  )
  return { post, problems }
}

let draft = await requestDraft()
let result = toPost(draft)
for (
  let attempt = 2;
  result.problems.length && attempt <= MAX_ATTEMPTS;
  attempt++
) {
  console.error(
    `Draft failed checks, retrying:\n- ${result.problems.join("\n- ")}`
  )
  draft = await requestDraft({ draft, problems: result.problems })
  result = toPost(draft)
}
if (result.problems.length) {
  console.error(
    `Giving up; draft still fails checks:\n- ${result.problems.join("\n- ")}`
  )
  process.exit(1)
}

// --- Output ----------------------------------------------------------------

const { post } = result
const { slug, body, wordCount } = post
const fileContents = serializePost(frontmatterSchema.parse(post), body)

if (args["dry-run"]) {
  console.log(fileContents)
  console.log(
    "\nReview notes:\n" + draft.review_notes.map((n) => `- ${n}`).join("\n")
  )
  process.exit(0)
}

const file = path.join(BLOG_DIR, `${slug}.md`)
fs.mkdirSync(BLOG_DIR, { recursive: true })
fs.writeFileSync(file, fileContents)
queued?.consume()
console.error(
  `Wrote ${path.relative(process.cwd(), file)} (${wordCount} words)`
)

if (args["pr-body"]) {
  const notes = draft.review_notes.length
    ? draft.review_notes.map((n) => `- [ ] ${n}`).join("\n")
    : "- [ ] Read the full post for accuracy and tone."
  fs.writeFileSync(
    args["pr-body"],
    `## ${post.title}

${post.description}

- Topic: ${topic ?? "chosen by the drafting job (queue was empty)"}
- File: \`content/blog/${slug}.md\` · ${wordCount} words
- Will publish at ${site.url}/blog/${slug} when merged. Check the Vercel preview first.

### Before merging

${notes}
- [ ] Everything described matches how you actually work; edit freely in this PR.
- [ ] Optional: add a real photo or a short story from your own care.

Close this PR without merging to skip the post. Drafts are written by Claude (${MODEL}) from the facts in \`lib/content.ts\` and checked for unknown links, unpublished prices, raw HTML, and length (at least ${MIN_WORDS} words).
`
  )
}
// Slug and title for the workflow to name the branch and PR.
console.log(JSON.stringify({ slug, title: post.title }))
