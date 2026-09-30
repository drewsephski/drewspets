import Link from "next/link"
import { Breadcrumbs, FinalCTA, PageIntro } from "@/components/site/shared"
import { locations } from "@/lib/content"
import { pageMetadata } from "@/lib/seo"

export const metadata = pageMetadata(
  "Pet Sitting Near Fox River Grove, Cary & Barrington, IL",
  "Find local pet sitting and dog walking by Drew. Fox River Grove and Cary are the core area; Barrington, Crystal Lake, Algonquin and Lake in the Hills by request.",
  "/locations"
)

export default function Locations() {
  return (
    <>
      <div className="shell">
        <Breadcrumbs name="Service area" path="/locations" />
        <PageIntro
          eyebrow="YOUR LOCAL PET PERSON"
          title="Looking for a pet sitter near you?"
          description="Drew’s Pet Care is based in Fox River Grove, Illinois (60021). Fox River Grove and Cary are the core service area. Nearby requests depend on travel time, the care you need, and current availability."
        />
        <div className="content-grid">
          <div>
            {locations.map((location, index) => (
              <section key={location.slug} className="panel mb-6">
                <h2>
                  <Link href={`/locations/${location.slug}`}>
                    Pet sitting in {location.name}, IL
                  </Link>
                </h2>
                <p>
                  <strong>
                    {location.zip} ·{" "}
                    {index < 2
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
      </div>
      <FinalCTA />
    </>
  )
}
