"use server"
import { revalidatePath } from "next/cache"
import { and, eq, sql, inArray } from "drizzle-orm"
import { z } from "zod"
import { getDb } from "@/lib/db"
import * as t from "@/lib/db/schema"
import { requireAdmin } from "./auth"
import { statuses, canTransition, date } from "@/lib/validation"
import { site } from "@/lib/content"
import { bookingToken } from "./security"
import { flushEmails } from "./email"
import { getStripe } from "./payments"
export type ActionState = { error?: string; success?: string }
export async function updateRequest(
  _state: ActionState,
  fd: FormData
): Promise<ActionState> {
  const admin = await requireAdmin()
  const parsed = z
    .object({
      id: z.uuid(),
      status: z.enum(statuses),
      finalDollars: z
        .string()
        .regex(/^\d{1,5}(\.\d{1,2})?$/, "Enter a valid price."),
      depositDollars: z
        .string()
        .regex(/^\d{1,5}(\.\d{1,2})?$/)
        .default("0"),
    })
    .safeParse(Object.fromEntries(fd))
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  try {
    const input = parsed.data
    await getDb().transaction(async (tx) => {
      const [r] = await tx
        .select()
        .from(t.bookingRequests)
        .where(eq(t.bookingRequests.id, input.id))
        .for("update")
      if (!r) throw new Error("Request not found.")
      if (r.status !== input.status && !canTransition(r.status, input.status))
        throw new Error(
          "This status change isn’t allowed. Refresh the request."
        )
      const finalCents = Math.round(Number(input.finalDollars) * 100)
      const depositCents = Math.round(Number(input.depositDollars) * 100)
      if (finalCents < r.paidCents || depositCents > finalCents)
        throw new Error(
          "The quote must cover payments received, and the deposit cannot exceed the total."
        )
      if (
        ["approved", "payment_pending"].includes(input.status) &&
        finalCents < 100
      )
        throw new Error(
          "Set an agreed total of at least $1 before approving payment."
        )
      const active = await tx
        .select()
        .from(t.payments)
        .where(
          and(
            eq(t.payments.requestId, r.id),
            inArray(t.payments.status, ["creating", "pending"])
          )
        )
      if (
        active.length &&
        (finalCents !== r.finalCents ||
          depositCents !== r.depositCents ||
          input.status !== r.status)
      )
        throw new Error(
          "Expire the open payment session before changing the quote or status."
        )
      await tx
        .update(t.bookingRequests)
        .set({
          status: input.status,
          finalCents,
          depositCents,
          updatedAt: new Date(),
        })
        .where(eq(t.bookingRequests.id, r.id))
      if (input.status === "confirmed")
        await tx
          .insert(t.bookings)
          .values({ requestId: r.id, assignedSitterId: admin.id })
          .onConflictDoNothing()
      if (r.status !== input.status) {
        await tx
          .insert(t.notes)
          .values({
            requestId: r.id,
            clientId: r.clientId,
            authorId: admin.id,
            body: `Status changed from ${r.status} to ${input.status}.`,
            visibility: "private",
          })
        const [client] = await tx
          .select()
          .from(t.clients)
          .where(eq(t.clients.id, r.clientId))
        if (
          ["approved", "payment_pending", "confirmed", "completed"].includes(
            input.status
          )
        )
          await tx
            .insert(t.emailOutbox)
            .values({
              dedupeKey: `status:${r.id}:${input.status}`,
              to: client.email,
              subject:
                input.status === "approved"
                  ? "Your pet care request is approved"
                  : "An update to your pet care booking",
              body: `Drew has updated your booking to ${input.status.replaceAll("_", " ")}. View the details at your private link: ${site.url}/booking/${bookingToken(r.id)}\n\n— Drew`,
            })
            .onConflictDoNothing()
      }
    })
    revalidatePath("/admin", "layout")
    await flushEmails().catch(() => {})
    return { success: "Request updated." }
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Could not update the request.",
    }
  }
}
export async function addNote(
  _state: ActionState,
  fd: FormData
): Promise<ActionState> {
  const admin = await requireAdmin()
  const input = z
    .object({
      id: z.uuid(),
      body: z.string().trim().min(1).max(5000),
      visibility: z.enum(["private", "client"]),
    })
    .safeParse(Object.fromEntries(fd))
  if (!input.success) return { error: "Enter a note of 1–5,000 characters." }
  const [r] = await getDb()
    .select()
    .from(t.bookingRequests)
    .where(eq(t.bookingRequests.id, input.data.id))
  if (!r) return { error: "Request not found." }
  await getDb()
    .insert(t.notes)
    .values({
      requestId: r.id,
      clientId: r.clientId,
      body: input.data.body,
      visibility: input.data.visibility,
      authorId: admin.id,
    })
  revalidatePath(`/admin/requests/${r.id}`)
  return {
    success:
      input.data.visibility === "private"
        ? "Private note saved."
        : "Message added to the client’s status page.",
  }
}
export async function saveAvailability(
  _state: ActionState,
  fd: FormData
): Promise<ActionState> {
  await requireAdmin()
  const parsed = z
    .object({
      startDate: date,
      endDate: date,
      state: z.enum(["partial", "unavailable"]),
      reason: z.string().trim().max(300),
    })
    .refine((v) => v.endDate >= v.startDate, {
      message: "End date must be on or after the start date.",
    })
    .safeParse(Object.fromEntries(fd))
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  await getDb().insert(t.availabilityBlocks).values(parsed.data)
  revalidatePath("/admin/availability")
  return { success: "Availability saved. Existing bookings are unchanged." }
}
export async function removeAvailability(fd: FormData) {
  await requireAdmin()
  const id = z.uuid().parse(fd.get("id"))
  await getDb()
    .delete(t.availabilityBlocks)
    .where(eq(t.availabilityBlocks.id, id))
  revalidatePath("/admin/availability")
}
export async function reviewApplication(fd: FormData) {
  await requireAdmin()
  const id = z.uuid().parse(fd.get("id"))
  const status = z
    .enum(["new", "reviewed", "contacted", "archived"])
    .parse(fd.get("status"))
  await getDb()
    .update(t.applications)
    .set({ status })
    .where(eq(t.applications.id, id))
  revalidatePath("/admin/applications")
}
export async function revokeLink(fd: FormData) {
  await requireAdmin()
  const id = z.uuid().parse(fd.get("id"))
  await getDb()
    .update(t.bookingRequests)
    .set({ tokenRevoked: true })
    .where(eq(t.bookingRequests.id, id))
  revalidatePath(`/admin/requests/${id}`)
}
export async function expireCheckout(
  _state: ActionState,
  fd: FormData
): Promise<ActionState> {
  await requireAdmin()
  const id = z.uuid().parse(fd.get("id"))
  try {
    await getDb().transaction(async (tx) => {
      await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${id}))`)
      const [r] = await tx
        .select()
        .from(t.bookingRequests)
        .where(eq(t.bookingRequests.id, id))
        .for("update")
      if (!r) throw new Error("Request not found.")
      const rows = await tx
        .select()
        .from(t.payments)
        .where(
          and(eq(t.payments.requestId, id), eq(t.payments.status, "pending"))
        )
      for (const p of rows) {
        if (p.sessionId) {
          const session = await getStripe().checkout.sessions.retrieve(
            p.sessionId
          )
          if (session.status === "complete")
            throw new Error(
              "Payment is processing or complete. Wait for the payment update before changing the booking."
            )
          if (session.status === "open")
            await getStripe().checkout.sessions.expire(p.sessionId)
        }
        await tx
          .update(t.payments)
          .set({ status: "expired" })
          .where(eq(t.payments.id, p.id))
      }
    })
    revalidatePath(`/admin/requests/${id}`)
    return { success: "Open checkout expired." }
  } catch {
    return {
      error:
        "Could not expire checkout. Check Stripe and retry before changing the booking.",
    }
  }
}
