import Link from "next/link"
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
          eyebrow="PERSONAL CARE BY DREW"
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
        <div className="content-grid directory-layout">
          <div className="directory-grid">
            {services.map((service) => (
              <section key={service.slug} className="panel directory-card">
                <h2>
                  <Link href={`/services/${service.slug}`}>{service.name}</Link>
                </h2>
                <p>{service.description}</p>
                <p>
                  <strong>
                    {service.price === null
                      ? "Personally quoted"
                      : `From ${money(service.price)} per ${service.unit}`}
                  </strong>
                </p>
                <p>{service.best}</p>
                <Link href={`/services/${service.slug}`} className="text-link">
                  Explore {service.name.toLowerCase()}
                </Link>
              </section>
            ))}
          </div>
          <aside className="panel self-start">
            <h2>Choose care that fits.</h2>
            <p>
              Drop-ins help with meals and breaks. House sitting adds overnight
              company in your home. Boarding is care away from home, with the
              setting reviewed before confirmation.
            </p>
            <p>
              <Link href="/guides/pet-sitting-rates" className="text-link">
                Compare rates and care options
              </Link>
            </p>
            <p>
              <Link href="/locations" className="text-link">
                Check the service area
              </Link>
            </p>
            <Link href="/book" className="text-link">
              Request your dates
            </Link>
          </aside>
        </div>
        <PaymentCTA
          variant="text-link"
          className="panel mb-12 w-full"
          text="Need to make a custom payment for a specialized service? Pay now."
        />
        <FAQ />
      </div>
      <FinalCTA />
    </>
  )
}
