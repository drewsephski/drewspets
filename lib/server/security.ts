import "server-only"
import { createHash, createHmac } from "node:crypto"
import { sql } from "drizzle-orm"
import { getDb } from "@/lib/db"
import { rateLimits } from "@/lib/db/schema"
import { site } from "@/lib/content"
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message)
  }
}
export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex")
}
export function bookingToken(id: string) {
  const secret = process.env.BOOKING_TOKEN_SECRET
  if (!secret || secret.length < 32)
    throw new HttpError(
      503,
      "Booking requests aren’t available just yet. Please try again soon."
    )
  return createHmac("sha256", secret)
    .update(`booking:${id}`)
    .digest("base64url")
}
export function requireSameOrigin(request: Request) {
  const allowed = new Set([
    new URL(site.url).origin,
    ...(process.env.BETTER_AUTH_URL
      ? [new URL(process.env.BETTER_AUTH_URL).origin]
      : []),
  ])
  if (process.env.NODE_ENV !== "production") {
    allowed.add("http://localhost:3000")
    allowed.add("http://127.0.0.1:3000")
  }
  const origin = request.headers.get("origin")
  if (!origin || !allowed.has(origin))
    throw new HttpError(
      403,
      "This request could not be verified. Refresh the page and try again."
    )
}
export async function publicGuard(request: Request, bucket: string) {
  requireSameOrigin(request)
  if (!process.env.DATABASE_URL)
    throw new HttpError(
      503,
      "Requests aren’t available just yet. Please try again soon."
    )
  if (Number(request.headers.get("content-length") || 0) > 60000)
    throw new HttpError(413, "This request is too large.")
  const ip = process.env.VERCEL
    ? request.headers.get("x-vercel-forwarded-for") || "unknown"
    : "local"
  const key = hashToken(`${bucket}:${ip}:${Math.floor(Date.now() / 600000)}`)
  const [row] = await getDb()
    .insert(rateLimits)
    .values({ key, expiresAt: new Date(Date.now() + 1200000) })
    .onConflictDoUpdate({
      target: rateLimits.key,
      set: { count: sql`${rateLimits.count}+1` },
    })
    .returning()
  if (row.count > 8)
    throw new HttpError(
      429,
      "A few too many requests. Please wait 10 minutes and try again."
    )
}
export async function readJson(request: Request) {
  const body = await request.text()
  if (body.length > 60000)
    throw new HttpError(413, "This request is too large.")
  try {
    return JSON.parse(body) as unknown
  } catch {
    throw new HttpError(400, "Please check your form and try again.")
  }
}
export function apiError(error: unknown) {
  if (error instanceof HttpError)
    return Response.json({ error: error.message }, { status: error.status })
  console.error(
    "Request failed",
    error instanceof Error ? error.name : "UnknownError"
  )
  return Response.json(
    {
      error:
        "Your request could not be saved. Please try again. Nothing has been confirmed.",
    },
    { status: 503 }
  )
}
