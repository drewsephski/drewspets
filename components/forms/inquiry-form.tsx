"use client"

import { ArrowUpRight } from "@/components/site/arrows"
import { FormFeedback } from "./form-feedback"
import { useRef, useState, type FormEvent } from "react"
import Link from "next/link"
import { Check } from "lucide-react"
import { applicationSchema, inquirySchema } from "@/lib/validation"
import { conversion } from "@/components/site/analytics"
import { Field, Textarea, Honeypot } from "./fields"
import { Button } from "@/components/ui/button"
export function InquiryForm({
  application = false,
}: {
  application?: boolean
}) {
  const requestId = useRef("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (busy) return
    setError("")
    requestId.current ||= crypto.randomUUID()
    const fd = new FormData(e.currentTarget)
    const input = {
      ...Object.fromEntries(fd),
      requestId: requestId.current,
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
      <FormFeedback className="panel" role="status">
        <span className="success-icon">
          <Check />
        </span>
        <h2 style={{ fontSize: 30 }}>
          {application
            ? "Thanks for introducing yourself."
            : "Thanks for saying hello."}
        </h2>
        <p style={{ marginTop: 18 }}>
          {application
            ? "I’ll keep your details for the future and get in touch if there’s an opportunity that feels like a good fit."
            : "I’ve got your message and will get back to you personally. Talk soon!"}
        </p>
        <Link className="text-link" href="/" style={{ marginTop: 20 }}>
          Back to home <ArrowUpRight size={16} />
        </Link>
      </FormFeedback>
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
          <Field label="City" name="city" maxLength={100} required />
          <Textarea
            label="A little about your pet care experience"
            name="message"
            maxLength={2000}
            required
          />
        </>
      ) : (
        <Textarea
          label="How can I help?"
          name="message"
          maxLength={2000}
          required
          hint="Have dates in mind? The care request form is the quickest place to start. Please leave out door codes and other private details."
        />
      )}
      <p className="request-privacy">
        By sending this form, you agree that Drew may contact you about your{" "}
        {application ? "interest" : "message"}.{" "}
        <Link href="/privacy">Privacy policy</Link>.
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
        {busy
          ? "Sending…"
          : application
            ? "Send my information"
            : "Send message"}
        <ArrowUpRight size={17} />
      </Button>
    </form>
  )
}
