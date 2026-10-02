import type { Metadata } from "next"
import { locations, services, site } from "./content"
import type { Location } from "./content"

export function pageMetadata(
  title: string,
  description: string,
  path: string
): Metadata {
  const url = new URL(path, site.url).href
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: site.name,
      title: `${title} | ${site.name}`,
      description,
      url,
      images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${site.name}`,
      description,
      images: ["/opengraph-image"],
    },
  }
}

export const serviceAreas = locations.map((location) => ({
  "@type": "City",
  name: `${location.name}, Illinois`,
  url: `${site.url}/locations/${location.slug}`,
}))

export function locationMetadata(location: Location): Metadata {
  return pageMetadata(
    `Dog Sitting & Pet Care in ${location.name}, IL`,
    `Dog sitter Drew welcomes requests in ${location.name}, IL ${location.zip}. Overnight house sitting from $55/night; walks and cat visits from $22. Check coverage.`,
    `/locations/${location.slug}`
  )
}

export function locationSchema(location: Location) {
  const url = `${site.url}/locations/${location.slug}`
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: `Dog Sitting & Pet Care in ${location.name}, IL`,
    description: location.copy,
    isPartOf: { "@id": `${site.url}/#website` },
    mainEntity: {
      "@type": "Service",
      "@id": `${url}#service`,
      url,
      name: `Dog sitting and pet care in ${location.name}, IL`,
      description: location.copy,
      serviceType: ["Dog sitting", "Pet sitting", "Dog walking", "Cat sitting"],
      provider: { "@id": `${site.url}/#business` },
      areaServed: {
        "@type": "City",
        name: `${location.name}, Illinois`,
      },
    },
  }
}

export function serviceSchema(service: (typeof services)[number]) {
  const url = `${site.url}/services/${service.slug}`
  return {
    "@type": "Service",
    "@id": `${url}#service`,
    url,
    name: service.name,
    serviceType: service.name,
    description: service.description,
    provider: { "@id": `${site.url}/#business` },
    areaServed: serviceAreas,
    ...(service.price !== null
      ? {
          offers: {
            "@type": "Offer",
            url,
            price: service.price / 100,
            priceCurrency: "USD",
            description: `Starting rate per ${service.unit}; final quote required. Availability, holidays, additional pets and care needs affect pricing.`,
          },
        }
      : {}),
  }
}

export function businessSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "@id": `${site.url}/#business`,
        name: site.name,
        url: site.url,
        description: site.description,
        image: `${site.url}/images/drew-walking-with-dog.jpg`,
        address: {
          "@type": "PostalAddress",
          addressLocality: "Fox River Grove",
          addressRegion: "IL",
          postalCode: "60021",
          addressCountry: "US",
        },
        areaServed: serviceAreas,
        founder: { "@id": `${site.url}/#drew` },
        ...(process.env.NEXT_PUBLIC_CONTACT_PHONE
          ? { telephone: process.env.NEXT_PUBLIC_CONTACT_PHONE }
          : {}),
        ...(process.env.NEXT_PUBLIC_CONTACT_EMAIL
          ? { email: process.env.NEXT_PUBLIC_CONTACT_EMAIL }
          : {}),
      },
      {
        "@type": "Person",
        "@id": `${site.url}/#drew`,
        name: "Drew",
        url: `${site.url}/#about`,
        jobTitle: "Pet sitter and dog walker",
        image: `${site.url}/images/drew-and-dog-at-home.jpg`,
        worksFor: { "@id": `${site.url}/#business` },
      },
      {
        "@type": "WebSite",
        "@id": `${site.url}/#website`,
        url: site.url,
        name: site.name,
        publisher: { "@id": `${site.url}/#business` },
        inLanguage: "en-US",
      },
    ],
  }
}
