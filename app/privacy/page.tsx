import Link from "next/link"
import { PageIntro } from "@/components/site/shared"
export const metadata = {
  title: "Privacy",
  description:
    "How Drew’s Pet Care handles your contact details and pet care requests.",
  alternates: { canonical: "/privacy" },
}
export default function Privacy() {
  return (
    <div className="shell prose">
      <PageIntro
        eyebrow="YOUR DETAILS DESERVE CARE, TOO."
        title="Privacy policy"
        description="This page explains how Drew’s Pet Care handles information you share when asking about or arranging pet care."
      />
      <h2>What I collect</h2>
      <p>
        Care requests include your contact details, city or ZIP, requested
        dates, and a short description of your pets. Contact messages and future
        sitter interest forms collect the information shown on those forms.
        Please do not send door codes, medical records, or payment details.
      </p>
      <h2>How I use it</h2>
      <p>
        I use your information to respond personally, check availability, and
        discuss care. Sitter information is used only for possible future
        opportunities. I do not sell your information.
      </p>
      <h2>Storage and email</h2>
      <p>
        Requests are emailed to Drew and a confirmation is sent to you through
        Resend. When database storage is configured, a copy is kept in Neon.
        Vercel hosts the website. There are no customer accounts or online
        checkout in the request flow.
      </p>
      <h2>Analytics</h2>
      <p>
        Optional analytics measure page visits and form submissions. Form
        contents are not included in analytics events. Basic request limits help
        protect the forms from spam.
      </p>
      <h2>Retention and your choices</h2>
      <p>
        We retain request and care records while needed for providing services,
        handling questions, and maintaining business records. You can request
        access, correction, or deletion by contacting Drew. Some records may
        need to be retained for payment, dispute, or other applicable
        recordkeeping needs. Sitter applications may be kept for future
        consideration; you can ask to withdraw them.
      </p>
      <h2>Questions or changes</h2>
      <p>
        Use the{" "}
        <Link className="text-link" href="/contact">
          contact page
        </Link>{" "}
        for privacy questions or requests. We may ask you to verify your
        identity before discussing private records. This policy will be updated
        if how we handle information changes.
      </p>
    </div>
  )
}
