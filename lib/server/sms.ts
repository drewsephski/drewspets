import "server-only"
import { and, eq, isNull } from "drizzle-orm"
import { z } from "zod"
import { getDb } from "@/lib/db"
import { inquiries } from "@/lib/db/schema"

const configSchema = z.object({
  accountSid: z.string().regex(/^AC[0-9a-fA-F]{32}$/),
  authToken: z.string().regex(/^[0-9a-fA-F]{32}$/),
  from: z.string().regex(/^\+[1-9]\d{7,14}$/),
  to: z.string().regex(/^\+[1-9]\d{7,14}$/),
})
const messageSchema = z.object({
  sid: z.string().regex(/^SM[0-9a-fA-F]{32}$/),
})
const errorSchema = z.object({ code: z.number().int() })

type SmsInput = {
  requestId: string
  subject: string
  name: string
  summary: string[]
}

// Printable GSM characters keep the alert within two SMS segments, even when
// a request contains emoji, accented names, or long contact details.
export function formatRequestSms(input: SmsInput) {
  const summary = [
    "Drew's Pet Care",
    input.subject,
    `Name: ${input.name}`,
    ...input.summary,
  ]
    .map((line) =>
      line
        .normalize("NFKD")
        .replace(/[^\x20-\x7e]/g, "")
        .replace(/[\\^{}\[\]~|]/g, "-")
        .slice(0, 64)
    )
    .join("\n")
  const footer = "\nCheck your email for full details."
  return summary.slice(0, 306 - footer.length) + footer
}

export class SmsError extends Error {
  constructor(public code: string) {
    super("SMS notification failed")
  }
}

export function smsConfig() {
  return configSchema.parse({
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    from: process.env.TWILIO_FROM_NUMBER,
    to: process.env.ADMIN_SMS_TO,
  })
}

export async function sendAdminSms(body: string) {
  const { accountSid, authToken, from, to } = smsConfig()
  let response: Response
  try {
    response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ From: from, To: to, Body: body }),
        signal: AbortSignal.timeout(5000),
        cache: "no-store",
      }
    )
  } catch {
    throw new SmsError("DELIVERY_UNKNOWN")
  }
  const result: unknown = await response.json().catch(() => null)
  if (!response.ok) {
    const error = errorSchema.safeParse(result)
    // A server failure may follow acceptance; do not automatically send again.
    throw new SmsError(
      response.status >= 500
        ? "DELIVERY_UNKNOWN"
        : error.success
          ? String(error.data.code)
          : `HTTP_${response.status}`
    )
  }
  const message = messageSchema.safeParse(result)
  if (!message.success) throw new SmsError("DELIVERY_UNKNOWN")
  return message.data.sid
}

export async function sendRequestSms(input: SmsInput) {
  const values = {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    from: process.env.TWILIO_FROM_NUMBER,
    to: process.env.ADMIN_SMS_TO,
  }
  if (!Object.values(values).some(Boolean)) return
  const config = configSchema.safeParse(values)
  if (!config.success || !process.env.DATABASE_URL) {
    console.error("SMS alert skipped: configure Twilio and DATABASE_URL")
    return
  }

  let claimed = false
  try {
    // Claim before the paid API call. Concurrent submissions and retries cannot
    // send twice. An ambiguous timeout stays claimed: Twilio may have accepted it.
    const db = getDb()
    const [claim] = await db
      .update(inquiries)
      .set({ smsAttemptedAt: new Date() })
      .where(
        and(eq(inquiries.id, input.requestId), isNull(inquiries.smsAttemptedAt))
      )
      .returning({ id: inquiries.id })
    if (!claim) return
    claimed = true

    const messageSid = await sendAdminSms(formatRequestSms(input))
    await db
      .update(inquiries)
      .set({ smsMessageSid: messageSid, smsErrorCode: null })
      .where(eq(inquiries.id, input.requestId))
  } catch (error) {
    const code = error instanceof SmsError ? error.code : "STORAGE_ERROR"
    // Log only operational identifiers, never credentials or submitted content.
    console.error("SMS alert failed", { requestId: input.requestId, code })
    if (claimed) {
      try {
        await getDb()
          .update(inquiries)
          .set({ smsErrorCode: code })
          .where(eq(inquiries.id, input.requestId))
      } catch {
        console.error("Could not record SMS error", {
          requestId: input.requestId,
        })
      }
    }
    // Email remains the primary delivery path; SMS failure never rejects a form.
  }
}
