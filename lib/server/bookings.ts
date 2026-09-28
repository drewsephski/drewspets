import { createHash, createHmac } from "node:crypto"
import { and, eq, gt, sql } from "drizzle-orm"
import type { Database } from "@/lib/db"
import * as tables from "@/lib/db/schema"
import {
  bookingSchema,
  estimateBooking,
  inServiceArea,
  type BookingInput,
} from "@/lib/validation"
import { site, services } from "@/lib/content"
export function secureToken(id: string, secret: string) {
  if (secret.length < 32)
    throw new Error("BOOKING_TOKEN_SECRET must contain at least 32 characters")
  return createHmac("sha256", secret)
    .update(`booking:${id}`)
    .digest("base64url")
}
const hash = (value: string) => createHash("sha256").update(value).digest("hex")
export async function createBooking(
  db: Database,
  raw: BookingInput,
  secret: string
) {
  const input = bookingSchema.parse(raw)
  const token = secureToken(input.requestId, secret)
  const payloadHash = hash(JSON.stringify(input))
  return db.transaction(async (tx) => {
    await tx.execute(
      sql`select pg_advisory_xact_lock(hashtext(${input.requestId}))`
    )
    const [existing] = await tx
      .select()
      .from(tables.bookingRequests)
      .where(eq(tables.bookingRequests.id, input.requestId))
    if (existing) {
      if (existing.payloadHash !== payloadHash)
        throw new Error("REQUEST_CONFLICT")
      return { id: existing.id, token, duplicate: true }
    }
    await tx
      .insert(tables.serviceTypes)
      .values(
        services.map((s) => ({
          slug: s.slug,
          name: s.name,
          basePrice: s.price,
          unit: s.unit,
        }))
      )
      .onConflictDoNothing()
    const [client] = await tx
      .insert(tables.clients)
      .values(input.contact)
      .returning()
    const estimate = estimateBooking(input)
    const expires = new Date(`${input.endDate}T23:59:59Z`)
    expires.setUTCDate(expires.getUTCDate() + 180)
    await tx
      .insert(tables.bookingRequests)
      .values({
        id: input.requestId,
        clientId: client.id,
        service: input.service,
        startDate: input.startDate,
        endDate: input.endDate,
        duration: Number(input.duration),
        visitsPerDay: input.visitsPerDay,
        preferredTime: input.preferredTime,
        location: input.location,
        care: input.care,
        outsideArea: !inServiceArea(input.location.city, input.location.zip),
        estimatedCents: estimate?.cents ?? null,
        tokenHash: hash(token),
        tokenExpiresAt: expires,
        payloadHash,
      })
    for (const pet of input.pets) {
      const [saved] = await tx
        .insert(tables.pets)
        .values({
          clientId: client.id,
          name: pet.name,
          species: pet.species,
          details: pet,
        })
        .returning()
      await tx
        .insert(tables.bookingPets)
        .values({ requestId: input.requestId, petId: saved.id, snapshot: pet })
    }
    const link = `${site.url}/booking/${token}`
    await tx
      .insert(tables.emailOutbox)
      .values({
        dedupeKey: `new-client:${input.requestId}`,
        to: client.email,
        subject: "Your pet care request is received",
        body: `Thanks for reaching out to Drew’s Pet Care. I’ll personally review your dates and get back to you. This request is not a confirmed booking.\n\nKeep this link private to follow your request: ${link}\n\n— Drew`,
      })
    if (process.env.ADMIN_EMAIL)
      await tx
        .insert(tables.emailOutbox)
        .values({
          dedupeKey: `new-admin:${input.requestId}`,
          to: process.env.ADMIN_EMAIL,
          subject: "New pet care request",
          body: `A new request is ready for your review. Sign in: ${site.url}/admin/requests/${input.requestId}`,
        })
    return { id: input.requestId, token, duplicate: false }
  })
}
export async function findBookingByToken(db: Database, token: string) {
  if (!/^[\w-]{43}$/.test(token)) return null
  const [request] = await db
    .select()
    .from(tables.bookingRequests)
    .where(
      and(
        eq(tables.bookingRequests.tokenHash, hash(token)),
        eq(tables.bookingRequests.tokenRevoked, false),
        gt(tables.bookingRequests.tokenExpiresAt, new Date())
      )
    )
  return request ?? null
}
export function publicBooking(
  request: typeof tables.bookingRequests.$inferSelect,
  petRows: { snapshot: BookingInput["pets"][number] }[],
  clientNotes: { body: string; visibility: string; createdAt: Date }[]
) {
  return {
    status: request.status,
    service: request.service,
    startDate: request.startDate,
    endDate: request.endDate,
    estimatedCents: request.estimatedCents,
    finalCents: request.finalCents,
    paidCents: request.paidCents,
    depositCents: request.depositCents,
    pets: petRows.map((p) => ({
      name: p.snapshot.name,
      species: p.snapshot.species,
    })),
    messages: clientNotes
      .filter((n) => n.visibility === "client")
      .map((n) => ({ body: n.body, createdAt: n.createdAt })),
  }
}
