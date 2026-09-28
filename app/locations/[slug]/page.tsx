import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowUpRight, MapPin } from "lucide-react"
import { locations } from "@/lib/content"
import {
  Breadcrumbs,
  PageIntro,
  FAQ,
  FinalCTA,
  ServiceLinks,
} from "@/components/site/shared"
export const generateStaticParams = () =>
  locations.map((l) => ({ slug: l.slug }))
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const l = locations.find((l) => l.slug === slug)
  return l
    ? {
        title: `Pet Sitting & Dog Walking in ${l.name}, IL`,
        description: l.copy,
        alternates: { canonical: `/locations/${slug}` },
      }
    : {}
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
      <div className="shell">
        <Breadcrumbs name={`${l.name}, IL`} path={`/locations/${slug}`} />
        <PageIntro
          eyebrow={`DREW’S PET CARE · ${l.name.toUpperCase()}, ILLINOIS`}
          title={l.intro}
          description={l.copy}
        />
        <div className="content-grid">
          <div>
            <h2>Plan care around your day.</h2>
            <p>{l.context}</p>
            <div className="form-info">
              <MapPin size={19} />
              <p style={{ margin: "10px 0 0" }}>{l.tip}</p>
            </div>
            <h2>Services in {l.name}</h2>
            <p>
              Choose the care that fits your household. All requests are
              personally reviewed for availability and fit.
            </p>
            <ServiceLinks />
            <h2>A few local details</h2>
            <FAQ
              items={[
                [l.faq, l.answer],
                [
                  "What information do you need to check availability?",
                  "Start with your dates, service, pets, and address. Addresses are kept private. Please don’t send keys, alarm codes, or payment details in the request.",
                ],
                [
                  "Is a request a confirmed booking?",
                  "No. Drew will review the details, discuss the price, and confirm the arrangements with you before care is booked.",
                ],
              ]}
            />
          </div>
          <aside className="panel">
            <span className="eyebrow">A LOCAL STARTING POINT</span>
            <h3>Let’s meet your pet.</h3>
            <p>
              Tell me what a good day looks like for them. We’ll work out the
              rest together.
            </p>
            <Link href="/book" className="button" style={{ marginTop: 22 }}>
              Request your dates <ArrowUpRight size={16} />
            </Link>
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
      </div>
      <FinalCTA />
    </>
  )
}
