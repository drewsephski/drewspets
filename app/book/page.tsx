import { BookingForm } from "@/components/forms/booking-form"
import { services } from "@/lib/content"
export const metadata = {
  title: "Request Pet Care",
  description:
    "Share your dates and pet details for personalized care in Fox River Grove and nearby communities. No payment needed to request.",
  alternates: { canonical: "/book" },
}
export default async function Book({
  searchParams,
}: {
  searchParams: Promise<{ service?: string; ref?: string }>
}) {
  const { service, ref } = await searchParams
  return (
    <BookingForm
      initialService={services.find((s) => s.slug === service)?.slug}
      initialReferral={ref?.slice(0, 100)}
    />
  )
}
