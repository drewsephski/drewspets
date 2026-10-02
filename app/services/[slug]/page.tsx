import { ArrowUpRight } from "@/components/site/arrows"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { pageMetadata, serviceSchema } from "@/lib/seo"
import { services, locations, money, coverageSummary } from "@/lib/content"
import {
  Breadcrumbs,
  PageIntro,
  FAQ,
  FinalCTA,
  JsonLd,
} from "@/components/site/shared"
export const dynamicParams = false
export const generateStaticParams = () =>
  services.map((s) => ({ slug: s.slug }))
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const s = services.find((s) => s.slug === slug)
  if (!s) notFound()
  return pageMetadata(
    `${s.name} in Fox River Grove & Cary, IL`,
    `${s.name} by Drew in Fox River Grove, Cary and nearby Illinois towns. ${s.price ? `From ${money(s.price)} per ${s.unit}.` : "Personally quoted."} Request dates and a meet & greet.`,
    `/services/${slug}`
  )
}
export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const s = services.find((s) => s.slug === slug)
  if (!s) notFound()
  return (
    <>
      <div className="shell inner-page">
        <Breadcrumbs
          name={s.name}
          path={`/services/${slug}`}
          parent={{ name: "Services", path: "/services" }}
        />
        <PageIntro
          eyebrow="PERSONAL CARE, AT THEIR PACE."
          title={`${s.name} in Fox River Grove & Cary`}
          description={s.description}
        />
        <JsonLd
          data={{ "@context": "https://schema.org", ...serviceSchema(s) }}
        />
        <div className="content-grid">
          <div>
            <h2>Is this right for your pet?</h2>
            <p>{s.best}</p>
            <h2>What’s included</h2>
            <ul className="check-list">
              {s.includes.map((i) => (
                <li key={i}>
                  <Check size={17} />
                  {i}
                </li>
              ))}
            </ul>
            <h2>Where I offer {s.name.toLowerCase()}</h2>
            <p>
              Based in Fox River Grove, Illinois, with Cary in the core service
              area. Requests from nearby towns are reviewed for travel time and
              availability.
            </p>
            <div className="service-link-list">
              {locations.map((location) => (
                <Link key={location.slug} href={`/locations/${location.slug}`}>
                  {location.name}, IL <ArrowUpRight size={16} />
                </Link>
              ))}
            </div>
            <h2>Before we confirm</h2>
            <p>
              We’ll talk through your pet’s routine, any special needs, and your
              dates. A meet & greet helps us make a comfortable plan. No payment
              is required to send a request.
            </p>
            <FAQ
              items={[
                [s.question, s.answer],
                [
                  "How much will my booking cost?",
                  s.price
                    ? `Rates start at ${money(s.price)} per ${s.unit}. Holidays, additional pets, length of care, and special needs may change the total. You’ll receive an exact quote before confirming.`
                    : "Daycare and boarding are personally quoted after we discuss the setting, dates, and your pet’s needs.",
                ],
                [
                  "Where do you offer care?",
                  `Drew’s Pet Care is based in Fox River Grove. ${coverageSummary} Address and schedule determine availability.`,
                ],
              ]}
            />
          </div>
          <aside>
            <div className="content-image">
              <Image
                src={s.image}
                alt={s.imageAlt}
                fill
                sizes="(max-width:700px) 100vw, 40vw"
                style={{ objectPosition: s.imagePosition ?? "center" }}
              />
            </div>
            <div className="panel">
              <span className="eyebrow">LET’S MAKE A PLAN.</span>
              <h3>
                {s.price
                  ? `From ${money(s.price)} / ${s.unit}`
                  : "Personally quoted"}
              </h3>
              <p>
                Send me your dates and a little about your pets. I’ll get back
                to you personally.
              </p>
              <Button
                nativeButton={false}
                render={<Link href={`/book?service=${slug}`} />}
                className="site-button mt-5"
                size="lg"
              >
                Check availability <ArrowUpRight size={16} />
              </Button>
            </div>
          </aside>
        </div>
        <div style={{ paddingBottom: 60 }}>
          <span className="eyebrow">OTHER WAYS I CAN HELP</span>
          <div className="service-link-list">
            {services
              .filter((x) => x.slug !== slug)
              .map((x) => (
                <Link key={x.slug} href={`/services/${x.slug}`}>
                  {x.name}
                  <ArrowUpRight size={16} />
                </Link>
              ))}
          </div>
        </div>
      </div>
      <FinalCTA />
    </>
  )
}
