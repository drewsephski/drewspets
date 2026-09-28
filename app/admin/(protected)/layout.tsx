import Link from "next/link"
import { requireAdmin } from "@/lib/server/auth"
import { SignOut } from "@/components/forms/admin-login"
export const metadata = {
  title: "Care Dashboard",
  robots: { index: false, follow: false },
}
export const dynamic = "force-dynamic"
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAdmin()
  return (
    <div className="shell admin-shell">
      <header className="admin-header">
        <div>
          <span className="eyebrow">DREW’S PET CARE · PRIVATE</span>
          <h1>Your care dashboard.</h1>
        </div>
        <SignOut />
      </header>
      <nav className="admin-nav" aria-label="Admin navigation">
        {[
          "Overview",
          "Requests",
          "Bookings",
          "Clients",
          "Pets",
          "Availability",
          "Applications",
          "Inquiries",
        ].map((n) => (
          <Link
            key={n}
            href={n === "Overview" ? "/admin" : `/admin/${n.toLowerCase()}`}
          >
            {n}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  )
}
