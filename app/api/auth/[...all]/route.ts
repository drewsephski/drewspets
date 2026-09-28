import { toNextJsHandler } from "better-auth/next-js"
import { getAuth, authReady } from "@/lib/server/auth"
function handler(method: "GET" | "POST") {
  return async (request: Request) => {
    if (!authReady())
      return Response.json(
        { message: "Admin sign-in is not configured yet." },
        { status: 503 }
      )
    return toNextJsHandler(getAuth())[method](request)
  }
}
export const GET = handler("GET")
export const POST = handler("POST")
