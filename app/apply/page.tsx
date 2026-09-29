import { PageIntro } from "@/components/site/shared"
import { InquiryForm } from "@/components/forms/inquiry-form"
export const metadata = {
  title: "Join Our Future Sitter Network",
  description:
    "Introduce yourself to Drew’s Pet Care. Leave your information for possible future sitter opportunities around Fox River Grove.",
  alternates: { canonical: "/apply" },
}
export default function Apply() {
  return (
    <div className="shell">
      <PageIntro
        eyebrow="FUTURE SITTER OPPORTUNITIES"
        title="Interested in pet care work?"
        description="I’m not hiring right now, but I’m glad to hear from people who may be interested if the business grows."
      />
      <div className="content-grid">
        <InquiryForm application />
        <aside className="panel">
          <h3>Care starts with people.</h3>
          <p>
            Thoughtful communication, reliability, respect for someone’s home,
            and a real interest in animals matter here.
          </p>
          <p style={{ marginTop: 18 }}>
            It’s just me looking after pets for now. There isn’t an open
            position today, but I’d love to hear from you if you’re interested
            in helping in the future.
          </p>
          <h3 style={{ marginTop: 25 }}>What happens next?</h3>
          <p>
            I’ll keep your details private and reach out if there’s a good fit.
            We can talk about your experience and get to know each other then.
          </p>
        </aside>
      </div>
    </div>
  )
}
