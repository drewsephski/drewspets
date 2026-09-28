import { afterAll, beforeEach, expect, mock, test } from "bun:test"
import { PGlite } from "@electric-sql/pglite"
import { drizzle } from "drizzle-orm/pglite"
import { readFile } from "node:fs/promises"
import { inquiries } from "../lib/db/schema"
const pg = new PGlite()
for (const file of ["0000_silent_robin_chapel.sql", "0001_blushing_sumo.sql"]) {
  await pg.exec(
    await readFile(new URL(`../drizzle/${file}`, import.meta.url), "utf8")
  )
}
const db = drizzle(pg)
mock.module("@/lib/db", () => ({ getDb: () => db }))
mock.module("server-only", () => ({}))
const send = mock(
  async (
    _mail: unknown,
    _options: unknown
  ): Promise<{ error: null | { message: string } }> => {
    void _mail
    void _options
    return { error: null }
  }
)
mock.module("resend", () => ({
  Resend: class {
    emails = { send }
  },
}))
const { submitPublicForm } = await import("../lib/server/public-forms")
const original = { ...process.env }
beforeEach(() => {
  delete process.env.DATABASE_URL
  process.env.RESEND_API_KEY = "test"
  process.env.EMAIL_FROM = "Drew <care@example.com>"
  process.env.ADMIN_EMAIL = "drew@example.com"
  send.mockClear()
})
afterAll(async () => {
  process.env = original
  await pg.close()
})
const input = {
  requestId: "c6a38f44-af3f-4517-8666-fd5edc674be1",
  name: "Owner",
  email: "owner@example.com",
  service: "drop-ins",
  startDate: "2099-06-01",
  endDate: "2099-06-01",
  petCount: 1,
  petType: "Cats",
  petNames: "Pepper",
  cityZip: "Cary",
  phone: "3125550123",
}
function request(
  body: unknown,
  origin = new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://drewspets.com")
    .origin
) {
  return new Request(`${origin}/api/bookings`, {
    method: "POST",
    headers: { origin, "content-type": "application/json" },
    body: JSON.stringify(body),
  })
}
test("database-free request sends details to Drew and confirmation to customer", async () => {
  const response = await submitPublicForm(request(input), "booking")
  expect(response.status).toBe(201)
  expect(send).toHaveBeenCalledTimes(2)
  expect(send.mock.calls[0][0]).toMatchObject({
    to: "drew@example.com",
    replyTo: "owner@example.com",
  })
  expect(send.mock.calls[0][0]).toHaveProperty(
    "text",
    expect.stringContaining("Pepper")
  )
  expect(send.mock.calls[1][0]).toMatchObject({
    to: "owner@example.com",
    replyTo: "drew@example.com",
  })
})
test("retry reuses provider idempotency keys", async () => {
  await submitPublicForm(request(input), "booking")
  await submitPublicForm(request(input), "booking")
  expect(send.mock.calls[0][1]).toEqual(send.mock.calls[2][1])
  expect(send.mock.calls[1][1]).toEqual(send.mock.calls[3][1])
})
test("delivery failures are visible, including customer confirmation failure", async () => {
  send
    .mockResolvedValueOnce({ error: null })
    .mockResolvedValueOnce({ error: { message: "provider failure" } })
  const response = await submitPublicForm(request(input), "booking")
  expect(response.status).toBe(503)
  expect(await response.json()).toHaveProperty(
    "error",
    expect.stringContaining("retry")
  )
})
test("unconfigured email does not report success", async () => {
  delete process.env.RESEND_API_KEY
  expect((await submitPublicForm(request(input), "booking")).status).toBe(503)
  expect(send).not.toHaveBeenCalled()
})
test("invalid and cross-origin submissions never send email", async () => {
  expect(
    (await submitPublicForm(request({ ...input, petCount: 0 }), "booking"))
      .status
  ).toBe(400)
  expect(
    (
      await submitPublicForm(
        request(input, "https://untrusted.example"),
        "booking"
      )
    ).status
  ).toBe(403)
  expect(send).not.toHaveBeenCalled()
})
test("contact and future sitter interest notify Drew without dashboard links", async () => {
  const message = {
    requestId: input.requestId,
    name: input.name,
    email: input.email,
    message: "Hello Drew",
  }
  expect((await submitPublicForm(request(message), "inquiry")).status).toBe(201)
  expect(
    (
      await submitPublicForm(
        request({ ...message, city: "Cary" }),
        "application"
      )
    ).status
  ).toBe(201)
  expect(send.mock.calls[0][0]).toHaveProperty(
    "text",
    expect.stringContaining("Hello Drew")
  )
})

test("configured storage saves one readable record and deduplicates retries", async () => {
  process.env.DATABASE_URL = "test-only-in-memory"
  expect((await submitPublicForm(request(input), "booking")).status).toBe(201)
  expect((await submitPublicForm(request(input), "booking")).status).toBe(201)
  const rows = await db.select().from(inquiries)
  expect(rows).toHaveLength(1)
  expect(rows[0].message).toContain("City / ZIP: Cary")
  expect(rows[0].message).toContain("Phone: 3125550123")
  expect(
    (
      await submitPublicForm(
        request({ ...input, petNames: "Changed" }),
        "booking"
      )
    ).status
  ).toBe(409)
  expect(send).toHaveBeenCalledTimes(4)
})
test("bounded request bodies reject oversized submissions before email", async () => {
  expect(
    (
      await submitPublicForm(
        request({ ...input, message: "x".repeat(17000) }),
        "application"
      )
    ).status
  ).toBe(413)
  expect(send).not.toHaveBeenCalled()
})
test("persistent rate limit blocks repeated submissions", async () => {
  process.env.DATABASE_URL = "test-only-in-memory"
  let response: Response | undefined
  for (let i = 0; i < 9; i++)
    response = await submitPublicForm(
      request({ ...input, petCount: 0 }),
      "inquiry"
    )
  expect(response?.status).toBe(429)
  expect(send).not.toHaveBeenCalled()
})
