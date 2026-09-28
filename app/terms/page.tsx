import Link from "next/link"
import { PageIntro } from "@/components/site/shared"
export const metadata = {
  title: "Service Terms",
  description:
    "What to expect when requesting and confirming pet care with Drew’s Pet Care.",
  alternates: { canonical: "/terms" },
}
export default function Terms() {
  return (
    <div className="shell prose">
      <PageIntro
        eyebrow="A CLEAR UNDERSTANDING."
        title="Service terms"
        description="A good care arrangement starts with clear expectations. These terms apply to requests made through Drew’s Pet Care."
      />
      <h2>A request is not a confirmed booking</h2>
      <p>
        Submitting dates does not reserve care. Drew reviews each request for
        availability, location, temperament, and care requirements. Care is
        confirmed only after you and Drew agree to the service, schedule, price,
        and any payment arrangements. A meet & greet may be required.
      </p>
      <h2>Pricing and payment</h2>
      <p>
        Published rates are starting points. Holidays, additional pets, puppies,
        travel, and special care may affect your quote. Your total, any deposit,
        remaining balance, and payment deadlines will be agreed before
        confirmation. No payment is collected with your request. Drew will
        discuss payment arrangements personally after you agree on care.
      </p>
      <h2>Changes, cancellation, and refunds</h2>
      <p>
        Tell Drew as soon as your plans change. Availability and price may need
        to be reviewed for changes in dates or care. Any cancellation deadline,
        fee, or refund arrangement must be disclosed and agreed as part of your
        confirmed booking. These pages do not establish an automatic
        nonrefundable deposit or cancellation charge.
      </p>
      <h2>Accurate care information</h2>
      <p>
        Before care begins, provide current feeding and medication instructions,
        behavior information, emergency contacts, and any health or safety
        concerns that affect care. You are responsible for supplying appropriate
        food, equipment, and medications. Access arrangements and emergency
        permissions should be agreed before care begins.
      </p>
      <h2>Scope of care</h2>
      <p>
        House sitting does not automatically include constant supervision. Visit
        length, time alone, sleeping arrangements, walks, and updates are agreed
        individually. Boarding and daycare depend on a suitable care setting and
        compatibility. Drew may decline care that cannot be provided safely or
        reliably.
      </p>
      <h2>Emergencies</h2>
      <p>
        Pet care is not veterinary treatment. Before a stay, agree on an
        emergency contact, veterinary provider, and how urgent decisions should
        be handled if you cannot be reached. Website forms and messages are not
        an emergency service.
      </p>
      <h2>Applications and website use</h2>
      <p>
        Sitter applications express interest in future opportunities and do not
        establish employment or guarantee work. Use the website for legitimate
        inquiries and requests, and do not submit information about others
        without permission.
      </p>
      <h2>Questions</h2>
      <p>
        Ask about anything unclear before confirming. You can reach Drew through
        the{" "}
        <Link className="text-link" href="/contact">
          contact page
        </Link>
        .
      </p>
    </div>
  )
}
