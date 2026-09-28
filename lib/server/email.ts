import "server-only"
import { Resend } from "resend"
import { HttpError } from "./security"
export function emailConfig() {
  const { RESEND_API_KEY: key, EMAIL_FROM: from, ADMIN_EMAIL: to } = process.env
  if (!key || !from || !to)
    throw new HttpError(
      503,
      "The form is temporarily unavailable. Please contact Drew directly using the contact page."
    )
  return { key, from, to }
}
export async function sendRequestEmails(input: {
  id: string
  email: string
  subject: string
  body: string
  confirmation: string
}) {
  const { key, from, to } = emailConfig()
  const resend = new Resend(key)
  // Stable provider keys make retries safe if either email fails or the response is lost.
  for (const message of [
    {
      to,
      replyTo: input.email,
      subject: input.subject,
      text: input.body,
      suffix: "drew",
    },
    {
      to: input.email,
      replyTo: to,
      subject: "Thanks for contacting Drew’s Pet Care",
      text: input.confirmation,
      suffix: "customer",
    },
  ]) {
    const { suffix, ...mail } = message
    const result = await resend.emails.send(
      { from, ...mail },
      { idempotencyKey: `${input.id}/${suffix}` }
    )
    if (result.error)
      throw new HttpError(
        503,
        "We couldn’t finish sending your emails. Please retry this form; Drew may already have received your request."
      )
  }
}
