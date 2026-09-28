import { timingSafeEqual } from "node:crypto"
import { flushEmails } from "@/lib/server/email"
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  const provided = request.headers.get("authorization") || ""
  const expected = `Bearer ${secret}`
  if (
    !secret ||
    provided.length !== expected.length ||
    !timingSafeEqual(Buffer.from(provided), Buffer.from(expected))
  )
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  return Response.json(await flushEmails())
}
