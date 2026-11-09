import Link from "next/link"
import { ArrowUpRight } from "@/components/site/arrows"
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
          title="Looking for a dog sitter near you?"
          description={`Drew’s Pet Care is based in Fox River Grove, Illinois (60021). ${coverageSummary}`}
        />
        <ul className="service-index">
          {locations.map((location) => (
            <li key={location.slug}>
              <Link
                href={`/locations/${location.slug}`}
                className="service-index-card"
              >
                <h2>
                  <span className="sr-only">Dog sitting & pet care in </span>
                  {location.name}, IL
                </h2>
                <p>{location.intro}</p>
                <span className="service-index-price">
                  {location.zip} ·{" "}
                  {location.core ? (
                    <strong>Core service area</strong>
                  ) : (
                    "Reviewed by request"
                  )}
                </span>
                <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
        <div className="page-note">
          <p>
            Send your city or ZIP, dates, and the service you need. We’ll
            discuss your exact address privately. House sitting starts at $55
            per night; walks, drop-ins, and cat visits start at $22.
          </p>
          <div className="page-note-links">
            <Link href="/services" className="text-link">
              Compare services
            </Link>
            <Link href="/book" className="text-link">
              Check dates and coverage
            </Link>
          </div>
        </div>
        <FAQ
          title="Choosing dog care near you"
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
