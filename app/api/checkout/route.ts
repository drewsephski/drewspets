import { z } from "zod"
import { publicGuard, readJson, apiError } from "@/lib/server/security"
import { startCheckout } from "@/lib/server/payments"
export async function POST(request: Request) {
  try {
    await publicGuard(request, "checkout")
    const parsed = z
      .object({
        token: z.string().regex(/^[\w-]{43}$/),
        kind: z.enum(["deposit", "full", "balance"]),
      })
      .safeParse(await readJson(request))
    if (!parsed.success)
      return Response.json(
        { error: "Invalid payment request." },
        { status: 400 }
      )
    return Response.json({
      url: await startCheckout(parsed.data.token, parsed.data.kind),
    })
  } catch (e) {
    return apiError(e)
  }
}
