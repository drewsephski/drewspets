import type { Metadata } from "next"
import { DM_Sans, Manrope, Lora } from "next/font/google"
import { Header } from "@/components/site/header"
import { Footer } from "@/components/site/shared"
import { JsonLd } from "@/components/site/shared"
import { businessSchema } from "@/lib/seo"
import { site } from "@/lib/content"
import { AnalyticsProvider } from "@/components/site/analytics"
import "./globals.css"
const body = DM_Sans({ subsets: ["latin"], variable: "--font-body" })
const heading = Manrope({ subsets: ["latin"], variable: "--font-display" })
const editorial = Lora({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-editorial",
})
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default:
      "Drew’s Pet Care | Pet Sitting & Dog Walking in Fox River Grove, IL",
    template: "%s | Drew’s Pet Care",
  },
  description: site.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: site.name,
    title: "Your local pet person. Drew’s Pet Care",
    description: site.description,
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: site.name,
    description: site.description,
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    other: process.env.BING_SITE_VERIFICATION
      ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION }
      : undefined,
  },
}
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${body.variable} ${heading.variable} ${editorial.variable}`}
    >
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <JsonLd data={businessSchema()} />
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <AnalyticsProvider />
      </body>
    </html>
  )
}
