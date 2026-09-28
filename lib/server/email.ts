import "server-only"
import { Resend } from "resend"
import { and, eq, lt, sql } from "drizzle-orm"
import { getDb } from "@/lib/db"
import { emailOutbox, rateLimits } from "@/lib/db/schema"
export async function flushEmails() {
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM)
    return { sent: 0, configured: false }
  const resend = new Resend(process.env.RESEND_API_KEY)
  const pending = await getDb()
    .select()
    .from(emailOutbox)
    .where(and(eq(emailOutbox.status, "pending"), lt(emailOutbox.attempts, 10)))
    .limit(20)
  let sent = 0
  for (const message of pending) {
    try {
      const result = await resend.emails.send(
        {
          from: process.env.EMAIL_FROM,
          to: message.to,
          subject: message.subject,
          text: message.body,
        },
        { idempotencyKey: message.id }
      )
      if (result.error) throw new Error("EMAIL_DELIVERY_FAILED")
      await getDb()
        .update(emailOutbox)
        .set({ status: "sent", sentAt: new Date() })
        .where(eq(emailOutbox.id, message.id))
      sent++
    } catch {
      await getDb()
        .update(emailOutbox)
        .set({ attempts: sql`${emailOutbox.attempts}+1` })
        .where(eq(emailOutbox.id, message.id))
    }
  }
  await getDb().delete(rateLimits).where(lt(rateLimits.expiresAt, new Date()))
  return { sent, configured: true }
}
