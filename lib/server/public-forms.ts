import { createHash } from "node:crypto"
import { eq } from "drizzle-orm"
import { getDb } from "@/lib/db"
import { inquiries } from "@/lib/db/schema"
import {
  applicationSchema,
  inquirySchema,
  bookingSchema,
} from "@/lib/validation"
import { services } from "@/lib/content"
import { publicGuard, readJson, apiError, HttpError } from "./security"
import { emailConfig, sendRequestEmails } from "./email"
export async function submitPublicForm(
  request: Request,
  kind: "booking" | "application" | "inquiry"
) {
  try {
    await publicGuard(request, kind)
    const raw = await readJson(request)
    const parsed =
      kind === "booking"
        ? bookingSchema
            .transform((data) => ({ ...data, kind: "booking" as const }))
            .safeParse(raw)
        : kind === "application"
          ? applicationSchema
              .transform((data) => ({ ...data, kind: "application" as const }))
              .safeParse(raw)
          : inquirySchema
              .transform((data) => ({ ...data, kind: "inquiry" as const }))
              .safeParse(raw)
    if (!parsed.success)
      return Response.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    emailConfig()
    const input = parsed.data
    const subject =
      kind === "booking"
        ? "New pet care request"
        : kind === "application"
          ? "Future sitter interest"
          : "New message for Drew"
    const details =
      input.kind === "booking"
        ? [
            `Service: ${services.find((s) => s.slug === input.service)!.name}`,
            `Dates: ${input.startDate} to ${input.endDate}`,
            `Pets: ${input.petCount} (${input.petType}) — ${input.petNames}`,
            `About the pets: ${input.petDetails || "Not provided"}`,
            `City / ZIP: ${input.cityZip}`,
            `Phone: ${input.phone}`,
            `Referred by: ${input.referredBy || "Not provided"}`,
          ]
        : input.kind === "application"
          ? [`City: ${input.city}`]
          : []
    const body = [
      subject,
      `Name: ${input.name}`,
      `Email: ${input.email}`,
      ...details,
      `Message: ${input.message || "None"}`,
    ].join("\n")
    // One existing table, one record per request. Never create client/pet/account records.
    if (process.env.DATABASE_URL) {
      await getDb()
        .insert(inquiries)
        .values({
          id: input.requestId,
          name: input.name,
          email: input.email,
          message: body,
        })
        .onConflictDoNothing()
      const [saved] = await getDb()
        .select({ message: inquiries.message })
        .from(inquiries)
        .where(eq(inquiries.id, input.requestId))
      if (saved?.message !== body)
        throw new HttpError(
          409,
          "This request was already saved with different details. Refresh to start a new request, or contact Drew to update it."
        )
    }
    const confirmation =
      kind === "booking"
        ? "Thanks — I’ll personally review your request and get back to you shortly.\n\nYour dates aren’t confirmed yet. We’ll discuss the details and price together. No payment is needed now.\n\nDrew"
        : kind === "application"
          ? "Thanks for introducing yourself. I’ll keep your information for possible future opportunities and reach out if there’s a fit.\n\nDrew"
          : "Thanks for your message. I’ll get back to you personally shortly.\n\nDrew"
    await sendRequestEmails({
      id: createHash("sha256")
        .update(`${input.requestId}:${body}`)
        .digest("hex"),
      email: input.email,
      subject,
      body,
      confirmation,
    })
    return Response.json({ received: true }, { status: 201 })
  } catch (error) {
    return apiError(error)
  }
}
