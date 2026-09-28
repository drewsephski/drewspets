import { notFound } from "next/navigation"
import { eq, and } from "drizzle-orm"
import { getDb } from "@/lib/db"
import { bookingPets, notes } from "@/lib/db/schema"
import { findBookingByToken, publicBooking } from "@/lib/server/bookings"
import { paymentEligible } from "@/lib/validation"
import { services, money } from "@/lib/content"
import { PaymentButton } from "@/components/forms/payment-button"
export const dynamic = "force-dynamic"
export const metadata = {
  title: "Your Booking Request",
  robots: { index: false, follow: false },
  referrer: "no-referrer" as const,
}
const statusCopy: Record<string, string> = {
  new: "Drew will personally review your dates and get back to you. Your care is not confirmed yet.",
  contacted:
    "Let’s talk through the details. Drew has started reviewing your request.",
  meet_and_greet:
    "Let’s get acquainted. Drew will coordinate your meet & greet directly.",
  approved:
    "Your request is approved. Review the agreed price below and follow the payment instructions.",
  payment_pending:
    "Your payment is the next step. If you’ve just paid, allow a moment for the status to update.",
  confirmed:
    "Your care is confirmed. Drew will be in touch about the final arrangements.",
  in_progress: "Care is underway. Drew will keep you updated directly.",
  completed:
    "Thanks for trusting Drew’s Pet Care. It was a pleasure caring for your pet.",
  cancelled:
    "This booking has been cancelled. Contact Drew with questions about arrangements or any payment already made.",
  declined:
    "Drew isn’t able to accommodate this request. You’re welcome to ask about different dates.",
}
export default async function BookingStatus({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>
  searchParams: Promise<{ payment?: string }>
}) {
  const { token } = await params
  const query = await searchParams
  if (!process.env.DATABASE_URL) notFound()
  const db = getDb()
  const row = await findBookingByToken(db, token)
  if (!row) notFound()
  const pets = await db
    .select()
    .from(bookingPets)
    .where(eq(bookingPets.requestId, row.id))
  const messages = await db
    .select()
    .from(notes)
    .where(and(eq(notes.requestId, row.id), eq(notes.visibility, "client")))
  const data = publicBooking(row, pets, messages)
  const canPay = paymentEligible(data.status, data.finalCents, data.paidCents)
  return (
    <div className="form-shell" style={{ maxWidth: 820 }}>
      <div className="page-intro">
        <span className="eyebrow">YOUR PRIVATE CARE REQUEST</span>
        <h1>A good day, in the making.</h1>
        <p>{statusCopy[data.status]}</p>
      </div>
      <div className="panel">
        <span className="status-badge">{data.status.replaceAll("_", " ")}</span>
        {query.payment === "received" && (
          <div className="form-info">
            You’ve returned from checkout. Payment is confirmed only when it
            appears in the received amount below. Refresh in a moment if it’s
            still processing.
          </div>
        )}
        {query.payment === "cancelled" && (
          <div className="form-info">
            Checkout was closed. Your booking request is still saved.
          </div>
        )}
        {[
          ["Service", services.find((s) => s.slug === data.service)?.name],
          ["Dates", `${data.startDate} → ${data.endDate}`],
          ["Pets", data.pets.map((p) => p.name).join(", ")],
          [
            data.finalCents !== null ? "Agreed total" : "Starting estimate",
            data.finalCents !== null
              ? money(data.finalCents)
              : data.estimatedCents !== null
                ? money(data.estimatedCents)
                : "Personal quote to follow",
          ],
          ["Payment received", money(data.paidCents)],
          ...(data.finalCents !== null
            ? [
                [
                  "Remaining balance",
                  money(Math.max(0, data.finalCents - data.paidCents)),
                ],
              ]
            : []),
        ].map(([label, value]) => (
          <div className="review-row" key={label}>
            <span>{label}</span>
            <span>{value}</span>
          </div>
        ))}
        {canPay && (
          <div style={{ marginTop: 25 }}>
            {process.env.STRIPE_SECRET_KEY ? (
              <>
                <PaymentButton
                  token={token}
                  kind={data.paidCents > 0 ? "balance" : "full"}
                  label={
                    data.paidCents > 0
                      ? "Pay remaining balance"
                      : "Make a payment"
                  }
                />
                {!!data.depositCents && data.paidCents === 0 && (
                  <div style={{ marginTop: 13 }}>
                    <PaymentButton
                      token={token}
                      kind="deposit"
                      label={`Pay deposit · ${money(data.depositCents)}`}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="form-info">
                Your booking is eligible for payment. Drew will personally share
                payment instructions.
              </div>
            )}
          </div>
        )}
      </div>
      {data.messages.length > 0 && (
        <section className="panel" style={{ marginTop: 25 }}>
          <h3>Messages from Drew</h3>
          {data.messages.map((m, i) => (
            <div key={i} style={{ padding: "15px 0" }}>
              <p style={{ whiteSpace: "pre-wrap" }}>{m.body}</p>
              <small>
                {m.createdAt.toLocaleDateString("en-US", {
                  timeZone: "America/Chicago",
                })}
              </small>
            </div>
          ))}
        </section>
      )}
      <p className="quiet-note">
        Keep this link private. Anyone with the link can see this status
        summary.
        <br />
        Your address, medical details, and internal care notes never appear
        here.
      </p>
    </div>
  )
}
