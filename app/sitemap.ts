import type { MetadataRoute } from "next"
import { services, locations, site } from "@/lib/content"
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    "",
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
}
