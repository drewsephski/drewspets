import Link from "next/link"
import { ArrowUpRight } from "@/components/site/arrows"
import {
  Breadcrumbs,
  FinalCTA,
  JsonLd,
  PageIntro,
} from "@/components/site/shared"
import { site } from "@/lib/content"
import { getPosts } from "@/lib/blog"
import { pageMetadata } from "@/lib/seo"
import { formatPostDate } from "./format"

const title = "Pet Care Blog: Local Tips from Drew"
const description =
  "Practical dog, cat, and puppy care notes from Drew, a pet sitter in Fox River Grove, IL. Routines, seasons, travel prep, and choosing the right kind of care."

export function generateMetadata() {
  const base = pageMetadata(title, description, "/blog")
  return {
    ...base,
    alternates: {
      ...base.alternates,
      types: { "application/rss+xml": "/blog/feed.xml" },
    },
    // An empty index is thin content; keep it out of search until posts exist.
    ...(getPosts().length === 0 ? { robots: { index: false } } : {}),
  }
}

export default function BlogIndex() {
  const posts = getPosts()
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Blog",
          "@id": `${site.url}/blog#blog`,
          url: `${site.url}/blog`,
          name: title,
          description,
          publisher: { "@id": `${site.url}/#business` },
          inLanguage: "en-US",
          blogPost: posts.map((post) => ({
            "@type": "BlogPosting",
            "@id": `${site.url}/blog/${post.slug}#article`,
            url: `${site.url}/blog/${post.slug}`,
            headline: post.title,
            datePublished: post.date,
          })),
        }}
      />
      <div className="shell inner-page reading-page">
        <Breadcrumbs name="Blog" path="/blog" />
        <PageIntro
          eyebrow="NOTES FROM DREW"
          title="Pet care tips from Fox River Grove"
          description="Short, practical guides on routines, seasons, travel prep, and choosing the right kind of care for your dog or cat."
        />
        {posts.length ? (
          <ol className="post-list">
            {posts.map((post) => (
              <li key={post.slug} className="panel">
                <p className="post-meta">
                  <time dateTime={post.date}>{formatPostDate(post.date)}</time>{" "}
                  · {post.readingMinutes} min read
                </p>
                <h2>
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h2>
                <p>{post.description}</p>
                <Link href={`/blog/${post.slug}`} className="text-link">
                  Read the post <ArrowUpRight size={16} />
                </Link>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-center" style={{ paddingBottom: 60 }}>
            The first posts are on their way. In the meantime, the{" "}
            <Link href="/guides/pet-sitting-rates" className="underline">
              rates & care guide
            </Link>{" "}
            answers the most common questions.
          </p>
        )}
      </div>
      <FinalCTA />
    </>
  )
}
