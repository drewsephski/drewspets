import { expect, test } from "bun:test"
import sitemap from "../app/sitemap"
import robots from "../app/robots"
import {
  aboutSchema,
  businessSchema,
  locationMetadata,
  locationSchema,
  pageMetadata,
  serviceSchema,
} from "../lib/seo"
import {
  services,
  locations,
  site,
  coverageSummary,
  faqs,
} from "../lib/content"

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
    "/about",
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

test("public profiles connect the business and sitter to the correct entities", () => {
  const graph = businessSchema()["@graph"]
  const business = graph.find((node) => node["@type"] === "LocalBusiness")
  const sitter = graph.find((node) => node["@type"] === "Person")
  expect(business).toMatchObject({
    telephone: site.phone,
    sameAs: [site.googleMapsUrl],
    logo: `${site.url}/brand/dog-portrait.png`,
  })
  expect(sitter).toMatchObject({
    url: `${site.url}/about`,
    sameAs: ["https://drew.sitterfolio.com/"],
  })
  // Sitterfolio currently has a different business label. It identifies Drew,
  // not a second local branch or a verified business name alias.
  expect(business?.sameAs).not.toContain(site.sitterProfileUrl)
  expect(aboutSchema()).toMatchObject({
    "@type": "AboutPage",
    url: `${site.url}/about`,
    mainEntity: { "@id": `${site.url}/#drew` },
    about: { "@id": `${site.url}/#business` },
  })
})

test("expanded towns are discoverable with accurate coverage and no broken nearby links", () => {
  for (const [name, zip] of [
    ["Huntley", "60142"],
    ["Wauconda", "60084"],
    ["Island Lake", "60042"],
    ["Lake Barrington", "60010"],
  ]) {
    const location = locations.find((entry) => entry.name === name)
    expect(location).toMatchObject({ zip, core: false })
    expect(coverageSummary).toContain(name)
    expect(faqs[0][1]).toContain(name)
    expect(
      locations.some((entry) => entry.nearby.some((nearby) => nearby === name))
    ).toBe(true)
  }
  expect(
    locations.filter((entry) => entry.core).map((entry) => entry.name)
  ).toEqual(["Fox River Grove", "Cary"])
  const names = new Set<string>(locations.map((entry) => entry.name))
  for (const location of locations) {
    for (const nearby of location.nearby) {
      expect(names.has(nearby)).toBe(true)
      expect(nearby).not.toBe(location.name)
    }
  }
  for (const field of ["slug", "copy", "context", "faq", "answer"] as const) {
    expect(new Set(locations.map((entry) => entry[field])).size).toBe(
      locations.length
    )
  }
})

test("town metadata and markup identify the service without inventing local branches", () => {
  const business = businessSchema()["@graph"].find(
    (node) => node["@type"] === "LocalBusiness"
  )
  const areas = business && "areaServed" in business ? business.areaServed : []
  expect(areas).toHaveLength(locations.length)
  for (const location of locations) {
    const url = `${site.url}/locations/${location.slug}`
    const metadata = locationMetadata(location)
    expect(metadata.title).toBe(
      `Dog Sitting & Pet Care in ${location.name}, IL`
    )
    expect(metadata.description).toContain(location.zip)
    expect(metadata.alternates?.canonical).toBe(`/locations/${location.slug}`)
    expect(locationSchema(location)).toMatchObject({
      "@type": "WebPage",
      url,
      description: location.copy,
      mainEntity: {
        "@type": "Service",
        provider: { "@id": site.url + "/#business" },
        areaServed: { name: `${location.name}, Illinois` },
      },
    })
    expect(locationSchema(location).mainEntity).not.toHaveProperty("address")
    expect(areas).toContainEqual({
      "@type": "City",
      name: `${location.name}, Illinois`,
      url,
    })
  }
})
