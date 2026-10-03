import {
  afterAll,
  afterEach,
  beforeEach,
  expect,
  mock,
  spyOn,
  test,
} from "bun:test"
import { PGlite } from "@electric-sql/pglite"
import { drizzle } from "drizzle-orm/pglite"
import { readFile } from "node:fs/promises"
import { createHmac } from "node:crypto"
import { site } from "../lib/content"
import { inquiries, paymentNotifications } from "../lib/db/schema"
const pg = new PGlite()
for (const file of [
  "0000_silent_robin_chapel.sql",
  "0001_blushing_sumo.sql",
  "0002_cynical_devos.sql",
  "0003_redundant_wonder_man.sql",
]) {
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
const { formatRequestSms, sendRequestSms } = await import("../lib/server/sms")
const { notifyPayment } = await import("../lib/server/payment-notifications")
const twilioSend = mock(
  async (_url: string | URL | Request, _options?: RequestInit) => {
    void _url
    void _options
    return Response.json({ sid: `SM${"1".repeat(32)}`, status: "queued" })
  }
)
const original = { ...process.env }
beforeEach(async () => {
  process.env.DATABASE_URL = "test-only-in-memory"
  for (const key of [
    "TWILIO_ACCOUNT_SID",
    "TWILIO_AUTH_TOKEN",
    "TWILIO_FROM_NUMBER",
    "ADMIN_SMS_TO",
  ])
    delete process.env[key]
  process.env.RESEND_API_KEY = "test"
  process.env.EMAIL_FROM = "Drew <care@example.com>"
  process.env.ADMIN_EMAIL = "drew@example.com"
  delete process.env.STRIPE_PAYMENT_WEBHOOK_SECRET
  delete process.env.STRIPE_PAYMENT_LINK_ID
  send.mockClear()
  twilioSend.mockClear()
  spyOn(globalThis, "fetch").mockImplementation(
    Object.assign(twilioSend, { preconnect: globalThis.fetch.preconnect })
  )
  await pg.exec("TRUNCATE inquiries, rate_limits, payment_notifications")
})
afterEach(() => mock.restore())
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
function request(body: unknown, origin = new URL(site.url).origin) {
  return new Request(`${origin}/api/bookings`, {
    method: "POST",
    headers: { origin, "content-type": "application/json" },
    body: JSON.stringify(body),
  })
}
test("database-free request sends details to Drew and confirmation to customer", async () => {
  delete process.env.DATABASE_URL
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
test("optional referral attribution reaches Drew's email", async () => {
  const response = await submitPublicForm(
    request({ ...input, referredBy: "Jamie" }),
    "booking"
  )
  expect(response.status).toBe(201)
  expect(send.mock.calls[0][0]).toHaveProperty(
    "text",
    expect.stringContaining("Referred by: Jamie")
  )
})
test("service-specific timing reaches Drew's email", async () => {
  const response = await submitPublicForm(
    request({
      ...input,
      preferredStartWindow: "Midday",
      visitFrequency: "Weekly",
    }),
    "booking"
  )
  expect(response.status).toBe(201)
  expect(send.mock.calls[0][0]).toHaveProperty(
    "text",
    expect.stringContaining("Preferred visit time: Midday")
  )
  expect(send.mock.calls[0][0]).toHaveProperty(
    "text",
    expect.stringContaining("How often: Weekly")
  )
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
        request({ ...message, requestId: crypto.randomUUID(), city: "Cary" }),
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
  const attributedInput = { ...input, referredBy: "Jamie" }
  expect(
    (await submitPublicForm(request(attributedInput), "booking")).status
  ).toBe(201)
  expect(
    (await submitPublicForm(request(attributedInput), "booking")).status
  ).toBe(201)
  const rows = await db.select().from(inquiries)
  expect(rows).toHaveLength(1)
  expect(rows[0].message).toContain("City / ZIP: Cary")
  expect(rows[0].message).toContain("Phone: 3125550123")
  expect(rows[0].message).toContain("Referred by: Jamie")
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

function configureSms() {
  process.env.TWILIO_ACCOUNT_SID = `AC${"2".repeat(32)}`
  process.env.TWILIO_AUTH_TOKEN = "3".repeat(32)
  process.env.TWILIO_FROM_NUMBER = "+12225550100"
  process.env.ADMIN_SMS_TO = "+12225550101"
}

test("request SMS goes only to the configured admin with a short summary", async () => {
  configureSms()
  const response = await submitPublicForm(request(input), "booking")
  expect(response.status).toBe(201)
  expect(twilioSend).toHaveBeenCalledTimes(1)
  const options = twilioSend.mock.calls[0][1]
  const body = options?.body
  if (!(body instanceof URLSearchParams)) throw new Error("Missing SMS body")
  expect(options?.method).toBe("POST")
  expect(body.get("From")).toBe(process.env.TWILIO_FROM_NUMBER!)
  expect(body.get("To")).toBe(process.env.ADMIN_SMS_TO!)
  expect(body.get("Body")).toContain("Name: Owner")
  expect(body.get("Body")).toContain("City / ZIP: Cary")
  expect(body.get("Body")).toContain("Phone: 3125550123")
  const [saved] = await db.select().from(inquiries)
  expect(saved.smsAttemptedAt).not.toBeNull()
  expect(saved.smsMessageSid).toBe(`SM${"1".repeat(32)}`)
  expect(saved.smsErrorCode).toBeNull()
})

test("concurrent submissions and later retries send just one SMS", async () => {
  configureSms()
  const responses = await Promise.all([
    submitPublicForm(request(input), "booking"),
    submitPublicForm(request(input), "booking"),
  ])
  expect(responses.map((response) => response.status)).toEqual([201, 201])
  expect((await submitPublicForm(request(input), "booking")).status).toBe(201)
  expect(twilioSend).toHaveBeenCalledTimes(1)
})

test("Twilio rejection is recorded without rejecting the form or leaking content", async () => {
  configureSms()
  const log = spyOn(console, "error").mockImplementation(() => {})
  twilioSend.mockResolvedValueOnce(
    Response.json(
      { code: 21610, message: "sensitive provider detail" },
      { status: 400 }
    )
  )
  expect((await submitPublicForm(request(input), "booking")).status).toBe(201)
  const [saved] = await db.select().from(inquiries)
  expect(saved.smsErrorCode).toBe("21610")
  expect(saved.smsMessageSid).toBeNull()
  expect(JSON.stringify(log.mock.calls)).not.toContain("sensitive")
  expect(JSON.stringify(log.mock.calls)).not.toContain(
    process.env.TWILIO_AUTH_TOKEN!
  )
})

test("ambiguous network failure is not retried and email still succeeds", async () => {
  configureSms()
  spyOn(console, "error").mockImplementation(() => {})
  twilioSend.mockRejectedValueOnce(
    new DOMException("Timed out", "TimeoutError")
  )
  expect((await submitPublicForm(request(input), "booking")).status).toBe(201)
  expect((await submitPublicForm(request(input), "booking")).status).toBe(201)
  expect(twilioSend).toHaveBeenCalledTimes(1)
  const [saved] = await db.select().from(inquiries)
  expect(saved.smsErrorCode).toBe("DELIVERY_UNKNOWN")
})

test("SMS is skipped for invalid submissions, failed email, or changed retries", async () => {
  configureSms()
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
  send.mockResolvedValueOnce({ error: { message: "provider failure" } })
  expect((await submitPublicForm(request(input), "booking")).status).toBe(503)
  expect(twilioSend).not.toHaveBeenCalled()
  expect((await submitPublicForm(request(input), "booking")).status).toBe(201)
  expect(
    (
      await submitPublicForm(
        request({ ...input, petNames: "Changed" }),
        "booking"
      )
    ).status
  ).toBe(409)
  expect(twilioSend).toHaveBeenCalledTimes(1)
})

test("incomplete SMS config or absent database preserves email-only behavior", async () => {
  configureSms()
  spyOn(console, "error").mockImplementation(() => {})
  delete process.env.TWILIO_AUTH_TOKEN
  expect((await submitPublicForm(request(input), "booking")).status).toBe(201)
  configureSms()
  delete process.env.DATABASE_URL
  expect((await submitPublicForm(request(input), "booking")).status).toBe(201)
  expect(twilioSend).not.toHaveBeenCalled()
})

test("contact and sitter forms each send an admin alert", async () => {
  configureSms()
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
        request({ ...message, requestId: crypto.randomUUID(), city: "Cary" }),
        "application"
      )
    ).status
  ).toBe(201)
  expect(twilioSend).toHaveBeenCalledTimes(2)
})

test("missing request records cannot send an SMS", async () => {
  configureSms()
  await sendRequestSms({
    requestId: input.requestId,
    subject: "Test",
    name: "Owner",
    summary: [],
  })
  expect(twilioSend).not.toHaveBeenCalled()
})

test("SMS summaries stay within two GSM segments and omit control characters", () => {
  const body = formatRequestSms({
    requestId: input.requestId,
    subject: "New pet care request",
    name: "Jos\u00e9 \ud83d\udc36\n" + "x".repeat(200),
    summary: Array.from({ length: 10 }, () => "x".repeat(100)),
  })
  expect(body.length).toBeLessThanOrEqual(306)
  expect(body).toContain("Jose")
  expect(body).not.toContain("\ud83d\udc36")
  expect(body.endsWith("Check your email for full details.")).toBe(true)
})

const paymentSecret = "whsec_local_fixture_only"
const paidSession = {
  id: "cs_live_fixture",
  object: "checkout.session",
  payment_link: "plink_fixture",
  payment_status: "paid",
  amount_total: 5500,
  currency: "usd",
  customer_details: {
    name: "Jos\u00e9 \ud83d\udc36\nOwner",
    email: "owner@example.com",
  },
}
function configurePayments() {
  configureSms()
  process.env.STRIPE_PAYMENT_WEBHOOK_SECRET = paymentSecret
  process.env.STRIPE_PAYMENT_LINK_ID = "plink_fixture"
}
function paymentRequest(
  session: unknown = paidSession,
  overrides: Record<string, unknown> = {},
  timestamp = Math.floor(Date.now() / 1000)
) {
  const body = JSON.stringify({
    id: "evt_fixture",
    type: "checkout.session.completed",
    livemode: true,
    data: { object: session },
    ...overrides,
  })
  const signature = createHmac("sha256", paymentSecret)
    .update(`${timestamp}.${body}`)
    .digest("hex")
  return new Request("https://drewspets.com/api/stripe/payment-notifications", {
    method: "POST",
    headers: { "stripe-signature": `t=${timestamp},v1=${signature}` },
    body,
  })
}

test("signed live paid checkout sends the amount to the configured admin once", async () => {
  configurePayments()
  expect((await notifyPayment(paymentRequest())).status).toBe(200)
  const options = twilioSend.mock.calls[0][1]!
  const body = options.body as URLSearchParams
  expect(body.get("To")).toBe(process.env.ADMIN_SMS_TO!)
  expect(body.get("Body")).toContain("Payment received: $55.00 USD")
  expect(body.get("Body")).toContain("From: Jose Owner")
  expect(body.get("Body")!.length).toBeLessThanOrEqual(306)
  const [saved] = await db.select().from(paymentNotifications)
  expect(saved.smsMessageSid).toBe(`SM${"1".repeat(32)}`)
  expect(saved.amountCents).toBe(5500)
  expect(saved.eventId).toBe("evt_fixture")
})

test("concurrent and distinct paid events for the same session do not duplicate SMS", async () => {
  configurePayments()
  const responses = await Promise.all([
    notifyPayment(paymentRequest()),
    notifyPayment(paymentRequest()),
  ])
  expect(responses.some((response) => response.status === 200)).toBe(true)
  expect(
    (
      await notifyPayment(
        paymentRequest(paidSession, {
          id: "evt_second",
          type: "checkout.session.async_payment_succeeded",
        })
      )
    ).status
  ).toBe(200)
  expect(twilioSend).toHaveBeenCalledTimes(1)
  expect(await db.select().from(paymentNotifications)).toHaveLength(1)
})

test("unpaid, test-mode, unrelated-link and unrelated-event payloads cannot send payment SMS", async () => {
  configurePayments()
  for (const request of [
    paymentRequest({ ...paidSession, payment_status: "unpaid" }),
    paymentRequest(paidSession, { livemode: false }),
    paymentRequest({ ...paidSession, payment_link: "plink_other" }),
    paymentRequest({ ...paidSession, payment_link: null }),
    paymentRequest(null, { type: "charge.succeeded" }),
  ]) {
    expect((await notifyPayment(request)).status).toBe(200)
  }
  expect(twilioSend).not.toHaveBeenCalled()
  expect(await db.select().from(paymentNotifications)).toHaveLength(0)
})

test("forged, missing, stale, future and v0-only signatures cannot send SMS", async () => {
  configurePayments()
  for (const timestamp of [0, Math.floor(Date.now() / 1000) + 400]) {
    expect(
      (await notifyPayment(paymentRequest(paidSession, {}, timestamp))).status
    ).toBe(400)
  }
  for (const change of ["missing", "v0", "forged", "body"]) {
    const signed = paymentRequest()
    const headers = new Headers(signed.headers)
    let body = await signed.text()
    if (change === "missing") headers.delete("stripe-signature")
    if (change === "v0")
      headers.set(
        "stripe-signature",
        headers.get("stripe-signature")!.replace("v1=", "v0=")
      )
    if (change === "forged")
      headers.set(
        "stripe-signature",
        `t=${Math.floor(Date.now() / 1000)},v1=${"0".repeat(64)}`
      )
    if (change === "body") body = body.replace("5500", "9900")
    expect(
      (
        await notifyPayment(
          new Request(signed.url, { method: "POST", headers, body })
        )
      ).status
    ).toBe(400)
  }
  expect(twilioSend).not.toHaveBeenCalled()
})

test("rotated signatures are accepted when one v1 signature matches", async () => {
  configurePayments()
  const request = paymentRequest()
  request.headers.append("stripe-signature", `v1=${"0".repeat(64)}`)
  expect((await notifyPayment(request)).status).toBe(200)
  expect(twilioSend).toHaveBeenCalledTimes(1)
})

test("invalid paid session fields and oversized signed payloads cannot send SMS", async () => {
  configurePayments()
  for (const session of [
    { ...paidSession, amount_total: -1 },
    { ...paidSession, amount_total: 0 },
    { ...paidSession, amount_total: 55.5 },
    { ...paidSession, currency: "eur" },
    { ...paidSession, id: "cs_test_fixture" },
    { ...paidSession, customer_details: "malformed" },
  ])
    expect((await notifyPayment(paymentRequest(session))).status).toBe(400)
  expect(
    (
      await notifyPayment(
        paymentRequest(paidSession, { padding: "x".repeat(65536) })
      )
    ).status
  ).toBe(413)
  expect(twilioSend).not.toHaveBeenCalled()
})

test("an explicit SMS rejection is recorded and can safely retry", async () => {
  configurePayments()
  spyOn(console, "error").mockImplementation(() => {})
  twilioSend.mockResolvedValueOnce(
    Response.json({ code: 20429 }, { status: 429 })
  )
  expect((await notifyPayment(paymentRequest())).status).toBe(503)
  const [saved] = await db.select().from(paymentNotifications)
  expect(saved.smsErrorCode).toBe("20429")
  expect(saved.smsAttemptedAt).toBeNull()
  expect((await notifyPayment(paymentRequest())).status).toBe(200)
  expect(twilioSend).toHaveBeenCalledTimes(2)
})

test("ambiguous payment SMS timeouts stay claimed and visible without duplicate sends", async () => {
  configurePayments()
  const log = spyOn(console, "error").mockImplementation(() => {})
  twilioSend.mockRejectedValueOnce(new Error("sensitive provider information"))
  expect((await notifyPayment(paymentRequest())).status).toBe(503)
  expect((await notifyPayment(paymentRequest())).status).toBe(503)
  expect(twilioSend).toHaveBeenCalledTimes(1)
  const [saved] = await db.select().from(paymentNotifications)
  expect(saved.smsErrorCode).toBe("DELIVERY_UNKNOWN")
  expect(saved.smsAttemptedAt).not.toBeNull()
  expect(JSON.stringify(log.mock.calls)).not.toContain("sensitive")
  expect(JSON.stringify(log.mock.calls)).not.toContain(
    process.env.TWILIO_AUTH_TOKEN!
  )
})

test("missing payment or SMS configuration fails before claiming or sending", async () => {
  configurePayments()
  spyOn(console, "error").mockImplementation(() => {})
  delete process.env.TWILIO_AUTH_TOKEN
  expect((await notifyPayment(paymentRequest())).status).toBe(503)
  expect(await db.select().from(paymentNotifications)).toHaveLength(0)
  delete process.env.STRIPE_PAYMENT_WEBHOOK_SECRET
  expect((await notifyPayment(paymentRequest())).status).toBe(503)
  expect(twilioSend).not.toHaveBeenCalled()
})
