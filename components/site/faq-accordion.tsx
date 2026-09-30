"use client"

import { faqs } from "@/lib/content"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export function FAQAccordion({
  items = faqs,
}: {
  items?: readonly (readonly string[])[]
}) {
  return (
    <Accordion className="faq-list">
      {items.map(([question, answer]) => (
        <AccordionItem key={question} value={question} className="faq-item">
          <AccordionTrigger className="faq-trigger">
            {question}
          </AccordionTrigger>
          <AccordionContent className="faq-answer" keepMounted>
            <p>{answer}</p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
