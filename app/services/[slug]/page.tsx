import { ArrowUpRight } from "@/components/site/arrows"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { serviceMetadata, serviceSchema } from "@/lib/seo"
import {
  services,
  locations,
  money,
  coverageSummary,
  serviceSeo,
} from "@/lib/content"
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
  return serviceMetadata(s)
}
export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const s = services.find((s) => s.slug === slug)
  if (!s) notFound()
  const seo = serviceSeo[s.slug]
  return (
    <>
      <div className="shell inner-page">
        <Breadcrumbs
          name={s.name}
          path={`/services/${slug}`}
          parent={{ name: "Services", path: "/services" }}
        />
        <PageIntro
          title={seo?.heading ?? `${s.name} in Fox River Grove & Cary`}
          description={s.description}
        />
        <JsonLd
          data={{ "@context": "https://schema.org", ...serviceSchema(s) }}
        />
        <div className="service-overview">
          <div className="service-overview-image">
            <Image
              src={s.image}
              alt={s.imageAlt}
              fill
              priority
              sizes="(max-width: 760px) 100vw, 520px"
              style={{ objectPosition: s.imagePosition ?? "center" }}
            />
          </div>
          <div className="booking-card">
            {s.price ? (
              <p className="booking-price">
                <span className="booking-from">From</span>
                <span className="booking-amount">{money(s.price)}</span>
                <span className="booking-unit">per {s.unit}</span>
              </p>
            ) : (
              <p className="booking-price">
                <span className="booking-amount booking-amount-text">
                  Personally quoted
                </span>
              </p>
            )}
            <p className="booking-best">
              <strong>Best for</strong> {s.best}
            </p>
            <h2 className="booking-label">What’s included</h2>
            <ul className="check-list">
              {s.includes.map((i) => (
                <li key={i}>
                  <Check size={17} aria-hidden="true" />
                  {i}
                </li>
              ))}
            </ul>
            <Button
              nativeButton={false}
              render={<Link href={`/book?service=${slug}`} />}
              className="site-button booking-button"
              size="lg"
            >
              Check availability <ArrowUpRight size={16} />
            </Button>
            <p className="booking-note">
              Free to ask. No payment until we agree on a plan.
            </p>
          </div>
        </div>
        <div className="service-details">
          {seo?.sections?.map((section) => (
            <section key={section.title}>
              <h2>{section.title}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>
          ))}
          <section>
            <h2>Where I offer {s.name.toLowerCase()}</h2>
            <p>
              Based in Fox River Grove, Illinois, with Cary in the core service
              area. Requests from nearby towns are reviewed for travel time and
              availability.
            </p>
            <ul className="pill-list" aria-label="Service towns">
              {locations.map((location) => (
                <li key={location.slug}>
                  <Link
                    href={`/locations/${location.slug}`}
                    data-core={location.core || undefined}
                  >
                    {location.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
        <FAQ
          title="Before we confirm"
          description="We’ll talk through your pet’s routine, any special needs, and your dates. A meet & greet helps us make a comfortable plan. No payment is required to send a request."
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
        <nav className="related-services" aria-label="Other services">
          <h2>Other ways I can help</h2>
          <ul className="pill-list">
            {services
              .filter((x) => x.slug !== slug)
              .map((x) => (
                <li key={x.slug}>
                  <Link href={`/services/${x.slug}`}>{x.name}</Link>
                </li>
              ))}
          </ul>
        </nav>
      </div>
      <FinalCTA />
    </>
  )
}
