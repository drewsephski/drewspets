"use client"
import { Analytics } from "@vercel/analytics/react"
import { track } from "@vercel/analytics"
import { useEffect } from "react"
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
          >{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga}',{send_page_view:false});`}</Script>
        </>
      )}
    </>
  )
}
