import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight } from "@/components/site/arrows"
import {
  Breadcrumbs,
  FAQ,
  FinalCTA,
  JsonLd,
  PageIntro,
} from "@/components/site/shared"
import { coverageSummary, site } from "@/lib/content"
import { aboutPhoto } from "@/lib/gallery"
import { aboutSchema, pageMetadata } from "@/lib/seo"

export const metadata = pageMetadata(
  "Meet Drew, Pet Sitter in Fox River Grove & Cary, IL",
  "Meet the person behind Drew’s Pet Care. Drew personally provides dog walks, pet visits and overnight care in Fox River Grove, Cary and nearby towns by request.",
  "/about"
)

export default function AboutPage() {
  return (
    <>
      <JsonLd data={aboutSchema()} />
      <article className="shell inner-page reading-page">
        <Breadcrumbs name="About Drew" path="/about" />
        <PageIntro
          eyebrow="YOUR LOCAL PET PERSON"
          title="Hi, I’m Drew. I’ll be your pet’s sitter."
          description="I run Drew’s Pet Care from Fox River Grove, Illinois, and personally handle every visit and stay. We’ll talk directly about your pet’s routine, your dates, and the care you need."
        />
        <div className="content-grid">
          <div>
            <h2>Familiar routines. A familiar face.</h2>
            <p>
              I started Drew’s Pet Care to give local pets steady, familiar
              care. I follow their routines, take note of the small details, and
              make sure you know how things are going. You’ll work with me from
              the first conversation through the visits or stay.
            </p>
            <h2>What we’ll discuss before care.</h2>
            <p>
              Tell me about meals, walks, time alone, and how your pet reacts to
              someone new. A meet & greet gives us time to go over the routine
              and see how your pet settles. We’ll agree on visit times, home
              access, updates, and your exact price before confirming.
            </p>
            <p>
              House sitting includes an overnight stay in your home and an
              agreed daytime routine. It does not include continuous 24-hour
              supervision. Boarding and daycare depend on a suitable setting,
              temperament, and availability, with arrangements discussed
              individually.
            </p>
            <p>
              <Link href="/services" className="text-link">
                Compare care options <ArrowUpRight size={16} />
              </Link>
            </p>
            <h2>Based in Fox River Grove.</h2>
            <p>{coverageSummary}</p>
            <p>
              Share your city or ZIP, dates, and preferred times. I’ll check
              travel and current commitments before agreeing to care.
            </p>
            <Link href="/locations" className="text-link">
              Check your town <ArrowUpRight size={16} />
            </Link>
          </div>
          <aside className="self-start">
            <Image
              src={aboutPhoto.src}
              alt={aboutPhoto.alt}
              width={aboutPhoto.width}
              height={aboutPhoto.height}
              loading="eager"
              sizes="(max-width: 700px) 100vw, 40vw"
              className="h-auto w-full rounded-2xl"
            />
            <div className="panel mt-6">
              <h2>Find me and get in touch.</h2>
              <p>
                <a href={site.googleMapsUrl} className="text-link">
                  Drew’s Pet Care on Google <ArrowUpRight size={16} />
                </a>
              </p>
              <p>
                <a href={site.sitterProfileUrl} className="text-link">
                  My Sitterfolio profile <ArrowUpRight size={16} />
                </a>
              </p>
              <p>
                <a href={`tel:${site.phone}`} className="text-link">
                  Call Drew: {site.phone}
                </a>
              </p>
              <p>
                <Link href="/contact" className="text-link">
                  Send me a question <ArrowUpRight size={16} />
                </Link>
              </p>
              <p>
                Have I cared for your pet? You can share an honest review on
                Google.
              </p>
              <a href={site.googleReviewUrl} className="text-link">
                Review your experience <ArrowUpRight size={16} />
              </a>
            </div>
          </aside>
        </div>
        <FAQ
          title="Before we meet"
          items={[
            [
              "Who will look after my pets?",
              "Drew personally handles every visit and stay. You’ll discuss your routine, dates, and care arrangements directly with Drew before confirming.",
            ],
            [
              "Can we meet before the first visit or stay?",
              "Yes. We can arrange a meet & greet to introduce your pets, go over feeding and walking routines, and discuss home access and any special needs before care begins.",
            ],
            [
              "How do I request care?",
              "Send your dates, service, pets, and city or ZIP through the care request form. Drew will check coverage and availability, discuss the plan, and provide a personal quote. A request does not confirm a booking.",
            ],
          ]}
        />
      </article>
      <FinalCTA />
    </>
  )
}
