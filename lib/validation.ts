import { z } from "zod"
import { services, locations, type ServiceSlug } from "./content"
export const serviceSlugs = services.map((s) => s.slug) as [
  ServiceSlug,
  ...ServiceSlug[],
]
export const statuses = [
  "new",
  "contacted",
  "meet_and_greet",
  "approved",
  "payment_pending",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
  "declined",
] as const
export type BookingStatus = (typeof statuses)[number]
const note = z
  .string()
  .trim()
  .max(3000, "Please keep this under 3,000 characters.")
  .default("")
const required = (label: string, max = 150) =>
  z.string().trim().min(1, `${label} is required.`).max(max)
export const today = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date())
export const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a valid date.")
  .refine((v) => {
    const d = new Date(`${v}T00:00:00Z`)
    return !Number.isNaN(d.valueOf()) && d.toISOString().slice(0, 10) === v
  }, "Choose a valid date.")
export const overnight = (service: string) =>
  ["house-sitting", "boarding", "puppy-care"].includes(service)
export const dateSchema = z
  .object({
    service: z.enum(serviceSlugs),
    startDate: date,
    endDate: date,
    preferredTime: z.string().trim().max(100).default(""),
    duration: z.enum(["30", "60"]).default("30"),
    visitsPerDay: z.number().int().min(1).max(6).default(1),
  })
  .superRefine((d, ctx) => {
    if (d.startDate < today())
      ctx.addIssue({
        code: "custom",
        path: ["startDate"],
        message: "Choose today or a future date.",
      })
    if (
      d.endDate < d.startDate ||
      (overnight(d.service) && d.endDate === d.startDate)
    )
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: overnight(d.service)
          ? "Overnight care needs at least one night."
          : "End date must be on or after the start date.",
      })
    const days = (Date.parse(d.endDate) - Date.parse(d.startDate)) / 86400000
    if (days > 180)
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "For stays over 180 days, please contact Drew.",
      })
    if ((Date.parse(d.startDate) - Date.parse(today())) / 86400000 > 366)
      ctx.addIssue({
        code: "custom",
        path: ["startDate"],
        message: "Please choose dates within the next year.",
      })
  })
export const petSchema = z.object({
  name: required("Pet name", 80),
  species: z.enum(["dog", "cat"]),
  breed: z.string().trim().max(100).default(""),
  age: required("Age", 60),
  size: z.enum(["small", "medium", "large", "extra-large"]),
  sex: z.enum(["unspecified", "male", "female"]).default("unspecified"),
  feeding: note,
  medications: note,
  behavior: note,
  instructions: note,
  emergencyContact: z.string().trim().max(200).default(""),
  vet: z.string().trim().max(200).default(""),
})
export const careSchema = z.object({
  routine: note,
  walks: z.string().trim().max(100).default(""),
  alone: z.enum(["yes", "no", "unsure"]).default("unsure"),
  maxAlone: z.string().trim().max(100).default(""),
  sleeping: note,
  medication: note,
  access: note,
  other: note,
})
export const locationSchema = z.object({
  address: required("Street address", 200),
  unit: z.string().trim().max(60).default(""),
  city: required("City", 100),
  zip: z.string().regex(/^\d{5}$/, "Enter a 5-digit ZIP code."),
})
export const contactSchema = z.object({
  name: required("Your name"),
  email: z
    .email("Enter a valid email address.")
    .max(254)
    .transform((v) => v.toLowerCase()),
  phone: z
    .string()
    .trim()
    .max(30)
    .refine(
      (v) =>
        v.replace(/\D/g, "").length >= 10 && v.replace(/\D/g, "").length <= 15,
      "Enter a valid phone number."
    ),
  preferredContact: z.enum(["email", "text", "phone"]),
})
export const bookingSchema = z
  .object({
    requestId: z.uuid(),
    ...dateSchema.shape,
    pets: z
      .array(petSchema)
      .min(1, "Add at least one pet.")
      .max(8, "For more than 8 pets, contact Drew."),
    care: careSchema,
    location: locationSchema,
    contact: contactSchema,
    consent: z.literal(true, {
      error: "Please acknowledge the request terms.",
    }),
    website: z.string().max(0).default(""),
  })
  .superRefine((d, ctx) => {
    const result = dateSchema.safeParse(d)
    if (!result.success)
      result.error.issues.forEach((issue) =>
        ctx.addIssue({ ...issue, code: "custom" })
      )
    if (
      ["dog-walking", "daycare", "puppy-care"].includes(d.service) &&
      d.pets.some((p) => p.species !== "dog")
    )
      ctx.addIssue({
        code: "custom",
        path: ["pets"],
        message:
          "Choose dogs for this service, or select drop-ins or house sitting for mixed households.",
      })
    if (d.service === "cat-sitting" && d.pets.some((p) => p.species !== "cat"))
      ctx.addIssue({
        code: "custom",
        path: ["pets"],
        message:
          "Choose cats for cat sitting, or select drop-ins for mixed households.",
      })
  })
export type BookingInput = z.infer<typeof bookingSchema>
export function inServiceArea(city: string, zip: string) {
  return (
    locations.some(
      (l) => l.name.toLowerCase() === city.trim().toLowerCase() && l.zip === zip
    ) ||
    (city.trim().toLowerCase() === "crystal lake" && zip === "60012")
  )
}
export function estimateBooking(
  input: Pick<
    BookingInput,
    "service" | "startDate" | "endDate" | "duration" | "visitsPerDay" | "pets"
  >
) {
  const service = services.find((s) => s.slug === input.service)!
  if (!service.price) return null
  const nights =
    (Date.parse(input.endDate) - Date.parse(input.startDate)) / 86400000
  if (!Number.isFinite(nights) || nights < 0) return null
  const units = overnight(input.service)
    ? Math.max(1, nights)
    : (nights + 1) * input.visitsPerDay
  const base = overnight(input.service)
    ? service.price
    : input.duration === "60"
      ? 3500
      : service.price
  const extras = overnight(input.service)
    ? input.pets
        .slice(1)
        .reduce((sum, p) => sum + (p.species === "dog" ? 1500 : 1000), 0)
    : 0
  return { cents: (base + extras) * units, units, unit: service.unit }
}
export const applicationSchema = z.object({
  name: required("Name"),
  email: z
    .email()
    .max(254)
    .transform((v) => v.toLowerCase()),
  phone: contactSchema.shape.phone,
  city: required("City"),
  availability: required("Availability", 2000),
  experience: required("Experience", 4000),
  petTypes: z.array(z.enum(["dogs", "cats", "puppies", "senior pets"])).min(1),
  transportation: z.enum(["yes", "no"]),
  overnights: z.enum(["yes", "no", "sometimes"]),
  why: required("A little about why you want to join", 3000),
  references: note,
  consent: z.literal(true),
  website: z.string().max(0).default(""),
})
export const inquirySchema = z.object({
  name: required("Name"),
  email: z
    .email()
    .max(254)
    .transform((v) => v.toLowerCase()),
  message: required("Message", 4000),
  website: z.string().max(0).default(""),
  consent: z.literal(true),
})
export const transitions: Record<BookingStatus, readonly BookingStatus[]> = {
  new: ["contacted", "meet_and_greet", "approved", "declined", "cancelled"],
  contacted: ["meet_and_greet", "approved", "declined", "cancelled"],
  meet_and_greet: ["contacted", "approved", "declined", "cancelled"],
  approved: ["payment_pending", "confirmed", "cancelled"],
  payment_pending: ["confirmed", "cancelled"],
  confirmed: ["in_progress", "cancelled"],
  in_progress: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
  declined: [],
}
export function canTransition(from: BookingStatus, to: BookingStatus) {
  return transitions[from].includes(to)
}
export function paymentEligible(
  status: BookingStatus,
  finalCents: number | null,
  paidCents: number
) {
  return (
    ["approved", "payment_pending", "confirmed"].includes(status) &&
    finalCents !== null &&
    finalCents > paidCents
  )
}
export function isAdmin(
  email: string | undefined,
  configuredEmail: string | undefined
) {
  return (
    !!email &&
    !!configuredEmail &&
    email.toLowerCase() === configuredEmail.toLowerCase()
  )
}
