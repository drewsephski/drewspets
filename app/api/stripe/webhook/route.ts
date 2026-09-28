import { after } from "next/server"
import { getStripe, handleStripeEvent } from "@/lib/server/payments"
import { flushEmails } from "@/lib/server/email"
export async function POST(request: Request) {
  if (!process.env.STRIPE_WEBHOOK_SECRET)
    return Response.json({ error: "Webhook not configured" }, { status: 503 })
  const signature = request.headers.get("stripe-signature")
  if (!signature)
    return Response.json({ error: "Missing signature" }, { status: 400 })
  let event
  try {
    event = getStripe().webhooks.constructEvent(
      await request.text(),
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch {
    return Response.json({ error: "Invalid signature" }, { status: 400 })
  }
  try {
    await handleStripeEvent(event)
    after(async () => {
      await flushEmails().catch(() => {})
    })
    return Response.json({ received: true })
  } catch {
    console.error("Stripe webhook processing failed", event.id)
    return Response.json(
      { error: "Processing failed; retry required" },
      { status: 500 }
    )
  }
}
