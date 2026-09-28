import { PageIntro } from "@/components/site/shared"
import { InquiryForm } from "@/components/forms/inquiry-form"
export const metadata = {
  title: "Join Our Future Sitter Network",
  description:
    "Introduce yourself to Drew’s Pet Care. We’re building a trusted local sitter network around Fox River Grove.",
  alternates: { canonical: "/apply" },
}
export default function Apply() {
  return (
    <div className="shell">
      <PageIntro
        eyebrow="GOOD PEOPLE. GOOD CARE."
        title="Let’s grow something local."
        description="We’re building a trusted local sitter network. If you’d like to be considered as we grow, you can apply below."
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
            Drew personally provides care today. This application is an
            expression of interest, not a promise of work or an announcement of
            an open position.
          </p>
          <h3 style={{ marginTop: 25 }}>What happens next?</h3>
          <p>
            Your application stays private. If there’s a suitable opportunity,
            Drew will get in touch to discuss experience, references, and next
            steps.
          </p>
        </aside>
      </div>
    </div>
  )
}
