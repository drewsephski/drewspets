import "server-only"
import { createHmac, timingSafeEqual } from "node:crypto"
import { and, eq, isNull } from "drizzle-orm"
import { z } from "zod"
import { getDb } from "@/lib/db"
import { paymentNotifications } from "@/lib/db/schema"
import { HttpError } from "./security"
import { sendAdminSms, SmsError, smsConfig } from "./sms"

const configSchema = z.object({
  secret: z.string().startsWith("whsec_").min(12),
  paymentLinkId: z.string().regex(/^plink_[A-Za-z0-9]+$/),
})
const eventSchema = z.object({
  id: z.string().regex(/^evt_[A-Za-z0-9_]+$/),
  type: z.string(),
  livemode: z.boolean(),
  data: z.object({ object: z.unknown() }),
})
const sessionSchema = z.object({
  id: z.string().regex(/^cs_live_[A-Za-z0-9_]+$/),
  object: z.literal("checkout.session"),
  payment_link: z.string().nullable(),
  payment_status: z.string(),
  amount_total: z.number().int().positive().max(99999999),
  currency: z.literal("usd"),
  customer_details: z
    .object({ name: z.string().nullable(), email: z.string().nullable() })
    .nullable(),
})

async function signedBody(request: Request, secret: string) {
  const fields = (request.headers.get("stripe-signature") || "")
    .split(",")
    .map((part) => part.trim().split("="))
  const timestamps = fields.filter(([key]) => key === "t")
  const timestamp = timestamps[0]?.[1] || ""
  if (
    timestamps.length !== 1 ||
    !/^\d+$/.test(timestamp) ||
    Math.abs(Date.now() / 1000 - Number(timestamp)) > 300
  )
    throw new HttpError(400, "Invalid Stripe signature")

  const maxBytes = 65536
  if (Number(request.headers.get("content-length")) > maxBytes)
    throw new HttpError(413, "Webhook payload too large")
  const reader = request.body?.getReader()
  if (!reader) throw new HttpError(400, "Missing webhook payload")
  const chunks: Uint8Array[] = []
  let size = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    size += value.byteLength
    if (size > maxBytes) {
      await reader.cancel()
      throw new HttpError(413, "Webhook payload too large")
    }
    chunks.push(value)
  }
  const body = Buffer.concat(chunks)
  // Stripe signs the timestamp plus the unmodified body. Only v1 is accepted.
  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.`)
    .update(body)
    .digest()
  const valid = fields.some(
    ([key, value]) =>
      key === "v1" &&
      /^[a-fA-F0-9]{64}$/.test(value || "") &&
      timingSafeEqual(expected, Buffer.from(value, "hex"))
  )
  if (!valid) throw new HttpError(400, "Invalid Stripe signature")
  try {
    return JSON.parse(body.toString("utf8")) as unknown
  } catch {
    throw new HttpError(400, "Invalid webhook payload")
  }
}

export async function notifyPayment(request: Request) {
  try {
    const config = configSchema.parse({
      secret: process.env.STRIPE_PAYMENT_WEBHOOK_SECRET,
      paymentLinkId: process.env.STRIPE_PAYMENT_LINK_ID,
    })
    const parsed = eventSchema.safeParse(
      await signedBody(request, config.secret)
    )
    if (!parsed.success) throw new HttpError(400, "Invalid Stripe event")
    const event = parsed.data
    if (
      !event.livemode ||
      ![
        "checkout.session.completed",
        "checkout.session.async_payment_succeeded",
      ].includes(event.type)
    )
      return Response.json({ received: true })

    // Ignore unpaid sessions and other businesses' links before requiring SMS.
    const object = z
      .object({
        payment_link: z.string().nullable(),
        payment_status: z.string(),
      })
      .safeParse(event.data.object)
    if (!object.success) throw new HttpError(400, "Invalid checkout session")
    if (
      object.data.payment_link !== config.paymentLinkId ||
      object.data.payment_status !== "paid"
    )
      return Response.json({ received: true })
    const session = sessionSchema.safeParse(event.data.object)
    if (!session.success)
      throw new HttpError(400, "Invalid paid checkout session")
    smsConfig()
    const db = getDb()
    // One claim per Checkout Session, including distinct event types and IDs.
    // Retain the claim on an ambiguous timeout to prevent duplicate paid sends.
    await db
      .insert(paymentNotifications)
      .values({
        sessionId: session.data.id,
        eventId: event.id,
        amountCents: session.data.amount_total,
        currency: session.data.currency,
      })
      .onConflictDoNothing()
    const [claim] = await db
      .update(paymentNotifications)
      .set({ smsAttemptedAt: new Date(), smsErrorCode: null })
      .where(
        and(
          eq(paymentNotifications.sessionId, session.data.id),
          isNull(paymentNotifications.smsAttemptedAt)
        )
      )
      .returning({ sessionId: paymentNotifications.sessionId })
    if (!claim) {
      const [saved] = await db
        .select()
        .from(paymentNotifications)
        .where(eq(paymentNotifications.sessionId, session.data.id))
      if (!saved?.smsMessageSid)
        throw new HttpError(503, "Payment alert requires delivery review")
      return Response.json({ received: true })
    }

    try {
      const customer = session.data.customer_details
      const identity = (customer?.name || customer?.email || "Customer")
        .normalize("NFKD")
        .replace(/[^\x20-\x7e]/g, "")
        .replace(/[\\^{}\[\]~|]/g, "-")
        .slice(0, 64)
      const amount = (session.data.amount_total / 100).toFixed(2)
      const sid = await sendAdminSms(
        `Drew's Pet Care\nPayment received: $${amount} USD\nFrom: ${identity}\nCheck Stripe for details. Booking confirmation is separate.`
      )
      await db
        .update(paymentNotifications)
        .set({ smsMessageSid: sid, smsErrorCode: null })
        .where(eq(paymentNotifications.sessionId, session.data.id))
    } catch (error) {
      const code = error instanceof SmsError ? error.code : "STORAGE_ERROR"
      await db
        .update(paymentNotifications)
        .set({
          smsErrorCode: code,
          // An explicit Twilio rejection did not send a message. Stripe can
          // safely retry after configuration or rate-limit issues are resolved.
          ...(error instanceof SmsError && code !== "DELIVERY_UNKNOWN"
            ? { smsAttemptedAt: null }
            : {}),
        })
        .where(eq(paymentNotifications.sessionId, session.data.id))
      console.error("Payment SMS failed", { sessionId: session.data.id, code })
      throw new HttpError(503, "Payment alert requires delivery review")
    }
    return Response.json({ received: true })
  } catch (error) {
    if (error instanceof HttpError)
      return Response.json({ error: error.message }, { status: error.status })
    console.error("Payment webhook failed", {
      error: error instanceof Error ? error.name : "UnknownError",
    })
    return Response.json(
      { error: "Payment notifications unavailable" },
      { status: 503 }
    )
  }
}
