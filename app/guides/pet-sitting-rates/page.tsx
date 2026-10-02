import Link from "next/link"
import { Breadcrumbs, FAQ, FinalCTA, PageIntro } from "@/components/site/shared"
import { services, money, coverageSummary } from "@/lib/content"
import { pageMetadata } from "@/lib/seo"

export const metadata = pageMetadata(
  "Pet Sitting Rates in Fox River Grove & Cary, IL",
  "Drew’s Pet Care rates: house sitting from $55/night, dog walks and cat visits from $22, puppy care from $60/night. Compare options and get a personal quote.",
  "/guides/pet-sitting-rates"
)

export default function RatesGuide() {
  return (
    <>
      <article className="shell inner-page reading-page">
        <Breadcrumbs
          name="Rates & care guide"
          path="/guides/pet-sitting-rates"
        />
        <PageIntro
          eyebrow="A GUIDE BY DREW"
          title="How much does pet sitting cost near Fox River Grove?"
          description="At Drew’s Pet Care, house sitting starts at $55 per night, while dog walks, drop-ins, and cat visits start at $22. These are my starting rates for local care, with your exact quote agreed before booking."
        />
        <div className="content-grid reading-grid">
          <div>
            <h2>Compare my starting rates.</h2>
            <p>
              These are Drew’s Pet Care prices, rather than an average of other
              sitters’ rates. Holidays, additional pets, visit length, and
              special care may change your total.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <caption className="sr-only">
                  Drew’s Pet Care starting rates
                </caption>
                <thead>
                  <tr>
                    <th scope="col" className="py-4">
                      Service
                    </th>
                    <th scope="col">Starting rate</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((service) => (
                    <tr key={service.slug} className="border-t">
                      <th scope="row" className="py-4 font-medium">
                        <Link
                          className="text-link"
                          href={`/services/${service.slug}`}
                        >
                          {service.name}
                        </Link>
                      </th>
                      <td>
                        {service.price === null
                          ? "Personal quote"
                          : `${money(service.price)} / ${service.unit}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <h2>House sitting or drop-in visits?</h2>
            <p>
              <Link href="/services/house-sitting" className="text-link">
                House sitting
              </Link>{" "}
              includes an overnight stay in your home plus an agreed daytime
              routine. It can suit pets who settle best at home and households
              with several pets. It does not include continuous 24-hour
              supervision; we discuss time alone before confirming.
            </p>
            <p>
              <Link href="/services/drop-ins" className="text-link">
                Drop-in visits
              </Link>{" "}
              cover food, water, potty breaks, play, or company during a 30- or
              60-minute visit. Cats who prefer home can have{" "}
              <Link href="/services/cat-sitting" className="text-link">
                cat visits
              </Link>{" "}
              for meals, litter, and a wellbeing check. We agree on frequency
              and timing around your pets’ needs.
            </p>
            <h2>House sitting or boarding?</h2>
            <p>
              House sitting keeps your pet in your own home.{" "}
              <Link href="/services/boarding" className="text-link">
                Boarding
              </Link>{" "}
              is overnight care away from home. Boarding and daycare requests
              are reviewed individually for the care setting, temperament,
              dates, and availability, then personally quoted.
            </p>
            <h2>What should you ask a new pet sitter?</h2>
            <ul className="list-disc space-y-3 pl-5">
              <li>
                Who will handle visits and overnight stays? I personally provide
                all care.
              </li>
              <li>
                How long is a visit, and how much time will pets spend alone?
              </li>
              <li>
                What does the quote include for extra pets, holidays, and longer
                visits?
              </li>
              <li>
                How will meals, walks, home access, and photo updates work?
              </li>
              <li>
                Can the sitter meet your pet and safely follow any special-care
                instructions?
              </li>
            </ul>
            <h2>How to get an exact quote.</h2>
            <p>
              Share your dates, service, pets, and city or ZIP in a{" "}
              <Link href="/book" className="text-link">
                free care request
              </Link>
              . I’ll check coverage and availability, discuss your routine, and
              arrange a meet & greet when needed. There’s no payment or
              obligation to request; care is confirmed together after we agree
              on the plan.
            </p>
          </div>
          <aside className="panel self-start">
            <h2>Care close to home.</h2>
            <p>{coverageSummary}</p>
            <p>
              <Link href="/locations" className="text-link">
                Find care in your town
              </Link>
            </p>
            <p>
              <Link href="/contact" className="text-link">
                Ask Drew a question
              </Link>
            </p>
            <Link href="/book" className="text-link">
              Request a personal quote
            </Link>
          </aside>
        </div>
        <FAQ />
      </article>
      <FinalCTA />
    </>
  )
}
