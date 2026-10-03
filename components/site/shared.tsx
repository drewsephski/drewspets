import { JsonLd } from "./json-ld"
export { JsonLd } from "./json-ld"
import { ArrowRight, ArrowUpRight } from "@/components/site/arrows"
import Link from "next/link"
import { MapPin } from "lucide-react"
import { Brand } from "./header"
import { Button } from "@/components/ui/button"
import { services, site } from "@/lib/content"
import { PaymentCTA } from "@/components/payment-cta"
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell footer-main">
        <div>
          <Brand />
          <p>
            Good care. Familiar routines.
            <br />A little more peace of mind.
          </p>
          <span className="location-label">
            <MapPin size={14} /> Fox River Grove, Illinois
          </span>
        </div>
        <div>
          <span className="eyebrow">EXPLORE</span>
          <Link href="/services">Services</Link>
          <Link href="/guides/pet-sitting-rates">Rates & care guide</Link>
          <Link href="/about">About Drew</Link>
          <Link href="/locations">Service area</Link>
        </div>
        <div>
          <span className="eyebrow">LET’S TALK</span>
          <Link href="/book">Request care</Link>
          <Link href="/contact">Contact</Link>
          <PaymentCTA
            variant="text-link"
            text="Make a payment"
          />
          <Link href="/#faq">Common questions</Link>
          <Link href="/refer">Refer a friend</Link>
          <Link href="/apply">
            Future sitter opportunities <ArrowUpRight size={13} />
          </Link>
        </div>
        <div className="footer-note">
          <span className="eyebrow">YOUR LOCAL PET PERSON.</span>
          <p>
            Serving Fox River Grove
            <br />
            and nearby communities.
          </p>
          <Link className="text-link" href="/book">
            Let’s meet <ArrowRight size={16} />
          </Link>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© {new Date().getFullYear()} Drew’s Pet Care</span>
        <span>Locally owned. Personally cared for.</span>
        <div>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </div>
      </div>
    </footer>
  )
}
export function FinalCTA() {
  return (
    <section className="shell final-cta">
      <div>
        <h2>Have dates in mind?</h2>
        <p>
          Tell me a little about your pets and when you need a hand.
          <br />
          I’ll be in touch so we can work out the rest together.
        </p>
      </div>
      <div>
        <Button
          nativeButton={false}
          render={<Link href="/book" />}
          className="site-button site-button-inverse"
          variant="secondary"
          size="lg"
        >
          Request care <ArrowUpRight size={18} />
        </Button>
        <span className="cta-note">No commitment. Just a conversation.</span>
      </div>
    </section>
  )
}
export { FAQ } from "./faq"
export function PageIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <div className="page-intro">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  )
}
export function Breadcrumbs({
  name,
  path,
  parent,
}: {
  name: string
  path: string
  parent?: { name: string; path: string }
}) {
  const items = [
    { name: "Home", path: "/" },
    ...(parent ? [parent] : []),
    { name, path },
  ]
  return (
    <>
      <nav aria-label="Breadcrumb" className="breadcrumbs">
        {items.map((item, i) => (
          <span key={item.path}>
            {i > 0 && <span aria-hidden="true"> / </span>}
            {i === items.length - 1 ? (
              <span aria-current="page">{item.name}</span>
            ) : (
              <Link href={item.path}>{item.name}</Link>
            )}
          </span>
        ))}
      </nav>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: items.map((item, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: item.name,
            item: site.url + item.path,
          })),
        }}
      />
    </>
  )
}
export function ServiceLinks() {
  return (
    <div className="service-link-list">
      {services.map((s) => (
        <Link key={s.slug} href={`/services/${s.slug}`}>
          {s.name}
          <ArrowUpRight size={18} />
        </Link>
      ))}
    </div>
  )
}
