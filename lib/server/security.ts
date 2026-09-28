import "server-only"
import { createHash } from "node:crypto"
import { lt, sql } from "drizzle-orm"
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
const localLimits = new Map<string, { count: number; expires: number }>()
export async function publicGuard(request: Request, bucket: string) {
  const allowed = new Set([new URL(site.url).origin])
  if (process.env.NODE_ENV !== "production") {
    allowed.add("http://localhost:3000")
    allowed.add("http://127.0.0.1:3000")
  }
  if (!allowed.has(request.headers.get("origin") || ""))
    throw new HttpError(403, "Refresh the page and try again.")
  if (!request.headers.get("content-type")?.includes("application/json"))
    throw new HttpError(415, "Please submit using the website form.")
  const now = Date.now()
  const ip = process.env.VERCEL
    ? request.headers.get("x-vercel-forwarded-for") || "unknown"
    : "local"
  const key = createHash("sha256")
    .update(`${bucket}:${ip}:${Math.floor(now / 600000)}`)
    .digest("hex")
  let count: number
  if (process.env.DATABASE_URL) {
    await getDb()
      .delete(rateLimits)
      .where(lt(rateLimits.expiresAt, new Date(now)))
    const [row] = await getDb()
      .insert(rateLimits)
      .values({ key, expiresAt: new Date(now + 1200000) })
      .onConflictDoUpdate({
        target: rateLimits.key,
        set: { count: sql`${rateLimits.count}+1` },
      })
      .returning()
    count = row.count
  } else {
    // Best effort per-instance protection when running without optional storage.
    for (const [entry, value] of localLimits)
      if (value.expires < now) localLimits.delete(entry)
    count = (localLimits.get(key)?.count || 0) + 1
    if (localLimits.size >= 10000 && !localLimits.has(key))
      throw new HttpError(429, "Please try again later.")
    localLimits.set(key, { count, expires: now + 1200000 })
  }
  if (count > 8)
    throw new HttpError(
      429,
      "Please wait 10 minutes before trying again, or contact Drew directly."
    )
}
export async function readJson(request: Request) {
  if (Number(request.headers.get("content-length") || 0) > 16000)
    throw new HttpError(413, "This request is too large.")
  const reader = request.body?.getReader()
  if (!reader) throw new HttpError(400, "Please complete the form.")
  const chunks: Uint8Array[] = []
  let size = 0
  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    size += value.byteLength
    if (size > 16000) {
      await reader.cancel()
      throw new HttpError(413, "This request is too large.")
    }
    chunks.push(value)
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown
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
        "Your request couldn’t be completed. Please retry or contact Drew directly. Nothing has been confirmed.",
    },
    { status: 503 }
  )
}
