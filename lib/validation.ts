import { z } from "zod"
import { services, type ServiceSlug } from "./content"
const required = (label: string, max = 150) =>
  z.string().trim().min(1, `${label} is required.`).max(max)
const note = z
  .string()
  .trim()
  .max(2000, "Please keep this under 2,000 characters.")
  .default("")
export const today = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date())
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a valid date.")
  .refine((value) => {
    const parsed = new Date(`${value}T00:00:00Z`)
    return (
      !Number.isNaN(parsed.valueOf()) &&
      parsed.toISOString().slice(0, 10) === value
    )
  }, "Choose a valid date.")
const email = z
  .email("Enter a valid email address.")
  .max(254)
  .transform((value) => value.toLowerCase())
const phone = z
  .string()
  .trim()
  .max(30)
  .refine(
    (value) =>
      /^\+?[\d\s().-]+$/.test(value) &&
      value.replace(/\D/g, "").length >= 10 &&
      value.replace(/\D/g, "").length <= 15,
    "Enter a valid phone number."
  )
const base = {
  requestId: z.uuid(),
  name: required("Your name"),
  email,
  website: z.string().max(0).default(""),
}
export const overnight = (service: string) =>
  ["house-sitting", "boarding", "puppy-care"].includes(service)
export const bookingSchema = z
  .object({
    ...base,
    service: z.enum(
      services.map((s) => s.slug) as [ServiceSlug, ...ServiceSlug[]]
    ),
    startDate: date,
    endDate: date,
    petCount: z.number().int().min(1).max(30),
    petType: z.enum(["Dogs", "Cats", "Dogs and cats", "Other"]),
    petNames: required("Pet names", 300),
    petDetails: note,
    cityZip: required("City or ZIP", 100),
    phone,
    message: note,
  })
  .superRefine((value, ctx) => {
    if (value.startDate < today())
      ctx.addIssue({
        code: "custom",
        path: ["startDate"],
        message: "Choose today or a future date.",
      })
    if (
      value.endDate < value.startDate ||
      (overnight(value.service) && value.endDate === value.startDate)
    )
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: overnight(value.service)
          ? "Choose an end date after the first night."
          : "End date must be on or after the requested date.",
      })
  })
export const inquirySchema = z.object({
  ...base,
  message: required("Message", 2000),
})
export const applicationSchema = z.object({
  ...base,
  city: required("City", 100),
  message: required("A little about your pet care experience", 2000),
})
export type BookingInput = z.infer<typeof bookingSchema>
