import { notifyPayment } from "@/lib/server/payment-notifications"

export const runtime = "nodejs"

export async function POST(request: Request) {
  return notifyPayment(request)
}
