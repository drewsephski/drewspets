import Link from "next/link"
import { Breadcrumbs, FAQ, FinalCTA, PageIntro } from "@/components/site/shared"
import { coverageSummary, locations } from "@/lib/content"
import { pageMetadata } from "@/lib/seo"

export const metadata = pageMetadata(
  "Dog Sitter Near You | Fox River Grove & Nearby IL Towns",
  "Find dog sitting and pet care by Drew in Fox River Grove and Cary, IL. Huntley, Wauconda, Barrington and nearby towns by request. Check your city and dates.",
  "/locations"
)

export default function Locations() {
  return (
    <>
      <div className="shell inner-page">
        <Breadcrumbs name="Service area" path="/locations" />
        <PageIntro
          eyebrow="YOUR LOCAL PET PERSON"
          title="Looking for a dog sitter near you?"
          description={`Drew’s Pet Care is based in Fox River Grove, Illinois (60021). ${coverageSummary}`}
        />
        <div className="content-grid directory-layout">
          <div className="directory-grid">
            {locations.map((location) => (
              <section key={location.slug} className="panel directory-card">
                <h2>
                  <Link href={`/locations/${location.slug}`}>
                    Dog sitting & pet care in {location.name}, IL
                  </Link>
                </h2>
                <p>
                  <strong>
                    {location.zip} ·{" "}
                    {location.core
                      ? "Core service area"
                      : "Coverage reviewed by request"}
                  </strong>
                </p>
                <p>{location.copy}</p>
                <Link
                  href={`/locations/${location.slug}`}
                  className="text-link"
                >
                  Explore care in {location.name}
                </Link>
              </section>
            ))}
          </div>
          <aside className="panel self-start">
            <h2>Check your neighborhood.</h2>
            <p>
              Send your city or ZIP, dates, and the service you need. We’ll
              discuss your exact address privately when planning travel and
              access. Please keep keys and entry codes out of the request form.
            </p>
            <p>
              House sitting starts at $55 per night. Dog walks, drop-ins, and
              cat visits start at $22, with your total confirmed before booking.
            </p>
            <p>
              <Link href="/services" className="text-link">
                Compare pet-care services
              </Link>
            </p>
            <Link href="/book" className="text-link">
              Check dates and coverage
            </Link>
          </aside>
        </div>
        <h2>Choosing dog care near you</h2>
        <FAQ
          items={[
            [
              "Can a dog sitter care for my dog in my own home?",
              "Yes. House sitting includes an overnight stay in your home and an agreed daytime routine. Drop-ins cover shorter visits for meals, water, and potty breaks; dog walking adds a planned walk. Overnight house sitting does not mean continuous 24-hour supervision.",
            ],
            [
              "How much does a dog sitter near me cost?",
              "Drew’s house sitting starts at $55 per night, and dog walks and drop-in visits start at $22. Boarding and daycare are personally quoted. Your town, dates, visit length, extra pets, and care needs are reviewed before an exact price is agreed.",
            ],
            [
              "Do you offer dog sitting in Huntley and Wauconda?",
              "Drew welcomes requests from Huntley (60142) and Wauconda (60084). Both are outside the Fox River Grove and Cary core area, so coverage depends on travel time, your dates, and the care schedule. Send your town or ZIP and preferred times to check before booking.",
            ],
          ]}
        />
      </div>
      <FinalCTA />
    </>
  )
}
