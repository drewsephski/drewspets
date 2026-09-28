"use client"
import { useRef, useState, type FormEvent } from "react"
import Link from "next/link"
import { ArrowRight, ArrowLeft, Check, Plus, ShieldCheck } from "lucide-react"
import { z } from "zod"
import { services, money, type ServiceSlug } from "@/lib/content"
import {
  bookingSchema,
  dateSchema,
  petSchema,
  careSchema,
  locationSchema,
  contactSchema,
  estimateBooking,
  inServiceArea,
  overnight,
  today,
  type BookingInput,
} from "@/lib/validation"
import { Field, Select, Textarea, Honeypot } from "./fields"
import { conversion } from "@/components/site/analytics"
type Draft = Omit<BookingInput, "consent"> & { consent: boolean }
type Pet = BookingInput["pets"][number]
const blankPet = (): Pet => ({
  name: "",
  species: "dog",
  breed: "",
  age: "",
  size: "medium",
  sex: "unspecified",
  feeding: "",
  medications: "",
  behavior: "",
  instructions: "",
  emergencyContact: "",
  vet: "",
})
const steps = [
  "Choose care",
  "Your dates",
  "Your pets",
  "Care details",
  "Your location",
  "Stay in touch",
  "Review & request",
]
function PetEditor({
  pet,
  index,
  update,
  remove,
  canRemove,
}: {
  pet: Pet
  index: number
  update: (p: Pet) => void
  remove: () => void
  canRemove: boolean
}) {
  function set<K extends keyof Pet>(key: K, value: Pet[K]) {
    update({ ...pet, [key]: value })
  }
  return (
    <div className="pet-card">
      <div className="pet-card-heading">
        <h3>
          Pet {index + 1}
          {pet.name ? ` · ${pet.name}` : ""}
        </h3>
        {canRemove && (
          <button type="button" onClick={remove} className="plain-button">
            Remove pet
          </button>
        )}
      </div>
      <div className="field-row">
        <Field
          label="Pet’s name"
          value={pet.name}
          onChange={(e) => set("name", e.target.value)}
          maxLength={80}
          required
        />
        <Select
          label="Dog or cat"
          value={pet.species}
          onChange={(e) => set("species", e.target.value as Pet["species"])}
        >
          <option value="dog">Dog</option>
          <option value="cat">Cat</option>
        </Select>
      </div>
      <div className="field-row">
        <Field
          label="Breed / mix"
          value={pet.breed}
          maxLength={100}
          onChange={(e) => set("breed", e.target.value)}
        />
        <Field
          label="Age"
          placeholder="e.g. 4 years or 6 months"
          value={pet.age}
          maxLength={60}
          onChange={(e) => set("age", e.target.value)}
          required
        />
      </div>
      <div className="field-row">
        <Select
          label="Size"
          value={pet.size}
          onChange={(e) => set("size", e.target.value as Pet["size"])}
        >
          <option value="small">Small · under 25 lb</option>
          <option value="medium">Medium · 25–50 lb</option>
          <option value="large">Large · 51–90 lb</option>
          <option value="extra-large">Extra large · over 90 lb</option>
        </Select>
        <Select
          label="Sex (optional)"
          value={pet.sex}
          onChange={(e) => set("sex", e.target.value as Pet["sex"])}
        >
          <option value="unspecified">Prefer not to say</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </Select>
      </div>
      {(
        [
          [
            "feeding",
            "Feeding routine",
            "Meals, times, and any food sensitivities",
          ],
          [
            "medications",
            "Medications",
            "Name, dose, timing, and how it’s given",
          ],
          [
            "behavior",
            "Personality & temperament",
            "What helps them feel comfortable?",
          ],
          [
            "instructions",
            "Special instructions",
            "Anything else I should know?",
          ],
        ] as const
      ).map(([key, label, placeholder]) => (
        <Textarea
          key={key}
          label={label}
          placeholder={placeholder}
          value={pet[key]}
          onChange={(e) => set(key, e.target.value)}
          maxLength={3000}
        />
      ))}
      <div className="field-row">
        <Field
          label="Vet / clinic (optional)"
          value={pet.vet}
          maxLength={200}
          onChange={(e) => set("vet", e.target.value)}
        />
        <Field
          label="Emergency contact (optional)"
          value={pet.emergencyContact}
          maxLength={200}
          onChange={(e) => set("emergencyContact", e.target.value)}
        />
      </div>
    </div>
  )
}
export function BookingForm({
  initialService,
}: {
  initialService?: ServiceSlug
}) {
  const [step, setStep] = useState(0)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState("")
  const titleRef = useRef<HTMLHeadingElement>(null)
  const errorRef = useRef<HTMLDivElement>(null)
  const started = useRef(false)
  const [data, setData] = useState<Draft>(() => ({
    requestId: crypto.randomUUID(),
    service: initialService || "house-sitting",
    startDate: "",
    endDate: "",
    preferredTime: "",
    duration: "30",
    visitsPerDay: 1,
    pets: [
      {
        ...blankPet(),
        species: initialService === "cat-sitting" ? "cat" : "dog",
      },
    ],
    care: {
      routine: "",
      walks: "",
      alone: "unsure",
      maxAlone: "",
      sleeping: "",
      medication: "",
      access: "",
      other: "",
    },
    location: { address: "", unit: "", city: "", zip: "" },
    contact: { name: "", email: "", phone: "", preferredContact: "email" },
    consent: false,
    website: "",
  }))
  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setData((old) => ({ ...old, [key]: value }))
  }
  function move(next: number) {
    setError("")
    setStep(next)
    requestAnimationFrame(() => {
      titleRef.current?.focus()
      titleRef.current?.scrollIntoView({ block: "start", behavior: "smooth" })
    })
  }
  async function advance(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!started.current) {
      conversion("booking_flow_started")
      started.current = true
    }
    setError("")
    const schemas = [
      z.object({ service: bookingSchema.shape.service }),
      dateSchema,
      z.object({ pets: z.array(petSchema).min(1).max(8) }),
      z.object({ care: careSchema }),
      z.object({ location: locationSchema }),
      z.object({ contact: contactSchema }),
      bookingSchema,
    ]
    const website = new FormData(e.currentTarget).get("website")
    const parsed = schemas[step].safeParse({
      ...data,
      website: typeof website === "string" ? website : "",
    })
    if (!parsed.success) {
      setError(
        parsed.error.issues
          .map((i) => i.message)
          .slice(0, 3)
          .join(" ")
      )
      requestAnimationFrame(() => errorRef.current?.focus())
      return
    }
    if (step < 6) {
      move(step + 1)
      return
    }
    setBusy(true)
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const payload = await response.json()
      if (!response.ok)
        throw new Error(
          payload.error || "Your request couldn’t be saved. Please try again."
        )
      setResult(payload.url)
      conversion("booking_request_submitted")
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Your request couldn’t be saved. Please try again."
      )
      requestAnimationFrame(() => errorRef.current?.focus())
    } finally {
      setBusy(false)
    }
  }
  const service = services.find((s) => s.slug === data.service)!
  const estimate = estimateBooking(data)
  const visits = ![
    "daycare",
    "boarding",
    "house-sitting",
    "puppy-care",
  ].includes(data.service)
  if (result)
    return (
      <div className="panel success-card">
        <span className="success-icon">
          <Check size={28} />
        </span>
        <span className="eyebrow">A GOOD FIRST STEP.</span>
        <h1>Request received.</h1>
        <p>
          Thanks for telling me about {data.pets.map((p) => p.name).join(" & ")}
          . I’ll review your dates and pet details and get back to you
          personally.
        </p>
        <div className="form-info">
          Your request is saved. Care is confirmed only after we’ve discussed
          the details. Keep your private status link somewhere safe.
        </div>
        <Link className="button" href={result}>
          View your request <ArrowRight size={16} />
        </Link>
        <p style={{ fontSize: 11, marginTop: 20 }}>
          You can follow the request at the link above, even if an email hasn’t
          arrived.
        </p>
      </div>
    )
  return (
    <div className="form-shell">
      <div className="form-heading">
        <span className="eyebrow">LET’S GET TO KNOW YOUR PET.</span>
        <h1>Good care starts here.</h1>
        <p>A few details now. A personal conversation next.</p>
      </div>
      <div className="booking-layout">
        <aside>
          <ol className="booking-steps" aria-label="Booking progress">
            {steps.map((s, i) => (
              <li key={s}>
                <button
                  className={step === i ? "active" : ""}
                  aria-current={step === i ? "step" : undefined}
                  disabled={i > step || busy}
                  onClick={() => move(i)}
                  aria-label={`Step ${i + 1}: ${s}`}
                >
                  <span>{i < step ? <Check size={12} /> : i + 1}</span>
                  {s}
                </button>
              </li>
            ))}
          </ol>
          <p className="booking-side-note">
            <ShieldCheck
              size={19}
              style={{ marginBottom: 10, color: "#74865f" }}
            />
            Your details stay private.
            <br />
            No payment to request.
            <br />
            Drew reviews every booking.
          </p>
        </aside>
        <form className="form-card" onSubmit={advance}>
          <Honeypot />
          <span className="eyebrow">STEP {step + 1} OF 7</span>
          <h2 tabIndex={-1} ref={titleRef}>
            {steps[step]}
          </h2>
          <p>
            {
              [
                "What kind of help would make your day easier?",
                "When would you like a little extra help?",
                "The little details make all the difference.",
                "Help me picture a normal day for your pet.",
                "Where will care be needed? Your address stays private.",
                "How should I get back to you?",
                "Take a look. Nothing is confirmed until we’ve talked.",
              ][step]
            }
          </p>
          {step === 0 && (
            <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
              <legend className="sr-only">Choose a service</legend>
              <div className="service-options">
                {services.map((s) => (
                  <label key={s.slug} className="service-option">
                    <input
                      type="radio"
                      name="service"
                      value={s.slug}
                      checked={data.service === s.slug}
                      onChange={() => {
                        update("service", s.slug)
                      }}
                    />
                    {s.name}
                    <span>
                      {s.price
                        ? `From ${money(s.price)} / ${s.unit}`
                        : "Personally quoted"}
                    </span>
                  </label>
                ))}
              </div>
              <div className="form-info">
                Not sure? Start with the closest match. We can fine-tune the
                plan together.
              </div>
            </fieldset>
          )}
          {step === 1 && (
            <>
              <div className="field-row">
                <Field
                  label={overnight(data.service) ? "Arrival date" : "First day"}
                  type="date"
                  min={today()}
                  value={data.startDate}
                  required
                  onChange={(e) =>
                    setData((old) => ({
                      ...old,
                      startDate: e.target.value,
                      endDate:
                        !overnight(old.service) &&
                        (!old.endDate || old.endDate < e.target.value)
                          ? e.target.value
                          : old.endDate,
                    }))
                  }
                />
                <Field
                  label={
                    overnight(data.service)
                      ? "Departure date"
                      : "Last day (same day is fine)"
                  }
                  type="date"
                  min={data.startDate || today()}
                  value={data.endDate}
                  required
                  onChange={(e) => update("endDate", e.target.value)}
                />
              </div>
              <Field
                label="Preferred time / arrival window (optional)"
                placeholder="e.g. around noon, or between 3–5 pm"
                maxLength={100}
                value={data.preferredTime}
                onChange={(e) => update("preferredTime", e.target.value)}
              />
              {visits && (
                <div className="field-row">
                  <Select
                    label="Visit length"
                    value={data.duration}
                    onChange={(e) =>
                      update("duration", e.target.value as "30" | "60")
                    }
                  >
                    <option value="30">30 minutes · from $22</option>
                    <option value="60">60 minutes · from $35</option>
                  </Select>
                  <Select
                    label="Visits / walks per day"
                    value={data.visitsPerDay}
                    onChange={(e) =>
                      update("visitsPerDay", Number(e.target.value))
                    }
                  >
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option value={n} key={n}>
                        {n} per day
                      </option>
                    ))}
                  </Select>
                </div>
              )}
              <p className="form-info">
                These are your requested dates. I’ll personally check
                availability before confirming.
              </p>
            </>
          )}
          {step === 2 && (
            <>
              {data.pets.map((pet, i) => (
                <PetEditor
                  key={i}
                  pet={pet}
                  index={i}
                  canRemove={data.pets.length > 1}
                  update={(p) =>
                    update(
                      "pets",
                      data.pets.map((x, j) => (j === i ? p : x))
                    )
                  }
                  remove={() =>
                    update(
                      "pets",
                      data.pets.filter((_, j) => i !== j)
                    )
                  }
                />
              ))}
              {data.pets.length < 8 && (
                <button
                  type="button"
                  className="button secondary"
                  onClick={() =>
                    update("pets", [
                      ...data.pets,
                      {
                        ...blankPet(),
                        species: data.service === "cat-sitting" ? "cat" : "dog",
                      },
                    ])
                  }
                >
                  <Plus size={16} /> Add another pet
                </button>
              )}
            </>
          )}
          {step === 3 && (
            <>
              <Textarea
                label="Preferred routine"
                placeholder="Meals, playtime, favorite spots, or anything that makes the day familiar."
                maxLength={3000}
                value={data.care.routine}
                onChange={(e) =>
                  update("care", { ...data.care, routine: e.target.value })
                }
              />
              {data.pets.some((p) => p.species === "dog") && (
                <Field
                  label="Usual walks / potty breaks"
                  placeholder="e.g. two walks and a bedtime potty break"
                  maxLength={100}
                  value={data.care.walks}
                  onChange={(e) =>
                    update("care", { ...data.care, walks: e.target.value })
                  }
                />
              )}
              <div className="field-row">
                <Select
                  label="Can your pet be left alone?"
                  value={data.care.alone}
                  onChange={(e) =>
                    update("care", {
                      ...data.care,
                      alone: e.target.value as "yes" | "no" | "unsure",
                    })
                  }
                >
                  <option value="unsure">Let’s discuss</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </Select>
                {data.care.alone === "yes" && (
                  <Field
                    label="Maximum time alone"
                    placeholder="e.g. 3 hours"
                    maxLength={100}
                    value={data.care.maxAlone}
                    onChange={(e) =>
                      update("care", { ...data.care, maxAlone: e.target.value })
                    }
                  />
                )}
              </div>
              {overnight(data.service) && (
                <Textarea
                  label="Sleeping arrangements"
                  maxLength={3000}
                  value={data.care.sleeping}
                  onChange={(e) =>
                    update("care", { ...data.care, sleeping: e.target.value })
                  }
                />
              )}
              <Textarea
                label="Medication care requirements"
                hint="I’ll review any special care needs before accepting the booking."
                maxLength={3000}
                value={data.care.medication}
                onChange={(e) =>
                  update("care", { ...data.care, medication: e.target.value })
                }
              />
              {!["boarding", "daycare"].includes(data.service) && (
                <Textarea
                  label="Home access arrangements"
                  hint="Please don’t enter door codes, alarm codes, or key locations. We’ll arrange those securely after confirmation."
                  maxLength={3000}
                  value={data.care.access}
                  onChange={(e) =>
                    update("care", { ...data.care, access: e.target.value })
                  }
                />
              )}
              <Textarea
                label="Anything else?"
                maxLength={3000}
                value={data.care.other}
                onChange={(e) =>
                  update("care", { ...data.care, other: e.target.value })
                }
              />
            </>
          )}
          {step === 4 && (
            <>
              <Field
                label="Street address"
                autoComplete="street-address"
                required
                maxLength={200}
                value={data.location.address}
                onChange={(e) =>
                  update("location", {
                    ...data.location,
                    address: e.target.value,
                  })
                }
              />
              <Field
                label="Apartment / unit (optional)"
                maxLength={60}
                value={data.location.unit}
                onChange={(e) =>
                  update("location", { ...data.location, unit: e.target.value })
                }
              />
              <div className="field-row">
                <Field
                  label="City"
                  autoComplete="address-level2"
                  required
                  maxLength={100}
                  value={data.location.city}
                  onChange={(e) =>
                    update("location", {
                      ...data.location,
                      city: e.target.value,
                    })
                  }
                />
                <Field
                  label="ZIP code"
                  autoComplete="postal-code"
                  inputMode="numeric"
                  required
                  pattern="[0-9]{5}"
                  maxLength={5}
                  value={data.location.zip}
                  onChange={(e) =>
                    update("location", {
                      ...data.location,
                      zip: e.target.value,
                    })
                  }
                />
              </div>
              {data.location.zip.length === 5 && data.location.city && (
                <div className="form-info">
                  {inServiceArea(data.location.city, data.location.zip)
                    ? "You’re in one of our local communities. I’ll confirm travel and scheduling when I review your request."
                    : "You may be just outside the standard service area. Submit the request and I’ll let you know if I can accommodate it."}
                </div>
              )}
              <p className="form-info">
                {["boarding", "daycare"].includes(data.service)
                  ? "This is your home address. The care location and drop-off arrangements will be discussed before confirmation."
                  : "Based in Fox River Grove, serving Cary, Barrington, Crystal Lake, Algonquin, Lake in the Hills, and nearby communities."}
              </p>
            </>
          )}
          {step === 5 && (
            <>
              <Field
                label="Your full name"
                autoComplete="name"
                required
                maxLength={150}
                value={data.contact.name}
                onChange={(e) =>
                  update("contact", { ...data.contact, name: e.target.value })
                }
              />
              <Field
                label="Email address"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                value={data.contact.email}
                onChange={(e) =>
                  update("contact", { ...data.contact, email: e.target.value })
                }
              />
              <Field
                label="Phone number"
                type="tel"
                autoComplete="tel"
                required
                maxLength={30}
                value={data.contact.phone}
                onChange={(e) =>
                  update("contact", { ...data.contact, phone: e.target.value })
                }
              />
              <Select
                label="Best way to reach you"
                value={data.contact.preferredContact}
                onChange={(e) =>
                  update("contact", {
                    ...data.contact,
                    preferredContact: e.target.value as
                      "email" | "text" | "phone",
                  })
                }
              >
                <option value="email">Email</option>
                <option value="text">Text message</option>
                <option value="phone">Phone call</option>
              </Select>
              <p className="form-info">
                I’ll use these details to discuss your request and share care
                updates. No marketing lists.
              </p>
            </>
          )}
          {step === 6 && (
            <>
              <div>
                {[
                  ["Care", service.name],
                  ["Dates", `${data.startDate} → ${data.endDate}`],
                  [
                    "Preferred time",
                    data.preferredTime || "Flexible / to discuss",
                  ],
                  ["Pets", data.pets.map((p) => p.name).join(", ")],
                  ["Location", `${data.location.city}, ${data.location.zip}`],
                  ["Contact", `${data.contact.name} · ${data.contact.email}`],
                  [
                    "Starting estimate",
                    estimate
                      ? `${money(estimate.cents)} · ${estimate.units} ${estimate.unit}${estimate.units === 1 ? "" : "s"}`
                      : "Personal quote after review",
                  ],
                ].map(([label, value]) => (
                  <div className="review-row" key={label}>
                    <span>{label}</span>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
              <div className="form-info">
                This is a starting estimate, not a final quote. Holidays,
                additional pets, and special care can change pricing. You’ll
                agree to the total before confirming.
              </div>
              <label className="consent">
                <input
                  type="checkbox"
                  required
                  checked={data.consent}
                  onChange={(e) => update("consent", e.target.checked)}
                />
                <span>
                  I understand this is a request, not a confirmed booking, and
                  agree to the{" "}
                  <Link href="/terms" target="_blank">
                    terms
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" target="_blank">
                    privacy policy
                  </Link>
                  .
                </span>
              </label>
            </>
          )}
          {error && (
            <div
              role="alert"
              tabIndex={-1}
              ref={errorRef}
              className="form-error"
            >
              {error}
            </div>
          )}
          <div className="form-actions">
            {step > 0 ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => move(step - 1)}
                className="button secondary"
              >
                <ArrowLeft size={15} /> Back
              </button>
            ) : (
              <span />
            )}
            <button className="button" type="submit" disabled={busy}>
              {busy
                ? "Saving your request…"
                : step === 6
                  ? "Request booking"
                  : "Continue"}
              {!busy && <ArrowRight size={16} />}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
