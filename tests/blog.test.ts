import { expect, test } from "bun:test"
import sitemap from "../app/sitemap"
import {
  buildPost,
  getPosts,
  parsePostFile,
  readAllPostFiles,
  renderMarkdown,
  serializePost,
  validatePost,
  type PostFrontmatter,
} from "../lib/blog"
import { site } from "../lib/content"

const front: PostFrontmatter = {
  title: "How to prepare for a holiday pet sitter",
  description:
    "What to leave out, what to tell your sitter, and how to make the first visit easy for your dog or cat while you travel.",
  date: "2026-11-09",
  tags: ["travel"],
  services: ["house-sitting"],
  locations: [],
  draft: false,
}
const words = (n: number) => Array.from({ length: n }, () => "word").join(" ")

test("every committed post has valid frontmatter and passes editorial checks", () => {
  const posts = readAllPostFiles()
  const slugs = posts.map((p) => p.slug)
  expect(new Set(slugs).size).toBe(slugs.length)
  for (const post of posts)
    expect([post.slug, validatePost(post, slugs)]).toEqual([post.slug, []])
})

test("frontmatter round-trips through serialize and parse", () => {
  const body = "## Start early\n\nSend your dates and routine."
  const post = parsePostFile(serializePost(front, body), "holiday-prep")
  expect(post).toMatchObject({ ...front, slug: "holiday-prep", body })
  expect(post.wordCount).toBe(7)
})

test("invalid frontmatter is rejected with the file name", () => {
  expect(() =>
    parsePostFile('---\ntitle: "Short"\ndate: "Nov 9"\n---\nBody', "bad-post")
  ).toThrow(/bad-post: invalid frontmatter/)
  expect(() => parsePostFile("No frontmatter", "bare")).toThrow(/bare/)
})

test("editorial checks catch unknown links, unpublished prices, and HTML", () => {
  const body = `# Title again\n\nRates start at $55 per night, or $45 for short stays. <script>x</script>
[Book](/book?service=house-sitting) [Rates](/guides/pet-sitting-rates#top) [Missing](/blog/nope) [Ftp](ftp://x) ${words(500)}`
  const problems = validatePost(buildPost(front, body, "checks"))
  expect(problems).toEqual([
    expect.stringContaining("## headings"),
    expect.stringContaining("Raw HTML"),
    "Link to unknown page: /blog/nope",
    expect.stringContaining("ftp://x"),
    expect.stringContaining("$45 is not a published price"),
  ])
  expect(validatePost(buildPost(front, "Too short.", "short"))[0]).toContain(
    "Only 2 words"
  )
  expect(
    validatePost(
      buildPost(front, `[Other](/blog/other-post) ${words(500)}`, "x"),
      ["other-post"]
    )
  ).toEqual([])
})

test("Markdown rendering escapes raw HTML and keeps the title as the only h1", () => {
  const html = renderMarkdown(
    "# Heading\n\n<img src=x onerror=alert(1)>\n\n**Bold**"
  )
  expect(html).toContain("<h2>Heading</h2>")
  expect(html).not.toContain("<h1")
  expect(html).not.toContain("<img")
  expect(html).toContain("&lt;img")
  expect(html).toContain("<strong>Bold</strong>")
})

test("sitemap lists published posts and the blog index only when posts exist", () => {
  const urls = sitemap().map(({ url }) => url)
  const posts = getPosts()
  if (posts.length === 0) expect(urls).not.toContain(`${site.url}/blog`)
  else expect(urls).toContain(`${site.url}/blog`)
  for (const post of posts)
    expect(urls).toContain(`${site.url}/blog/${post.slug}`)
  for (const draft of readAllPostFiles().filter((p) => p.draft))
    expect(urls).not.toContain(`${site.url}/blog/${draft.slug}`)
})
