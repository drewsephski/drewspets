import { describe, expect, test } from "bun:test"
import {
  bookingSchema,
  applicationSchema,
  inquirySchema,
} from "../lib/validation"
const base = {
  requestId: "c6a38f44-af3f-4517-8666-fd5edc674be1",
  name: "Test Owner",
  email: "test@example.com",
}
const valid = {
  ...base,
  service: "house-sitting",
  startDate: "2099-06-01",
  endDate: "2099-06-03",
  petCount: 2,
  petType: "Dogs and cats",
  petNames: "Sunny, Pepper",
  cityZip: "60021",
  phone: "312-555-0123",
}
describe("short care request", () => {
  test("requires no address, account, routine, medication or payment", () => {
    const result = bookingSchema.parse(valid)
    expect(result.petDetails).toBe("")
    expect(result.message).toBe("")
    expect(result).not.toHaveProperty("care")
  })
  test("accepts one-day visits and mixed households", () =>
    expect(
      bookingSchema.safeParse({
        ...valid,
        service: "drop-ins",
        endDate: valid.startDate,
      }).success
    ).toBe(true))
  test("referral attribution is optional and bounded", () => {
    expect(bookingSchema.safeParse(valid).success).toBe(true)
    expect(
      bookingSchema.safeParse({ ...valid, referredBy: " Jamie " }).data
        ?.referredBy
    ).toBe("Jamie")
    expect(
      bookingSchema.safeParse({ ...valid, referredBy: "x".repeat(101) }).success
    ).toBe(false)
  })
  test("rejects past, impossible and reversed dates and zero-night stays", () => {
    for (const dates of [
      { startDate: "2000-01-01" },
      { startDate: "2099-02-30" },
      { endDate: "2099-05-01" },
      { endDate: valid.startDate },
    ])
      expect(bookingSchema.safeParse({ ...valid, ...dates }).success).toBe(
        false
      )
  })
  test("validates contact details, pets, length and honeypot", () => {
    for (const changes of [
      { email: "nope" },
      { phone: "abc1234567890" },
      { petCount: 0 },
      { petCount: 1.5 },
      { petNames: " " },
      { cityZip: "" },
      { website: "spam" },
      { message: "a".repeat(2001) },
    ])
      expect(bookingSchema.safeParse({ ...valid, ...changes }).success).toBe(
        false
      )
  })
  test("future sitter interest and contact need only a brief introduction", () => {
    expect(
      applicationSchema.safeParse({
        ...base,
        city: "Cary",
        message: "I have experience caring for cats.",
      }).success
    ).toBe(true)
    expect(
      inquirySchema.safeParse({
        ...base,
        message: "Do you serve my neighborhood?",
      }).success
    ).toBe(true)
  })
})
