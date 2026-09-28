import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Check, ArrowUpRight } from "lucide-react"
import { services, locations, site, money } from "@/lib/content"
import {
  Breadcrumbs,
  PageIntro,
  FAQ,
  FinalCTA,
  JsonLd,
} from "@/components/site/shared"
export const generateStaticParams = () =>
  services.map((s) => ({ slug: s.slug }))
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const s = services.find((s) => s.slug === slug)
  return s
    ? {
        title: `${s.name} in Fox River Grove, IL`,
        description: s.description,
        alternates: { canonical: `/services/${slug}` },
      }
    : {}
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
      <div className="shell">
        <Breadcrumbs name={s.name} path={`/services/${slug}`} />
        <PageIntro
          eyebrow="PERSONAL CARE, AT THEIR PACE."
          title={s.name}
          description={s.description}
        />
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Service",
            name: s.name,
            description: s.description,
            provider: {
              "@type": "LocalBusiness",
              name: site.name,
              url: site.url,
            },
            areaServed: locations.map((l) => l.name),
            ...(s.price
              ? {
                  offers: {
                    "@type": "Offer",
                    price: s.price / 100,
                    priceCurrency: "USD",
                    description: `Starting rate per ${s.unit}; final quote required.`,
                  },
                }
              : {}),
          }}
        />
        <div className="content-grid">
          <div>
            <h2>Care for their kind of day.</h2>
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
                  "Drew’s Pet Care is based in Fox River Grove and considers requests from Cary, Barrington, Crystal Lake, Algonquin, Lake in the Hills, and nearby communities. Address and schedule determine availability.",
                ],
              ]}
            />
          </div>
          <aside>
            {"image" in s && (
              <div className="content-image">
                <Image
                  src={s.image}
                  alt={
                    s.name === "Cat Sitting"
                      ? "A relaxed cat at home"
                      : "A happy pet enjoying a familiar day"
                  }
                  fill
                  sizes="(max-width:700px) 100vw, 40vw"
                />
              </div>
            )}
            <div className="panel">
              <span className="eyebrow">LET’S MAKE A PLAN.</span>
              <h3>
                {s.price
                  ? `From ${money(s.price)} / ${s.unit}`
                  : "Personally quoted"}
              </h3>
              <p>
                Share your dates and pet details. Drew will personally review
                your request.
              </p>
              <Link
                className="button"
                style={{ marginTop: 20 }}
                href={`/book?service=${slug}`}
              >
                Check availability <ArrowUpRight size={16} />
              </Link>
            </div>
          </aside>
        </div>
        <div style={{ paddingBottom: 60 }}>
          <span className="eyebrow">OTHER WAYS WE CAN HELP</span>
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
