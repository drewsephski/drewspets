import Link from "next/link"
import { PageIntro } from "@/components/site/shared"
export const metadata = {
  title: "Privacy",
  description:
    "How Drew’s Pet Care handles your contact details, home address, and pet care information.",
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
      <h2>What we collect</h2>
      <p>
        Booking requests include your name, email, phone, address, requested
        dates, and information about your pets and their care. We also save
        inquiries, sitter applications, booking status, payment records, and
        care notes. Please do not submit door codes, alarm codes, card numbers,
        or other secrets through these forms.
      </p>
      <h2>How we use it</h2>
      <p>
        We use your information to assess availability, discuss your request,
        plan and deliver care, manage payment, and communicate with you. A
        sitter application is used to consider you for future opportunities. We
        do not sell your personal information.
      </p>
      <h2>Who can access it</h2>
      <p>
        Booking and care records are available through a private, authenticated
        administration area. Drew personally provides care today. If an
        additional sitter is involved in the future, we will discuss the
        arrangement before confirming care and share only the information needed
        for that care.
      </p>
      <p>
        Our service providers may process information to host the website and
        database, deliver email, or process payments. These integrations are
        designed for Vercel, Neon, Resend, and Stripe. When online payment is
        enabled, card information goes directly to Stripe. We do not store raw
        card details.
      </p>
      <h2>Your private booking link</h2>
      <p>
        Your unguessable booking link shows a limited summary: service, dates,
        pet names, status, prices, payment progress, and messages marked for
        you. Anyone with that link can see the summary, so keep it private. It
        does not show your address, contact details, pet medical information, or
        private notes. Links expire 180 days after the requested stay and can be
        revoked sooner.
      </p>
      <h2>Cookies and analytics</h2>
      <p>
        Admin sign-in uses necessary session cookies. Public booking requests do
        not require an account. Optional analytics, when enabled, measure page
        use and conversion events such as submitting a request. Form contents
        are not sent with these events. Analytics scripts are excluded from
        private booking and admin pages on initial load. Payment completion is
        verified on the server.
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
