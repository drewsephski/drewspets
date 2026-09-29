import { expect, test } from "bun:test"
import sitemap from "../app/sitemap"
import robots from "../app/robots"
import { site } from "../lib/content"

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
  expect(robots().rules).toMatchObject({
    userAgent: "*",
    allow: "/",
    disallow: ["/api/"],
  })
  expect(robots().sitemap).toBe("https://drewspets.com/sitemap.xml")
})
