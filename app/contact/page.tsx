import { ArrowUpRight } from "@/components/site/arrows"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PageIntro } from "@/components/site/shared"
import { InquiryForm } from "@/components/forms/inquiry-form"
import { coverageSummary, site } from "@/lib/content"
import { pageMetadata } from "@/lib/seo"
export const metadata = pageMetadata(
  "Contact Drew for Pet Sitting in Fox River Grove & Cary",
  "Ask Drew about pet sitting, dog walks, overnight care and coverage in Fox River Grove, Cary and nearby Illinois towns. Call, text or send a care request.",
  "/contact"
)
export default function Contact() {
  return (
    <div className="shell inner-page reading-page">
      <PageIntro
        eyebrow="CONTACT DREW"
        title="Questions about pet care?"
        description="Ask about dates, services, or whether I cover your neighborhood. I’ll get back to you personally."
      />
      <div className="content-grid reading-grid">
        <InquiryForm />
        <aside className="panel">
          <h3>Have dates in mind?</h3>
          <p>
            The booking request collects the details I need to check
            availability. There’s no payment or commitment to get started.
          </p>
          <Button
            nativeButton={false}
            render={<Link href="/book" />}
            className="site-button mt-5"
            size="lg"
          >
            Request pet care <ArrowUpRight size={16} />
          </Button>
          <h3 style={{ marginTop: 35 }}>Close to home</h3>
          <p>{coverageSummary}</p>
          <h3 style={{ marginTop: 28 }}>A personal response</h3>
          <p>
            I review messages between care visits. If you have upcoming dates,
            include them so I can help you plan. This form is not monitored for
            emergencies.
          </p>
          {process.env.NEXT_PUBLIC_CONTACT_EMAIL && (
            <p>
              <a
                className="text-link"
                href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL}`}
              >
                {process.env.NEXT_PUBLIC_CONTACT_EMAIL}
              </a>
            </p>
          )}
          <p>
            <a className="text-link" href={`tel:${site.phone}`}>
              Call Drew: {site.phone}
            </a>
          </p>
          <p>
            <a className="text-link" href={`sms:${site.phone}`}>
              Text Drew
            </a>
          </p>
          <p>
            <a className="text-link" href={site.googleMapsUrl}>
              Find Drew’s Pet Care on Google
            </a>
          </p>
        </aside>
      </div>
    </div>
  )
}
