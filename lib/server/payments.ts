import "server-only"
import Stripe from "stripe"
import { and, eq, inArray, desc } from "drizzle-orm"
import { getDb } from "@/lib/db"
import * as t from "@/lib/db/schema"
import { paymentEligible } from "@/lib/validation"
import { findBookingByToken } from "./bookings"
import { HttpError } from "./security"
import { site, services } from "@/lib/content"
let stripe: Stripe | undefined
export function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY)
    throw new HttpError(
      503,
      "Online payment isn’t available yet. Drew will send payment instructions."
    )
  return (stripe ??= new Stripe(process.env.STRIPE_SECRET_KEY, {
    maxNetworkRetries: 2,
  }))
}
export async function startCheckout(
  token: string,
  kind: "deposit" | "full" | "balance"
) {
  const db = getDb()
  const request = await findBookingByToken(db, token)
  if (!request) throw new HttpError(404, "This booking link is unavailable.")
  return db.transaction(async (tx) => {
    const [r] = await tx
      .select()
      .from(t.bookingRequests)
      .where(eq(t.bookingRequests.id, request.id))
      .for("update")
    if (!paymentEligible(r.status, r.finalCents, r.paidCents))
      throw new HttpError(409, "This booking is not eligible for payment.")
    const [pending] = await tx
      .select()
      .from(t.payments)
      .where(
        and(
          eq(t.payments.requestId, r.id),
          inArray(t.payments.status, ["creating", "pending"])
        )
      )
    if (pending?.sessionId) {
      const existing = await getStripe().checkout.sessions.retrieve(
        pending.sessionId
      )
      if (existing.status === "open" && existing.url) return existing.url
      if (existing.status === "complete")
        throw new HttpError(
          409,
          "Your payment is processing. Please check your status page shortly."
        )
      await tx
        .update(t.payments)
        .set({ status: "expired" })
        .where(eq(t.payments.id, pending.id))
    }
    if (kind === "deposit" && (!r.depositCents || r.paidCents > 0))
      throw new HttpError(400, "A deposit is not available for this booking.")
    const amount =
      kind === "deposit" ? r.depositCents! : r.finalCents! - r.paidCents
    if (amount < 100)
      throw new HttpError(400, "Please contact Drew to settle this balance.")
    const [lastPayment] = await tx
      .select()
      .from(t.payments)
      .where(eq(t.payments.requestId, r.id))
      .orderBy(desc(t.payments.createdAt))
      .limit(1)
    const id = crypto.randomUUID()
    const checkout = await getStripe().checkout.sessions.create(
      {
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              unit_amount: amount,
              product_data: {
                name: `Drew’s Pet Care · ${services.find((s) => s.slug === r.service)?.name} · ${kind}`,
              },
            },
            quantity: 1,
          },
        ],
        metadata: { requestId: r.id, paymentId: id, kind },
        success_url: `${site.url}/booking/${token}?payment=received`,
        cancel_url: `${site.url}/booking/${token}?payment=cancelled`,
        expires_at: Math.floor(Date.now() / 1000) + 1800,
      },
      {
        idempotencyKey: `care:${r.id}:${r.finalCents}:${r.paidCents}:${kind}:${lastPayment?.id || "initial"}`,
      }
    )
    if (!checkout.url)
      throw new HttpError(503, "Couldn’t open checkout. Please try again.")
    await tx
      .insert(t.payments)
      .values({
        id: checkout.metadata?.paymentId || id,
        requestId: r.id,
        sessionId: checkout.id,
        kind,
        amountCents: amount,
        status: "pending",
        url: checkout.url,
      })
    await tx
      .update(t.bookingRequests)
      .set({
        status: r.status === "approved" ? "payment_pending" : r.status,
        updatedAt: new Date(),
      })
      .where(eq(t.bookingRequests.id, r.id))
    return checkout.url
  })
}
export async function handleStripeEvent(event: Stripe.Event) {
  if (
    ![
      "checkout.session.completed",
      "checkout.session.async_payment_succeeded",
      "checkout.session.expired",
    ].includes(event.type)
  )
    return
  const session = event.data.object as Stripe.Checkout.Session
  await getDb().transaction(async (tx) => {
    const inserted = await tx
      .insert(t.stripeEvents)
      .values({ id: event.id })
      .onConflictDoNothing()
      .returning()
    if (!inserted.length) return
    const [payment] = await tx
      .select()
      .from(t.payments)
      .where(eq(t.payments.sessionId, session.id))
    if (!payment) throw new Error("PAYMENT_NOT_FOUND")
    const [request] = await tx
      .select()
      .from(t.bookingRequests)
      .where(eq(t.bookingRequests.id, payment.requestId))
      .for("update")
    if (payment.status === "paid" || payment.status === "review") return
    if (event.type === "checkout.session.expired") {
      await tx
        .update(t.payments)
        .set({ status: "expired" })
        .where(eq(t.payments.id, payment.id))
      return
    }
    if (session.payment_status !== "paid") return
    if (
      session.currency !== "usd" ||
      session.amount_total !== payment.amountCents ||
      session.metadata?.requestId !== request.id
    )
      throw new Error("PAYMENT_MISMATCH")
    const needsReview = !["approved", "payment_pending", "confirmed"].includes(
      request.status
    )
    const total = request.paidCents + payment.amountCents
    await tx
      .update(t.payments)
      .set({
        status: needsReview ? "review" : "paid",
        paymentIntentId:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : null,
      })
      .where(eq(t.payments.id, payment.id))
    await tx
      .update(t.bookingRequests)
      .set({
        paidCents: total,
        status: needsReview ? request.status : "confirmed",
        updatedAt: new Date(),
      })
      .where(eq(t.bookingRequests.id, request.id))
    if (!needsReview)
      await tx
        .insert(t.bookings)
        .values({ requestId: request.id })
        .onConflictDoNothing()
    const [client] = await tx
      .select()
      .from(t.clients)
      .where(eq(t.clients.id, request.clientId))
    await tx
      .insert(t.emailOutbox)
      .values({
        dedupeKey: `payment:${payment.id}`,
        to: client.email,
        subject: needsReview
          ? "Payment received — Drew will follow up"
          : "Your pet care payment is received",
        body: needsReview
          ? "Your payment was received, but the booking needs a personal review. Drew will follow up. This message does not confirm care."
          : "Thanks for your payment. Your booking is confirmed. Any remaining balance is shown on your private booking page. — Drew",
      })
      .onConflictDoNothing()
    if (needsReview && process.env.ADMIN_EMAIL)
      await tx
        .insert(t.emailOutbox)
        .values({
          dedupeKey: `payment-review:${payment.id}`,
          to: process.env.ADMIN_EMAIL,
          subject: "Payment needs your review",
          body: `A payment arrived for a booking requiring review. Check ${site.url}/admin/requests/${request.id} and Stripe before arranging care or a refund.`,
        })
        .onConflictDoNothing()
  })
}
