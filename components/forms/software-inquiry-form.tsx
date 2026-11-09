"use client"

import { useRef, useState, type FormEvent } from "react"
import Link from "next/link"
import { Check } from "lucide-react"
import { ArrowUpRight } from "@/components/site/arrows"
import { conversion } from "@/components/site/analytics"
import { Button } from "@/components/ui/button"
import { softwareInquirySchema, softwareServices } from "@/lib/validation"
import { Field, Honeypot, Select, Textarea } from "./fields"
import { FormFeedback } from "./form-feedback"

const serviceOptions = softwareServices.map((service) => ({
  value: service,
  label: service,
}))

const fallbackError =
  "Your message couldn’t be sent. Please try again in a moment."

export function SoftwareInquiryForm() {
  const [service, setService] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  // Synchronous guard: state updates are async, so a fast double submit could slip past `busy`.
  const inFlight = useRef(false)
  // Reuse the same requestId while the details are unchanged, so a retry is deduplicated;
  // a new id once the person edits what they previously sent.
  const requestId = useRef("")
  const submittedKey = useRef("")

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (inFlight.current) return
    setError("")
    if (!service) {
      setError("Choose what you’re interested in.")
      return
    }
    const fd = new FormData(event.currentTarget)
    const draft = { ...Object.fromEntries(fd), service }
    const preview = softwareInquirySchema.safeParse({
      ...draft,
      requestId: requestId.current || crypto.randomUUID(),
    })
    if (!preview.success) {
      setError(preview.error.issues[0].message)
      return
    }
    const { name, email, service: chosen, message, website } = preview.data
    const key = JSON.stringify([name, email, chosen, message, website])
    if (!requestId.current || key !== submittedKey.current) {
      requestId.current = crypto.randomUUID()
      submittedKey.current = key
    }
    const payload = { ...preview.data, requestId: requestId.current }

    inFlight.current = true
    setBusy(true)
    try {
      const response = await fetch("/api/software", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const result: unknown = await response.json().catch(() => null)
      if (
        response.status === 201 &&
        result &&
        typeof result === "object" &&
        "received" in result &&
        result.received === true
      ) {
        setSuccess(true)
        conversion("software_inquiry_submitted")
        return
      }
      const serverError =
        result &&
        typeof result === "object" &&
        "error" in result &&
        typeof result.error === "string"
          ? result.error
          : ""
      setError(serverError || fallbackError)
    } catch {
      setError(
        "We couldn’t reach the server. Check your connection and try again."
      )
    } finally {
      inFlight.current = false
      setBusy(false)
    }
  }

  if (success)
    return (
      <FormFeedback className="panel" role="status">
        <span className="success-icon">
          <Check />
        </span>
        <h2 style={{ fontSize: 30 }}>Thanks, your message is in.</h2>
        <p style={{ marginTop: 18 }}>
          I’ll read it and reply personally by email to talk through next steps.
        </p>
        <Link className="text-link" href="/" style={{ marginTop: 20 }}>
          Back to home <ArrowUpRight size={16} />
        </Link>
      </FormFeedback>
    )

  return (
    <form className="form-card" onSubmit={submit} aria-busy={busy}>
      <Honeypot />
      <Field
        label="Name"
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
      <Select
        label="Interested in"
        name="service"
        value={service}
        required
        onValueChange={(value) => setService(value ?? "")}
        options={serviceOptions}
      />
      <Textarea
        label="What do you have in mind?"
        name="message"
        maxLength={2000}
        required
        hint="A few sentences is plenty: your business and what you’d like built."
      />
      <p className="request-privacy">
        By sending this form, you agree that Drew may contact you about your
        message. <Link href="/privacy">Privacy policy</Link>.
      </p>
      {error && (
        <FormFeedback className="form-error" role="alert">
          {error}
        </FormFeedback>
      )}
      <Button
        type="submit"
        disabled={busy}
        className="site-button mt-6"
        size="lg"
      >
        {busy ? "Sending…" : "Send message"}
        <ArrowUpRight size={17} />
      </Button>
    </form>
  )
}
