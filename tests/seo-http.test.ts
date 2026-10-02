import { beforeAll, describe, expect, test } from "bun:test"
import { locations, site } from "../lib/content"

// Run against a local production build: SEO_TEST_BASE_URL=http://localhost:3000 bun test tests/seo-http.test.ts
const baseUrl = process.env.SEO_TEST_BASE_URL

describe.skipIf(!baseUrl)("rendered local-search pages", () => {
  const pages = new Map<string, { status: number; html: string }>()
  beforeAll(async () => {
    const paths = [
      "/",
      "/locations",
      "/sitemap.xml",
      "/robots.txt",
      "/contact",
      "/guides/pet-sitting-rates",
      "/services/house-sitting",
      ...locations.map((location) => `/locations/${location.slug}`),
      "/locations/not-a-service-area",
      "/services/not-a-service",
    ]
    await Promise.all(
      paths.map(async (path) => {
        const response = await fetch(new URL(path, baseUrl))
        pages.set(path, {
          status: response.status,
          html: await response.text(),
        })
      })
    )
  }, 30_000)

  test("every town has indexable HTML, one self-canonical, matching schema and directory links", () => {
    const homepage = pages.get("/")!.html
    const directory = pages.get("/locations")!.html
    const sitemap = pages.get("/sitemap.xml")!.html
    for (const location of locations) {
      const path = `/locations/${location.slug}`
      const page = pages.get(path)!
      expect(page.status).toBe(200)
      expect(page.html).toContain(
        `Dog Sitting &amp; Pet Care in ${location.name}, IL`
      )
      expect(page.html).toContain(location.copy)
      expect(page.html).toContain(location.answer)
      expect(page.html).not.toMatch(/<meta[^>]+content="[^"]*noindex/)
      const canonicalTags =
        page.html.match(/<link\b[^>]*rel="canonical"[^>]*>/g) ?? []
      expect(canonicalTags).toHaveLength(1)
      expect(canonicalTags[0]).toContain(`href="${site.url}${path}"`)
      const schemas = [
        ...page.html.matchAll(
          /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g
        ),
      ].map((match) => JSON.parse(match[1]))
      expect(
        schemas.some(
          (schema) =>
            schema["@type"] === "WebPage" &&
            schema.mainEntity.areaServed.name === `${location.name}, Illinois`
        )
      ).toBe(true)
      expect(schemas.some((schema) => schema["@type"] === "FAQPage")).toBe(true)
      expect(homepage).toContain(`href="${path}"`)
      expect(directory).toContain(`href="${path}"`)
      expect(sitemap).toContain(`<loc>${site.url}${path}</loc>`)
      for (const nearby of location.nearby) {
        const neighbor = locations.find((entry) => entry.name === nearby)!
        expect(page.html).toContain(`href="/locations/${neighbor.slug}"`)
      }
    }
  })

  test("unknown town and service URLs return real 404s", () => {
    for (const path of [
      "/locations/not-a-service-area",
      "/services/not-a-service",
    ]) {
      const page = pages.get(path)!
      expect(page.status).toBe(404)
      expect(page.html).toContain('content="noindex"')
    }
  })

  test("contact, rates and service pages describe the same expanded coverage", () => {
    for (const path of [
      "/contact",
      "/guides/pet-sitting-rates",
      "/services/house-sitting",
    ]) {
      const page = pages.get(path)!
      expect(page.status).toBe(200)
      for (const town of [
        "Huntley",
        "Wauconda",
        "Island Lake",
        "Lake Barrington",
      ]) {
        expect(page.html).toContain(town)
      }
      expect(page.html).toContain(
        "Fox River Grove and Cary are the core service area."
      )
    }
  })

  test("homepage and crawler endpoints retain production discovery settings", () => {
    expect(pages.get("/")!.status).toBe(200)
    expect(pages.get("/")!.html).toContain(
      "Dog Sitting &amp; Pet Sitting in Fox River Grove &amp; Cary, IL"
    )
    expect(pages.get("/robots.txt")!.html).toContain(
      `Sitemap: ${site.url}/sitemap.xml`
    )
    expect(pages.get("/robots.txt")!.html).not.toContain("Disallow: /\n")
    expect(pages.get("/sitemap.xml")!.status).toBe(200)
  })
})
