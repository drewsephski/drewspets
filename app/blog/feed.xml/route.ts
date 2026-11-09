import { site } from "@/lib/content"
import { getPosts } from "@/lib/blog"

export const dynamic = "force-static"

const xml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")

export function GET() {
  const posts = getPosts().slice(0, 30)
  const items = posts
    .map((post) => {
      const url = `${site.url}/blog/${post.slug}`
      return `    <item>
      <title>${xml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(`${post.date}T12:00:00Z`).toUTCString()}</pubDate>
      <description>${xml(post.description)}</description>
    </item>`
    })
    .join("\n")
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xml(site.name)} Blog</title>
    <link>${site.url}/blog</link>
    <atom:link href="${site.url}/blog/feed.xml" rel="self" type="application/rss+xml" />
    <description>Pet care tips from Drew in Fox River Grove, IL.</description>
    <language>en-us</language>
${items}
  </channel>
</rss>
`
  return new Response(body, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  })
}
