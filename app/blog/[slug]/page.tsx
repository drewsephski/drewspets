import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowUpRight } from "@/components/site/arrows"
import {
  Breadcrumbs,
  FinalCTA,
  JsonLd,
  PageIntro,
} from "@/components/site/shared"
import { coverageSummary, locations, services, site } from "@/lib/content"
import { getPost, getPosts, renderMarkdown } from "@/lib/blog"
import { pageMetadata } from "@/lib/seo"
import { formatPostDate } from "../format"

export const dynamicParams = false
export const generateStaticParams = () =>
  getPosts().map((post) => ({ slug: post.slug }))

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) notFound()
  const base = pageMetadata(post.title, post.description, `/blog/${slug}`)
  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      authors: [`${site.url}/about`],
      tags: post.tags,
    },
  }
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) notFound()
  const url = `${site.url}/blog/${slug}`
  const relatedServices = services.filter((s) => post.services.includes(s.slug))
  const relatedTowns = locations.filter((l) => post.locations.includes(l.slug))
  const morePosts = getPosts()
    .filter((p) => p.slug !== slug)
    .slice(0, 3)
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "@id": `${url}#article`,
          url,
          headline: post.title,
          description: post.description,
          datePublished: post.date,
          dateModified: post.updated ?? post.date,
          wordCount: post.wordCount,
          keywords: post.tags,
          author: {
            "@type": "Person",
            "@id": `${site.url}/#drew`,
            name: "Drew",
            url: `${site.url}/about`,
          },
          publisher: { "@id": `${site.url}/#business` },
          isPartOf: { "@id": `${site.url}/blog#blog` },
          mainEntityOfPage: url,
          inLanguage: "en-US",
        }}
      />
      <article className="shell inner-page reading-page">
        <Breadcrumbs
          name={post.title}
          path={`/blog/${slug}`}
          parent={{ name: "Blog", path: "/blog" }}
        />
        <PageIntro
          title={post.title}
          description={post.description}
        />
        <p className="post-meta text-center">
          By{" "}
          <Link href="/about" className="underline">
            Drew, your local pet sitter
          </Link>{" "}
          · <time dateTime={post.date}>{formatPostDate(post.date)}</time>
          {post.updated && post.updated !== post.date && (
            <>
              {" "}
              · Updated{" "}
              <time dateTime={post.updated}>
                {formatPostDate(post.updated)}
              </time>
            </>
          )}{" "}
          · {post.readingMinutes} min read
        </p>
        <div
          className="post-body"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(post.body) }}
        />
        <aside className="panel post-aside">
          <h2>Need a hand with your pet?</h2>
          <p>{coverageSummary}</p>
          {(relatedServices.length > 0 || relatedTowns.length > 0) && (
            <div className="service-link-list">
              {relatedServices.map((s) => (
                <Link key={s.slug} href={`/services/${s.slug}`}>
                  {s.name}
                  <ArrowUpRight size={16} />
                </Link>
              ))}
              {relatedTowns.map((l) => (
                <Link key={l.slug} href={`/locations/${l.slug}`}>
                  Pet care in {l.name}, IL
                  <ArrowUpRight size={16} />
                </Link>
              ))}
            </div>
          )}
          <Link href="/book" className="text-link">
            Send a free care request <ArrowUpRight size={16} />
          </Link>
        </aside>
        {morePosts.length > 0 && (
          <nav aria-label="More posts" className="post-more">
            <span className="eyebrow">MORE FROM THE BLOG</span>
            <div className="service-link-list">
              {morePosts.map((p) => (
                <Link key={p.slug} href={`/blog/${p.slug}`}>
                  {p.title}
                  <ArrowUpRight size={16} />
                </Link>
              ))}
            </div>
          </nav>
        )}
      </article>
      <FinalCTA />
    </>
  )
}
