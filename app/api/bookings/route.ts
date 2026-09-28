import { after } from "next/server"
import { getDb } from "@/lib/db"
import { bookingSchema } from "@/lib/validation"
import { createBooking } from "@/lib/server/bookings"
import {
  publicGuard,
  readJson,
  apiError,
  HttpError,
} from "@/lib/server/security"
import { flushEmails } from "@/lib/server/email"
export async function POST(request: Request) {
  try {
    await publicGuard(request, "booking")
    if (
      !process.env.BOOKING_TOKEN_SECRET ||
      process.env.BOOKING_TOKEN_SECRET.length < 32
    )
      throw new HttpError(
        503,
        "Booking requests aren’t available just yet. Please try again soon."
      )
    const parsed = bookingSchema.safeParse(await readJson(request))
    if (!parsed.success)
      return Response.json(
        {
          error: parsed.error.issues[0].message,
          fields: parsed.error.flatten(),
        },
        { status: 400 }
      )
    const result = await createBooking(
      getDb(),
      parsed.data,
      process.env.BOOKING_TOKEN_SECRET
    )
    after(async () => {
      await flushEmails().catch(() => {})
    })
    return Response.json(
      { url: `/booking/${result.token}` },
      { status: result.duplicate ? 200 : 201 }
    )
  } catch (error) {
    if (error instanceof Error && error.message === "REQUEST_CONFLICT")
      return Response.json(
        {
          error:
            "This request was already submitted with different details. Open a new booking request.",
        },
        { status: 409 }
      )
    return apiError(error)
  }
}
