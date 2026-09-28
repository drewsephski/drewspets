import postgres from "postgres"
import { drizzle } from "drizzle-orm/postgres-js"
import * as schema from "./schema"
let db: ReturnType<typeof createDatabase> | undefined
function createDatabase() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_NOT_CONFIGURED")
  return drizzle(
    postgres(process.env.DATABASE_URL, {
      prepare: false,
      max: 3,
      idle_timeout: 20,
      connect_timeout: 10,
    }),
    { schema }
  )
}
export function getDb() {
  return (db ??= createDatabase())
}
export type Database = ReturnType<typeof getDb>
