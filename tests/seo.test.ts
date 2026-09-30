import { expect, test } from "bun:test"
import sitemap from "../app/sitemap"
import robots from "../app/robots"
import { businessSchema, pageMetadata, serviceSchema } from "../lib/seo"
import { services, locations, site } from "../lib/content"

test("public canonical origin is the apex domain", () => {
  expect(site.url).toBe("https://drewspets.com")
  expect(sitemap().some(({ url }) => url === "https://drewspets.com")).toBe(
    true
  )
})

test("sitemap excludes non-acquisition routes", () => {
  const urls = sitemap().map(({ url }) => url)
  expect(urls).not.toContain("https://drewspets.com/apply")
  expect(urls).not.toContain("https://drewspets.com/refer")
})

test("robots blocks API routes while allowing public pages", () => {
  const rules = robots().rules
  expect(rules).toEqual([
    { userAgent: "*", allow: "/", disallow: ["/api/"] },
    {
      userAgent: ["OAI-SearchBot", "ChatGPT-User", "PerplexityBot"],
      allow: "/",
      disallow: ["/api/"],
    },
  ])
  expect(robots().sitemap).toBe("https://drewspets.com/sitemap.xml")
})

test("every acquisition page has a unique canonical sitemap URL", () => {
  const urls = sitemap().map(({ url }) => url)
  expect(new Set(urls).size).toBe(urls.length)
  for (const path of [
    "/services",
    "/locations",
    "/guides/pet-sitting-rates",
    ...services.map((s) => `/services/${s.slug}`),
    ...locations.map((l) => `/locations/${l.slug}`),
  ]) {
    expect(urls).toContain(site.url + path)
    const metadata = pageMetadata("Local pet care", "Care by Drew", path)
    expect(metadata.alternates?.canonical).toBe(path)
    expect(metadata.openGraph).toMatchObject({
      url: site.url + path,
      description: "Care by Drew",
    })
    expect(metadata.twitter).toMatchObject({ description: "Care by Drew" })
  }
})

test("service offers use published prices and omit unquoted prices", () => {
  for (const service of services) {
    const schema = serviceSchema(service)
    expect(schema.provider["@id"]).toBe(site.url + "/#business")
    expect(schema.areaServed).toHaveLength(locations.length)
    if (service.price === null) expect(schema).not.toHaveProperty("offers")
    else
      expect(schema.offers).toMatchObject({
        price: service.price / 100,
        priceCurrency: "USD",
      })
  }
})

test("business identity uses real service-area facts without invented endorsements", () => {
  const graph = businessSchema()["@graph"]
  const business = graph.find((node) => node["@type"] === "LocalBusiness")
  expect(business).toMatchObject({
    "@id": site.url + "/#business",
    address: {
      addressLocality: "Fox River Grove",
      postalCode: "60021",
      addressRegion: "IL",
    },
  })
  expect(business).not.toHaveProperty("aggregateRating")
  expect(business).not.toHaveProperty("review")
  expect(
    business && "address" in business ? business.address : undefined
  ).not.toHaveProperty("streetAddress")
})
