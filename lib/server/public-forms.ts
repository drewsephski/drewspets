import { after } from "next/server"
import { getDb } from "@/lib/db"
import { applications, inquiries, emailOutbox } from "@/lib/db/schema"
import { applicationSchema, inquirySchema } from "@/lib/validation"
import { publicGuard, readJson, apiError } from "./security"
import { flushEmails } from "./email"
import { site } from "@/lib/content"
export async function submitPublicForm(
  request: Request,
  kind: "application" | "inquiry"
) {
  try {
    await publicGuard(request, kind)
    const raw = await readJson(request)
    const id = await getDb().transaction(async (tx) => {
      if (kind === "application") {
        const input = applicationSchema.safeParse(raw)
        if (!input.success) return null
        const { consent, website, ...values } = input.data
        void consent
        void website
        const [row] = await tx
          .insert(applications)
          .values(values)
          .returning({ id: applications.id })
        if (process.env.ADMIN_EMAIL)
          await tx
            .insert(emailOutbox)
            .values({
              dedupeKey: `application:${row.id}`,
              to: process.env.ADMIN_EMAIL,
              subject: "New sitter application",
              body: `An application is ready to review: ${site.url}/admin/applications`,
            })
        return row.id
      }
      const input = inquirySchema.safeParse(raw)
      if (!input.success) return null
      const [row] = await tx
        .insert(inquiries)
        .values({
          name: input.data.name,
          email: input.data.email,
          message: input.data.message,
        })
        .returning({ id: inquiries.id })
      if (process.env.ADMIN_EMAIL)
        await tx
          .insert(emailOutbox)
          .values({
            dedupeKey: `inquiry:${row.id}`,
            to: process.env.ADMIN_EMAIL,
            subject: "New general inquiry",
            body: `A message is ready to review: ${site.url}/admin/inquiries`,
          })
      return row.id
    })
    if (!id)
      return Response.json(
        {
          error: "Please check your details and complete all required fields.",
        },
        { status: 400 }
      )
    after(async () => {
      await flushEmails().catch(() => {})
    })
    return Response.json({ received: true }, { status: 201 })
  } catch (e) {
    return apiError(e)
  }
}
