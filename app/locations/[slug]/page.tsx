import { ArrowUpRight } from "@/components/site/arrows"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MapPin } from "lucide-react"
import {
  locationMetadata,
  locationPageTitle,
  locationSchema,
} from "@/lib/seo"
import { locations } from "@/lib/content"
import {
  Breadcrumbs,
  PageIntro,
  FAQ,
  FinalCTA,
  ServiceLinks,
  JsonLd,
} from "@/components/site/shared"
export const dynamicParams = false
export const generateStaticParams = () =>
  locations.map((l) => ({ slug: l.slug }))
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const l = locations.find((l) => l.slug === slug)
  if (!l) notFound()
  return locationMetadata(l)
}
export default async function Location({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const l = locations.find((l) => l.slug === slug)
  if (!l) notFound()
  return (
    <>
      <JsonLd data={locationSchema(l)} />
      <div className="shell inner-page reading-page">
        <Breadcrumbs
          name={`${l.name}, IL`}
          path={`/locations/${slug}`}
          parent={{ name: "Service area", path: "/locations" }}
        />
        <PageIntro
          title={locationPageTitle(l)}
          description={l.copy}
        />
        <div className="location-facts">
          <div className="location-facts-row">
            <div>
              <span className="location-facts-label">Coverage</span>
              <strong>
                {l.core ? "Core service area" : "Reviewed by request"}
              </strong>
            </div>
            <div>
              <span className="location-facts-label">House sitting</span>
              <strong>From $55 / night</strong>
            </div>
            <div>
              <span className="location-facts-label">Walks & visits</span>
              <strong>From $22</strong>
            </div>
          </div>
          <Button
            nativeButton={false}
            render={<Link href="/book" />}
            className="site-button"
            size="lg"
          >
            Request your dates <ArrowUpRight size={16} />
          </Button>
        </div>
        <div className="service-details">
          <section>
            <h2>{l.intro}</h2>
            <p>
              Looking for a dog sitter or pet sitter near {l.name} ({l.zip})?
              Drew personally handles every visit and stay. Coverage depends on
              your address, dates, and travel time, and your exact price is
              agreed before confirming.
            </p>
            <p>
              Drew is based in Fox River Grove.{" "}
              {l.core
                ? "Regular walks, visits, and overnight stays are arranged around current availability."
                : "Send your town, dates, and preferred visit times so travel can be checked before you make plans."}
            </p>
          </section>
          <section>
            <h2>Plan care around your day</h2>
            <p>{l.context}</p>
            <div className="form-info">
              <MapPin size={19} aria-hidden="true" />
              <p>{l.tip}</p>
            </div>
          </section>
          <section>
            <h2>Services in {l.name}</h2>
            <ServiceLinks />
            <p className="mt-6">
              <Link href="/guides/pet-sitting-rates" className="text-link">
                See rates and care options <ArrowUpRight size={16} />
              </Link>
            </p>
          </section>
          <section>
            <h2>Nearby communities</h2>
            <ul className="pill-list">
              {locations
                .filter((x) => l.nearby.some((n) => n === x.name))
                .map((x) => (
                  <li key={x.slug}>
                    <Link href={`/locations/${x.slug}`}>{x.name}</Link>
                  </li>
                ))}
            </ul>
          </section>
        </div>
        <FAQ
          title="A few local details"
          items={[
            [l.faq, l.answer],
            [
              "What information do you need to check availability?",
              "Start with your dates, service, pets, and city or ZIP. No street address is needed yet. Please don’t send keys, alarm codes, or payment details in the request.",
            ],
            [
              "Is a request a confirmed booking?",
              "Not yet. I’ll get in touch to talk through your dates and price. We’ll confirm together once you’re happy with the plan.",
            ],
          ]}
        />
      </div>
      <FinalCTA />
    </>
  )
}
