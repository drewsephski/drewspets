import { faqs } from "@/lib/content"
import { JsonLd } from "./json-ld"
import { FAQAccordion } from "./faq-accordion"

export function FAQ({
  items = faqs,
  title,
  description,
}: {
  items?: readonly (readonly string[])[]
  title?: string
  description?: string
}) {
  return (
    <section
      className="faq-block"
      aria-label={title ?? "Frequently asked questions"}
    >
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
      {(title || description) && (
        <div className="faq-intro">
          {title && <h2>{title}</h2>}
          {description && <p>{description}</p>}
        </div>
      )}
      <FAQAccordion items={items} />
    </section>
  )
}
