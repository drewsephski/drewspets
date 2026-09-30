import { ArrowUpRight } from "@/components/site/arrows"

import Link from "next/link"

import { Button } from "@/components/ui/button"
import { PageIntro } from "@/components/site/shared"
import { referral } from "@/lib/content"

export const metadata = {
  title: "Refer a Friend",
  description: "A thank-you for sharing Drew’s Pet Care with a nearby friend.",
  alternates: { canonical: "/refer" },
  robots: { index: false, follow: true },
}

export default function Refer() {
  return (
    <div className="shell inner-page reading-page">
      <PageIntro
        eyebrow="A THANK-YOU FOR THE INTRODUCTION"
        title="Good care is worth sharing."
        description="Know someone nearby looking for a thoughtful, familiar face for their pet? I’d be grateful if you passed my name along."
      />
      <div className="content-grid reading-grid">
        <section>
          <h2>How it works</h2>
          <p>
            Ask your friend to mention your name when they send a care request.
            Once their first paid booking is complete, I’ll add a{" "}
            {referral.credit} credit toward your next booking.
          </p>
          <p>
            There’s nothing to sign up for. I keep track personally and apply
            the credit manually. Your friend’s request still goes through the
            same personal conversation and planning as any other booking.
          </p>
          <Button
            nativeButton={false}
            render={<Link href="/book" />}
            className="site-button mt-5"
            size="lg"
          >
            Request care <ArrowUpRight size={16} />
          </Button>
        </section>
        <aside className="panel">
          <h3>A few simple details</h3>
          <p>
            The credit is earned after your friend’s first paid booking is
            completed, and can be used toward your next booking. It has no cash
            value and can’t be exchanged for cash.
          </p>
          <p style={{ marginTop: 18 }}>
            Referrals are separate from reviews. There is no reward for leaving
            a review, and your friend’s feedback never affects your credit.
          </p>
        </aside>
      </div>
    </div>
  )
}
