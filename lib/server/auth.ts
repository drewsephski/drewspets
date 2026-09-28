import "server-only"
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { getDb } from "@/lib/db"
import * as schema from "@/lib/db/schema"
import { site } from "@/lib/content"
import { isAdmin } from "@/lib/validation"
let auth: ReturnType<typeof createAuth> | undefined
function createAuth() {
  if (
    !process.env.BETTER_AUTH_SECRET ||
    process.env.BETTER_AUTH_SECRET.length < 32
  )
    throw new Error("AUTH_NOT_CONFIGURED")
  return betterAuth({
    appName: "Drew’s Pet Care",
    baseURL: process.env.BETTER_AUTH_URL || site.url,
    secret: process.env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(getDb(), { provider: "pg", schema }),
    emailAndPassword: {
      enabled: true,
      disableSignUp: true,
      minPasswordLength: 12,
    },
    session: { expiresIn: 60 * 60 * 12, updateAge: 60 * 60 },
    rateLimit: { enabled: true, storage: "database" },
    trustedOrigins: [process.env.BETTER_AUTH_URL || site.url],
    advanced: { useSecureCookies: process.env.NODE_ENV === "production" },
  })
}
export function getAuth() {
  return (auth ??= createAuth())
}
export function authReady() {
  return (
    !!process.env.DATABASE_URL &&
    !!process.env.ADMIN_EMAIL &&
    !!process.env.BETTER_AUTH_SECRET
  )
}
export async function requireAdmin() {
  if (!authReady()) redirect("/admin/login")
  const s = await getAuth().api.getSession({ headers: await headers() })
  if (!s || !isAdmin(s.user.email, process.env.ADMIN_EMAIL))
    redirect("/admin/login")
  return s.user
}
