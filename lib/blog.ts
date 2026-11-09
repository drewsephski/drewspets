import fs from "node:fs"
import path from "node:path"
import { Marked } from "marked"
import { z } from "zod"
import { locations, money, referral, services } from "./content"

// Posts live as Markdown files in content/blog/<slug>.md. Files whose names
// start with "_" are ignored, so templates and notes can sit beside posts.
export const BLOG_DIR = path.join(process.cwd(), "content", "blog")

const serviceSlugs = services.map((s) => s.slug) as [string, ...string[]]
const locationSlugs = locations.map((l) => l.slug) as [string, ...string[]]
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")

export const postSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const frontmatterSchema = z.object({
  title: z.string().min(10).max(90),
  description: z.string().min(50).max(170),
  date: isoDate,
  updated: isoDate.optional(),
  tags: z.array(z.string()).default([]),
  services: z.array(z.enum(serviceSlugs)).default([]),
  locations: z.array(z.enum(locationSlugs)).default([]),
  draft: z.boolean().default(false),
})

export type PostFrontmatter = z.infer<typeof frontmatterSchema>
export type Post = PostFrontmatter & {
  slug: string
  body: string
  wordCount: number
  readingMinutes: number
}

/**
 * Minimal frontmatter: one `key: value` per line. Quoted strings, arrays and
 * booleans are JSON (`title: "..."`, `tags: ["a", "b"]`, `draft: true`); bare
 * values are read as plain strings.
 */
export function parsePostFile(raw: string, slug: string): Post {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) throw new Error(`${slug}: missing --- frontmatter block`)
  const data: Record<string, unknown> = {}
  for (const line of match[1].split(/\r?\n/)) {
    if (!line.trim() || line.trimStart().startsWith("#")) continue
    const sep = line.indexOf(":")
    if (sep === -1) throw new Error(`${slug}: bad frontmatter line "${line}"`)
    const key = line.slice(0, sep).trim()
    const value = line.slice(sep + 1).trim()
    data[key] = /^["[]|^(true|false)$/.test(value) ? JSON.parse(value) : value
  }
  const result = frontmatterSchema.safeParse(data)
  if (!result.success)
    throw new Error(
      `${slug}: invalid frontmatter\n${z.prettifyError(result.error)}`
    )
  return buildPost(result.data, match[2], slug)
}

export function buildPost(
  front: PostFrontmatter,
  markdown: string,
  slug: string
): Post {
  const body = markdown.trim()
  const wordCount = countWords(body)
  return {
    ...front,
    slug,
    body,
    wordCount,
    readingMinutes: Math.max(1, Math.round(wordCount / 220)),
  }
}

export function serializePost(front: PostFrontmatter, body: string) {
  const lines = Object.entries(front)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
  return `---\n${lines.join("\n")}\n---\n\n${body.trim()}\n`
}

function countWords(markdown: string) {
  return markdown
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .split(/\s+/)
    .filter((w) => /[a-z0-9]/i.test(w)).length
}

/** Every post on disk, including drafts, newest first. */
export function readAllPostFiles(dir = BLOG_DIR): Post[] {
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
    .map((file) => {
      const slug = file.replace(/\.md$/, "")
      if (!postSlugPattern.test(slug))
        throw new Error(
          `${file}: file name must be a lowercase-hyphenated slug`
        )
      return parsePostFile(fs.readFileSync(path.join(dir, file), "utf8"), slug)
    })
    .sort(
      (a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug)
    )
}

let cache: Post[] | undefined
/** Published posts (draft: false), newest first. */
export function getPosts(): Post[] {
  cache ??= readAllPostFiles().filter((p) => !p.draft)
  return cache
}

export const getPost = (slug: string) => getPosts().find((p) => p.slug === slug)

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

// Raw HTML in Markdown is escaped, never rendered, and the page title is the
// only h1: body headings start at h2.
const marked = new Marked({
  gfm: true,
  renderer: {
    html({ text }) {
      return escapeHtml(text)
    },
    heading({ tokens, depth }) {
      const level = Math.min(Math.max(depth, 2), 4)
      return `<h${level}>${this.parser.parseInline(tokens)}</h${level}>\n`
    },
  },
})

export const renderMarkdown = (markdown: string) =>
  marked.parse(markdown, { async: false })

// ---------------------------------------------------------------------------
// Editorial guardrails, shared by tests and the drafting script.

export const MIN_WORDS = 500

/** Site paths a post may link to. */
export function publishedPaths(postSlugs: string[] = []) {
  return new Set([
    "/",
    "/about",
    "/services",
    "/locations",
    "/guides/pet-sitting-rates",
    "/book",
    "/contact",
    "/blog",
    ...services.map((s) => `/services/${s.slug}`),
    ...locations.map((l) => `/locations/${l.slug}`),
    ...postSlugs.map((slug) => `/blog/${slug}`),
  ])
}

/** Dollar amounts the business actually publishes. */
export function publishedPrices() {
  return new Set([
    ...services.flatMap((s) => (s.price === null ? [] : [money(s.price)])),
    referral.credit,
  ])
}

export function validatePost(post: Post, postSlugs: string[] = []): string[] {
  const problems: string[] = []
  const paths = publishedPaths(postSlugs)
  const prices = publishedPrices()
  if (post.wordCount < MIN_WORDS)
    problems.push(
      `Only ${post.wordCount} words; aim for at least ${MIN_WORDS}.`
    )
  if (/^#\s/m.test(post.body))
    problems.push("Use ## headings in the body; the title is the only h1.")
  if (/<[a-z!/][^>]*>/i.test(post.body))
    problems.push("Raw HTML is not rendered; use Markdown only.")
  for (const [, href] of post.body.matchAll(/\]\(([^)\s]+)[^)]*\)/g)) {
    if (href.startsWith("/")) {
      const route = href.split(/[?#]/)[0].replace(/(.)\/$/, "$1")
      if (!paths.has(route)) problems.push(`Link to unknown page: ${href}`)
    } else if (!href.startsWith("https://")) {
      problems.push(`Links must be site paths or https URLs: ${href}`)
    }
  }
  for (const [amount] of post.body.matchAll(/\$\d+(?:\.\d{2})?/g)) {
    const normalized = amount.replace(/\.00$/, "")
    if (!prices.has(normalized))
      problems.push(
        `${amount} is not a published price (${[...prices].join(", ")}).`
      )
  }
  return problems
}
