"use client"
import { Analytics } from "@vercel/analytics/react"
import { track } from "@vercel/analytics"
import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import Script from "next/script"
export function conversion(name: string) {
  if (process.env.NEXT_PUBLIC_VERCEL_ANALYTICS === "true") track(name)
  if (typeof window !== "undefined" && "gtag" in window)
    (window.gtag as (name: string, event: string) => void)("event", name)
}
export function AnalyticsProvider() {
  const path = usePathname()
  const ga = process.env.NEXT_PUBLIC_GA_ID
  const [analyticsReady, setAnalyticsReady] = useState(false)
  const previousPage = useRef<string | null>(null)
  useEffect(() => {
    if (!analyticsReady || !("gtag" in window)) return
    const pageLocation = window.location.href
    if (previousPage.current === pageLocation) return
    const gtag = window.gtag as (
      command: string,
      event: string,
      parameters: Record<string, string>
    ) => void
    gtag("event", "page_view", {
      page_location: pageLocation,
      page_title: document.title,
      page_referrer: previousPage.current ?? document.referrer,
    })
    previousPage.current = pageLocation
  }, [path, analyticsReady])
  useEffect(() => {
    if (path.startsWith("/services/")) conversion("service_page_viewed")
    if (path === "/refer") conversion("referral_page_viewed")
  }, [path])
  return (
    <>
      {process.env.NEXT_PUBLIC_VERCEL_ANALYTICS === "true" && <Analytics />}
      {ga && /^G-[A-Z0-9]+$/.test(ga) && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ga}`}
            strategy="afterInteractive"
          />
          <Script
            id="google-analytics"
            strategy="afterInteractive"
            onReady={() => setAnalyticsReady(true)}
          >{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga}',{send_page_view:false});`}</Script>
        </>
      )}
    </>
  )
}
