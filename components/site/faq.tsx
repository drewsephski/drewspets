import { faqs } from "@/lib/content"
import { JsonLd } from "./json-ld"
import { FAQAccordion } from "./faq-accordion"

export function FAQ({
  items = faqs,
}: {
  items?: readonly (readonly string[])[]
}) {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: items.map(([question, answer]) => ({
            "@type": "Question",
            name: question,
            acceptedAnswer: { "@type": "Answer", text: answer },
          })),
        }}
      />
      <FAQAccordion items={items} />
    </>
  )
}
