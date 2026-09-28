"use client"
import { useState, type FormEvent } from "react"
import Link from "next/link"
import { ArrowUpRight, Check } from "lucide-react"
import { applicationSchema, inquirySchema } from "@/lib/validation"
import { conversion } from "@/components/site/analytics"
import { Field, Textarea, Select, Honeypot } from "./fields"
export function InquiryForm({
  application = false,
}: {
  application?: boolean
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    const fd = new FormData(e.currentTarget)
    const input = {
      ...Object.fromEntries(fd),
      consent: fd.get("consent") === "on",
      ...(application ? { petTypes: fd.getAll("petTypes") } : {}),
    }
    const parsed = (application ? applicationSchema : inquirySchema).safeParse(
      input
    )
    if (!parsed.success) {
      setError(parsed.error.issues[0].message)
      return
    }
    setBusy(true)
    try {
      const r = await fetch(
        application ? "/api/applications" : "/api/contact",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed.data),
        }
      )
      const p = await r.json()
      if (!r.ok) throw new Error(p.error)
      setSuccess(true)
      conversion(
        application ? "sitter_application_submitted" : "contact_form_submitted"
      )
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Your message couldn’t be saved. Please try again."
      )
    } finally {
      setBusy(false)
    }
  }
  if (success)
    return (
      <div className="panel" role="status">
        <span className="success-icon">
          <Check />
        </span>
        <h2 style={{ fontSize: 30 }}>
          {application
            ? "Thanks for introducing yourself."
            : "Your message is received."}
        </h2>
        <p style={{ marginTop: 18 }}>
          {application
            ? "Your application is saved. Drew will keep it on file and reach out if there’s a suitable opportunity as the business grows."
            : "Thanks for reaching out. Drew will review your message and respond personally."}
        </p>
        <Link className="text-link" href="/" style={{ marginTop: 20 }}>
          Back to home <ArrowUpRight size={16} />
        </Link>
      </div>
    )
  return (
    <form className="form-card" onSubmit={submit}>
      <Honeypot />
      <Field
        label="Full name"
        name="name"
        autoComplete="name"
        maxLength={150}
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
      {application ? (
        <>
          <div className="field-row">
            <Field
              label="Phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              maxLength={30}
              required
            />
            <Field label="City" name="city" maxLength={100} required />
          </div>
          <Textarea
            label="Availability"
            name="availability"
            maxLength={2000}
            placeholder="Days, times, and any regular commitments"
            required
          />
          <Textarea
            label="Pet care experience"
            name="experience"
            maxLength={4000}
            required
          />
          <fieldset style={{ border: 0, padding: 0, margin: "0 0 20px" }}>
            <legend style={{ fontSize: 12, marginBottom: 9 }}>
              Pets you’re comfortable caring for *
            </legend>
            <div style={{ display: "flex", gap: 15, flexWrap: "wrap" }}>
              {["dogs", "cats", "puppies", "senior pets"].map((p) => (
                <label key={p} style={{ fontSize: 12 }}>
                  <input type="checkbox" name="petTypes" value={p} /> {p}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="field-row">
            <Select label="Reliable transportation" name="transportation">
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </Select>
            <Select label="Overnight availability" name="overnights">
              <option value="yes">Yes</option>
              <option value="sometimes">Sometimes</option>
              <option value="no">No</option>
            </Select>
          </div>
          <Textarea
            label="Why would you like to join?"
            name="why"
            maxLength={3000}
            required
          />
          <Textarea
            label="References (optional)"
            hint="Please get permission before sharing someone’s contact details."
            name="references"
            maxLength={3000}
          />
        </>
      ) : (
        <Textarea
          label="How can I help?"
          name="message"
          maxLength={4000}
          required
          hint="For care requests, use the booking form so I have everything I need. Don’t include door codes or sensitive information here."
        />
      )}
      <label className="consent">
        <input type="checkbox" name="consent" required />
        <span>
          I agree to the <Link href="/privacy">privacy policy</Link> and consent
          to being contacted about this{" "}
          {application ? "application" : "inquiry"}.
        </span>
      </label>
      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}
      <button disabled={busy} className="button" style={{ marginTop: 23 }}>
        {busy ? "Sending…" : application ? "Send application" : "Send message"}
        <ArrowUpRight size={17} />
      </button>
    </form>
  )
}
