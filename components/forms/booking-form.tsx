"use client"
import { FormFeedback } from "./form-feedback"
import { useRef, useState, type FormEvent } from "react"
import { addDays, format, parseISO } from "date-fns"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { services, money, type ServiceSlug } from "@/lib/content"
import { bookingSchema, overnight, today } from "@/lib/validation"
import { conversion } from "@/components/site/analytics"
import { DateField, Field, Select, Textarea, Honeypot } from "./fields"
import { Button } from "@/components/ui/button"
export function BookingForm({
  initialService,
  initialReferral,
}: {
  initialService?: ServiceSlug
  initialReferral?: string
}) {
  const [service, setService] = useState(initialService || "house-sitting")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [started, setStarted] = useState(false)
  const requestId = useRef("")
  const selected = services.find((s) => s.slug === service)!
  const earliestEnd = startDate
    ? format(
        addDays(parseISO(startDate), overnight(service) ? 1 : 0),
        "yyyy-MM-dd"
      )
    : today()
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    setError("")
    const fd = new FormData(event.currentTarget)
    requestId.current ||= crypto.randomUUID()
    const parsed = bookingSchema.safeParse({
      ...Object.fromEntries(fd),
      requestId: requestId.current,
      petCount: Number(fd.get("petCount")),
      endDate: fd.get("endDate") || fd.get("startDate"),
    })
    if (!parsed.success) {
      setError(parsed.error.issues[0].message)
      return
    }
    setBusy(true)
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error)
      setSuccess(true)
      conversion("booking_request_submitted")
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Please try again or contact Drew directly."
      )
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="shell request-shell">
      {success ? (
        <FormFeedback className="request-success" role="status">
          <h1>Thanks for reaching out.</h1>
          <p>
            Thanks — I’ll personally review your request and get back to you
            shortly.
          </p>
          <p>
            Look out for a confirmation email. Your dates aren’t reserved yet;
            we’ll agree on the details and price together.
          </p>
          <Link href="/" className="text-link">
            Back to home <ArrowUpRight size={17} />
          </Link>
        </FormFeedback>
      ) : (
        <>
          <div className="form-heading">
            <h1>Let’s plan your pet’s care.</h1>
            <p>
              Tell me a little about your pets and dates. I’ll get back to you
              personally. About 1–2 minutes, with no payment needed.
            </p>
          </div>
          <form
            className="form-card request-form"
            onSubmit={submit}
            onFocus={() => {
              if (!started) {
                setStarted(true)
                conversion("booking_request_started")
              }
            }}
            aria-busy={busy}
          >
            <Honeypot />
            <fieldset disabled={busy}>
              <legend>Care & dates</legend>
              <Select
                label="Service"
                name="service"
                value={service}
                required
                onValueChange={(value) => {
                  if (value) setService(value as ServiceSlug)
                }}
                options={services.map((s) => ({
                  value: s.slug,
                  label: s.name,
                }))}
              />
              <p className="request-rate">
                {selected.price
                  ? `From ${money(selected.price)} / ${selected.unit}.`
                  : "Personally quoted after we talk."}{" "}
                We’ll agree on your final price before confirming.
              </p>
              <div className="field-row">
                <DateField
                  label={overnight(service) ? "Start date" : "Requested date"}
                  name="startDate"
                  min={today()}
                  value={startDate}
                  onChange={setStartDate}
                  required
                />
                <DateField
                  label={
                    overnight(service)
                      ? "End date"
                      : "End date (optional for one day)"
                  }
                  name="endDate"
                  min={earliestEnd}
                  value={endDate}
                  onChange={setEndDate}
                  required={overnight(service)}
                />
              </div>
            </fieldset>
            <fieldset disabled={busy}>
              <legend>Your pets</legend>
              <div className="field-row">
                <Field
                  label="Number of pets"
                  name="petCount"
                  type="number"
                  min={1}
                  max={30}
                  defaultValue={1}
                  required
                />
                <Select
                  label="Type of pets"
                  name="petType"
                  defaultValue="Dogs"
                  required
                  options={["Dogs", "Cats", "Dogs and cats", "Other"].map(
                    (value) => ({ value, label: value })
                  )}
                />
              </div>
              <Field
                label="Pet names"
                name="petNames"
                maxLength={300}
                required
              />
              <Textarea
                label="Tell me about your pets / anything important (optional)"
                name="petDetails"
                maxLength={2000}
                hint="A sentence or two is plenty. We’ll talk through routines and care details later."
              />
            </fieldset>
            <fieldset disabled={busy}>
              <legend>How to reach you</legend>
              <Field
                label="City or ZIP"
                name="cityZip"
                maxLength={100}
                required
                hint="No street address needed yet."
              />
              <Field
                label="Name"
                name="name"
                autoComplete="name"
                maxLength={150}
                required
              />
              <div className="field-row">
                <Field
                  label="Phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  maxLength={30}
                  required
                />
                <Field
                  label="Email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  maxLength={254}
                  required
                />
              </div>
              <Field
                label="Referred by someone? Their name (optional)"
                name="referredBy"
                maxLength={100}
                defaultValue={initialReferral}
              />
              <Textarea
                label="Anything else? (optional)"
                name="message"
                maxLength={2000}
              />
            </fieldset>
            <p className="request-privacy">
              By sending this request, you agree that Drew may contact you about
              care. <Link href="/privacy">Privacy policy</Link>. Please leave
              out door codes and other sensitive details.
            </p>
            {error && (
              <FormFeedback className="form-error" role="alert">
                {error} <Link href="/contact">Contact Drew</Link>
              </FormFeedback>
            )}
            <Button
              type="submit"
              className="site-button"
              size="lg"
              disabled={busy}
            >
              {busy ? "Sending…" : "Send care request"}
              <ArrowUpRight size={17} />
            </Button>
          </form>
        </>
      )}
    </div>
  )
}
