import { ArrowUpRight } from "@/components/site/arrows"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MapPin } from "lucide-react"
import { locationMetadata, locationSchema } from "@/lib/seo"
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
          eyebrow={`DREW’S PET CARE · ${l.name.toUpperCase()}, ILLINOIS`}
          title={`Dog sitting & pet care in ${l.name}, IL`}
          description={l.copy}
        />
        <div className="content-grid reading-grid">
          <div>
            <h2>{l.intro}</h2>
            <p>
              Looking for a dog sitter or pet sitter near {l.name} ({l.zip})?
              Drew personally handles every visit and stay. House sitting starts
              at $55 per night; dog walks, drop-ins, and cat visits start at
              $22. Coverage depends on your address, dates, and travel time, and
              your exact price is agreed before confirming.
            </p>
            <p>
              <strong>
                {l.core
                  ? "Core service area."
                  : "Coverage reviewed by request."}
              </strong>{" "}
              Drew is based in Fox River Grove.{" "}
              {l.core
                ? "Regular walks, visits, and overnight stays are arranged around current availability."
                : "Send your town, dates, and preferred visit times so travel can be checked before you make plans."}
            </p>
            <Link href="/guides/pet-sitting-rates" className="text-link">
              See rates and care options <ArrowUpRight size={16} />
            </Link>
            <h2>Plan care around your day.</h2>
            <p>{l.context}</p>
            <div className="form-info">
              <MapPin size={19} aria-hidden="true" />
              <p>{l.tip}</p>
            </div>
            <h2>Services in {l.name}</h2>
            <p>
              Take a look at the options below. If you’re not sure what would
              suit your pet, I’m happy to help you choose.
            </p>
            <ServiceLinks />
          </div>
          <aside className="panel">
            <span className="eyebrow">A LOCAL STARTING POINT</span>
            <h3>Let’s meet your pet.</h3>
            <p>
              Tell me what a good day looks like for them. We’ll work out the
              rest together.
            </p>
            <Button
              nativeButton={false}
              render={<Link href="/book" />}
              className="site-button mt-5"
              size="lg"
            >
              Request your dates <ArrowUpRight size={16} />
            </Button>
            <h3 style={{ marginTop: 35, fontSize: 15 }}>Nearby communities</h3>
            {locations
              .filter((x) => l.nearby.some((n) => n === x.name))
              .map((x) => (
                <p key={x.slug}>
                  <Link className="text-link" href={`/locations/${x.slug}`}>
                    {x.name} <ArrowUpRight size={14} />
                  </Link>
                </p>
              ))}
          </aside>
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
