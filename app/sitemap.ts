import type { MetadataRoute } from "next"
import { services, locations, site } from "@/lib/content"
import { getPosts } from "@/lib/blog"
export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getPosts()
  const pages: MetadataRoute.Sitemap = [
    "",
    "/about",
    "/services",
    "/locations",
    "/guides/pet-sitting-rates",
    "/book",
    "/contact",
    "/privacy",
    "/terms",
    ...services.map((s) => `/services/${s.slug}`),
    ...locations.map((l) => `/locations/${l.slug}`),
  ].map((path) => ({
    url: site.url + path,
    changeFrequency: path ? "monthly" : "weekly",
    priority: path ? 0.7 : 1,
  }))
  if (!posts.length) return pages
  return [
    ...pages,
    {
      url: `${site.url}/blog`,
      lastModified: posts[0].updated ?? posts[0].date,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    ...posts.map((post) => ({
      url: `${site.url}/blog/${post.slug}`,
      lastModified: post.updated ?? post.date,
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
  ]
}
