import { hashPassword } from "better-auth/crypto"
import { eq } from "drizzle-orm"
import { getDb } from "../lib/db"
import { user, account } from "../lib/db/schema"
const email = process.env.ADMIN_EMAIL?.toLowerCase()
const password = process.env.ADMIN_BOOTSTRAP_PASSWORD
if (!email || !password || password.length < 12)
  throw new Error(
    "Set ADMIN_EMAIL and an ADMIN_BOOTSTRAP_PASSWORD of at least 12 characters. Never commit them."
  )
const db = getDb()
const [existing] = await db.select().from(user).where(eq(user.email, email))
if (existing)
  throw new Error(
    "An account already exists. This script will not overwrite it."
  )
const id = crypto.randomUUID()
const passwordHash = await hashPassword(password)
await db.transaction(async (tx) => {
  await tx.insert(user).values({ id, name: "Drew", email, emailVerified: true })
  await tx
    .insert(account)
    .values({
      id: crypto.randomUUID(),
      accountId: id,
      userId: id,
      providerId: "credential",
      password: passwordHash,
    })
})
console.log(
  "Admin account created. Remove ADMIN_BOOTSTRAP_PASSWORD from your environment."
)
process.exit(0)
