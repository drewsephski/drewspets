import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowUpRight } from "lucide-react"
import { PageIntro } from "@/components/site/shared"
import { InquiryForm } from "@/components/forms/inquiry-form"
export const metadata = {
  title: "Contact Drew",
  description:
    "A question about pet care in Fox River Grove or nearby? Reach out to Drew personally.",
  alternates: { canonical: "/contact" },
}
export default function Contact() {
  return (
    <div className="shell">
      <PageIntro
        eyebrow="LET’S TALK."
        title="A real person, right here."
        description="Questions about a routine, your neighborhood, or finding the right care? I’m happy to talk it through."
      />
      <div className="content-grid">
        <InquiryForm />
        <aside className="panel">
          <h3>Have dates in mind?</h3>
          <p>
            The booking request collects the details I need to check
            availability. There’s no payment or commitment to get started.
          </p>
          <Button nativeButton={false} render={<Link href="/book" />} className="site-button mt-5" size="lg">
            Request pet care <ArrowUpRight size={16} />
          </Button>
          <h3 style={{ marginTop: 35 }}>Close to home</h3>
          <p>
            Fox River Grove, Cary, Barrington, Crystal Lake, Algonquin, Lake in
            the Hills, and nearby communities.
          </p>
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
          {process.env.NEXT_PUBLIC_CONTACT_PHONE && (
            <p>
              <a
                className="text-link"
                href={`tel:${process.env.NEXT_PUBLIC_CONTACT_PHONE}`}
              >
                {process.env.NEXT_PUBLIC_CONTACT_PHONE}
              </a>
            </p>
          )}
        </aside>
      </div>
    </div>
  )
}
