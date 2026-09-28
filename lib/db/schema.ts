import {
  pgTable,
  text,
  timestamp,
  integer,
  bigint,
  boolean,
  jsonb,
  uuid,
  index,
  pgEnum,
  uniqueIndex,
} from "drizzle-orm/pg-core"
import type { BookingInput } from "../validation"
import { statuses } from "../validation"
const created = () =>
  timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
export const bookingStatus = pgEnum("booking_status", statuses)
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: created(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})
export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: created(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (t) => [index("session_user_idx").on(t.userId)]
)
export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      withTimezone: true,
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      withTimezone: true,
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: created(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("account_user_idx").on(t.userId)]
)
export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: created(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
})
export const clients = pgTable(
  "clients",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    preferredContact: text("preferred_contact").notNull(),
    createdAt: created(),
  },
  (t) => [index("clients_email_idx").on(t.email)]
)
export const pets = pgTable(
  "pets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id),
    name: text("name").notNull(),
    species: text("species").notNull(),
    details: jsonb("details").$type<BookingInput["pets"][number]>().notNull(),
    createdAt: created(),
  },
  (t) => [index("pets_client_idx").on(t.clientId)]
)
export const serviceTypes = pgTable("service_types", {
  slug: text("slug").primaryKey(),
  name: text("name").notNull(),
  basePrice: integer("base_price"),
  unit: text("unit").notNull(),
  active: boolean("active").default(true).notNull(),
})
export const bookingRequests = pgTable(
  "booking_requests",
  {
    id: uuid("id").primaryKey(),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id),
    service: text("service")
      .notNull()
      .references(() => serviceTypes.slug),
    status: bookingStatus("status").default("new").notNull(),
    startDate: text("start_date").notNull(),
    endDate: text("end_date").notNull(),
    duration: integer("duration").notNull(),
    visitsPerDay: integer("visits_per_day").notNull(),
    preferredTime: text("preferred_time"),
    location: jsonb("location").$type<BookingInput["location"]>().notNull(),
    care: jsonb("care").$type<BookingInput["care"]>().notNull(),
    outsideArea: boolean("outside_area").notNull(),
    estimatedCents: integer("estimated_cents"),
    finalCents: integer("final_cents"),
    depositCents: integer("deposit_cents"),
    paidCents: integer("paid_cents").default(0).notNull(),
    tokenHash: text("token_hash").notNull().unique(),
    tokenExpiresAt: timestamp("token_expires_at", {
      withTimezone: true,
    }).notNull(),
    tokenRevoked: boolean("token_revoked").default(false).notNull(),
    payloadHash: text("payload_hash").notNull(),
    consentedAt: timestamp("consented_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    createdAt: created(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("requests_status_date_idx").on(t.status, t.startDate),
    index("requests_client_idx").on(t.clientId),
  ]
)
export const bookingPets = pgTable(
  "booking_pets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    requestId: uuid("request_id")
      .notNull()
      .references(() => bookingRequests.id),
    petId: uuid("pet_id")
      .notNull()
      .references(() => pets.id),
    snapshot: jsonb("snapshot").$type<BookingInput["pets"][number]>().notNull(),
  },
  (t) => [uniqueIndex("booking_pet_unique").on(t.requestId, t.petId)]
)
export const bookings = pgTable("bookings", {
  id: uuid("id").defaultRandom().primaryKey(),
  requestId: uuid("request_id")
    .notNull()
    .unique()
    .references(() => bookingRequests.id),
  confirmedAt: created(),
  assignedSitterId: text("assigned_sitter_id").references(() => user.id),
})
export const notes = pgTable("notes", {
  id: uuid("id").defaultRandom().primaryKey(),
  requestId: uuid("request_id").references(() => bookingRequests.id),
  clientId: uuid("client_id").references(() => clients.id),
  body: text("body").notNull(),
  visibility: text("visibility", { enum: ["private", "client"] })
    .default("private")
    .notNull(),
  authorId: text("author_id")
    .notNull()
    .references(() => user.id),
  createdAt: created(),
})
export const payments = pgTable(
  "payments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    requestId: uuid("request_id")
      .notNull()
      .references(() => bookingRequests.id),
    sessionId: text("session_id").unique(),
    paymentIntentId: text("payment_intent_id"),
    kind: text("kind", { enum: ["deposit", "full", "balance"] }).notNull(),
    amountCents: integer("amount_cents").notNull(),
    status: text("status", {
      enum: ["creating", "pending", "paid", "expired", "failed", "review"],
    })
      .notNull()
      .default("creating"),
    url: text("url"),
    createdAt: created(),
  },
  (t) => [index("payments_request_idx").on(t.requestId)]
)
export const stripeEvents = pgTable("stripe_events", {
  id: text("id").primaryKey(),
  createdAt: created(),
})
export const availabilityBlocks = pgTable("availability_blocks", {
  id: uuid("id").defaultRandom().primaryKey(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  state: text("state", { enum: ["unavailable", "partial"] }).notNull(),
  reason: text("reason"),
  createdAt: created(),
})
export const applications = pgTable("sitter_applications", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  city: text("city").notNull(),
  availability: text("availability").notNull(),
  experience: text("experience").notNull(),
  petTypes: jsonb("pet_types").$type<string[]>().notNull(),
  transportation: text("transportation").notNull(),
  overnights: text("overnights").notNull(),
  why: text("why").notNull(),
  references: text("references").notNull(),
  status: text("status", { enum: ["new", "reviewed", "contacted", "archived"] })
    .default("new")
    .notNull(),
  createdAt: created(),
})
export const inquiries = pgTable("inquiries", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  createdAt: created(),
})
export const rateLimits = pgTable("rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull().default(1),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
})
export const emailOutbox = pgTable("email_outbox", {
  id: uuid("id").defaultRandom().primaryKey(),
  dedupeKey: text("dedupe_key").notNull().unique(),
  to: text("to").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  status: text("status", { enum: ["pending", "sent"] })
    .default("pending")
    .notNull(),
  attempts: integer("attempts").notNull().default(0),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  createdAt: created(),
})
export const rateLimit = pgTable("rate_limit", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(),
  count: integer("count").notNull(),
  lastRequest: bigint("last_request", { mode: "number" }).notNull(),
})
