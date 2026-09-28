import { notFound } from "next/navigation"
import { requireAdmin } from "@/lib/server/auth"
import { RequestList } from "@/components/admin/requests"
import { PeopleList } from "@/components/admin/people"
import { Availability } from "@/components/admin/availability"
export default async function AdminSection({
  params,
  searchParams,
}: {
  params: Promise<{ section: string }>
  searchParams: Promise<{ status?: string; month?: string }>
}) {
  await requireAdmin()
  const { section } = await params
  const query = await searchParams
  if (section === "requests" || section === "bookings")
    return (
      <RequestList bookings={section === "bookings"} status={query.status} />
    )
  if (["clients", "pets", "applications", "inquiries"].includes(section))
    return (
      <PeopleList
        kind={section as "clients" | "pets" | "applications" | "inquiries"}
      />
    )
  if (section === "availability") return <Availability month={query.month} />
  notFound()
}
