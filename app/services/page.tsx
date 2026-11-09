import Link from "next/link"
import { ArrowUpRight } from "@/components/site/arrows"
import {
  Breadcrumbs,
  FAQ,
  FinalCTA,
  JsonLd,
  PageIntro,
} from "@/components/site/shared"
import { services, money } from "@/lib/content"
import { pageMetadata, serviceSchema } from "@/lib/seo"
import { PaymentCTA } from "@/components/payment-cta"

export const metadata = pageMetadata(
  "Pet Sitting Services in Fox River Grove & Cary, IL",
  "Compare house sitting, dog walking, cat sitting and drop-ins by Drew in Fox River Grove and Cary. See starting rates and request personalized pet care.",
  "/services"
)

export default function Services() {
  return (
    <>
      <div className="shell inner-page">
        <Breadcrumbs name="Services" path="/services" />
        <PageIntro
          title="Pet sitting & dog walking services"
          description="Based in Fox River Grove, Illinois, with Cary in the core service area and nearby towns considered by request. I personally handle every visit and stay, with care agreed around your pet’s routine."
        />
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "ItemList",
            itemListElement: services.map((service, index) => ({
              "@type": "ListItem",
              position: index + 1,
              item: serviceSchema(service),
            })),
          }}
        />
        <ul className="service-index">
          {services.map((service) => (
            <li key={service.slug}>
              <Link
                href={`/services/${service.slug}`}
                className="service-index-card"
              >
                <h2>{service.name}</h2>
                <p>{service.short}</p>
                <span className="service-index-price">
                  {service.price === null ? (
                    "Personally quoted"
                  ) : (
                    <>
                      From <strong>{money(service.price)}</strong> /{" "}
                      {service.unit}
                    </>
                  )}
                </span>
                <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
        <div className="page-note">
          <p>
            Drop-ins help with meals and breaks. House sitting adds overnight
            company in your home. Boarding is care away from home, with the
            setting reviewed before confirmation.
          </p>
          <div className="page-note-links">
            <Link href="/guides/pet-sitting-rates" className="text-link">
              Compare rates
            </Link>
            <Link href="/locations" className="text-link">
              Check the service area
            </Link>
            <PaymentCTA variant="text-link" text="Make a custom payment" />
          </div>
        </div>
        <FAQ />
      </div>
      <FinalCTA />
    </>
  )
}
