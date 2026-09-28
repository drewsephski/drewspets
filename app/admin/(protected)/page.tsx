import Link from "next/link"
import { desc, sql } from "drizzle-orm"
import { getDb } from "@/lib/db"
import { bookingRequests, notes, emailOutbox } from "@/lib/db/schema"
import { requireAdmin } from "@/lib/server/auth"
import { money, services } from "@/lib/content"
import { today } from "@/lib/validation"
export default async function Overview() {
  await requireAdmin()
  const db = getDb()
  const [stats] = await db
    .select({
      new: sql<number>`count(*) filter (where ${bookingRequests.status}='new')`,
      upcoming: sql<number>`count(*) filter (where ${bookingRequests.status}='confirmed' and ${bookingRequests.startDate}>=${today()})`,
      active: sql<number>`count(*) filter (where ${bookingRequests.status}='in_progress')`,
      revenue: sql<number>`coalesce(sum(${bookingRequests.paidCents}),0)`,
    })
    .from(bookingRequests)
  const recent = await db
    .select()
    .from(bookingRequests)
    .orderBy(desc(bookingRequests.createdAt))
    .limit(8)
  const activity = await db
    .select()
    .from(notes)
    .orderBy(desc(notes.createdAt))
    .limit(5)
  const [outbox] = await db
    .select({
      pending: sql<number>`count(*) filter (where ${emailOutbox.status}='pending')`,
    })
    .from(emailOutbox)
  return (
    <>
      <span className="eyebrow">YOUR DAY, AT A GLANCE.</span>
      <div className="admin-metrics">
        {[
          ["New requests", stats.new],
          ["Upcoming stays", stats.upcoming],
          ["Active bookings", stats.active],
          ["Payments received", money(Number(stats.revenue))],
        ].map(([label, value]) => (
          <div className="panel" key={String(label)}>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
      {Number(outbox.pending) > 0 && (
        <div className="form-info">
          {outbox.pending} email notification(s) pending.{" "}
          {!process.env.RESEND_API_KEY
            ? "Configure Resend to send them."
            : "The scheduled outbox worker will retry delivery."}
        </div>
      )}
      <h3 style={{ margin: "30px 0 15px" }}>Recent requests</h3>
      {recent.length ? (
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Service</th>
                <th>Dates</th>
                <th>Status</th>
                <th>Review</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((r) => (
                <tr key={r.id}>
                  <td>{services.find((s) => s.slug === r.service)?.name}</td>
                  <td>
                    {r.startDate} → {r.endDate}
                  </td>
                  <td>
                    <span className="status-badge">
                      {r.status.replaceAll("_", " ")}
                    </span>
                  </td>
                  <td>
                    <Link href={`/admin/requests/${r.id}`}>Open request</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <h3>Ready for your first request.</h3>
          <p>New bookings will appear here as clients send their dates.</p>
        </div>
      )}
      <h3 style={{ margin: "30px 0 15px" }}>Recent activity</h3>
      {activity.length ? (
        activity.map((n) => (
          <div className="panel" key={n.id} style={{ marginBottom: 10 }}>
            <p>{n.body}</p>
            <small>
              {n.createdAt.toLocaleString("en-US", {
                timeZone: "America/Chicago",
              })}{" "}
              · {n.visibility}
            </small>
          </div>
        ))
      ) : (
        <p>No activity yet. Notes and status changes will appear here.</p>
      )}
    </>
  )
}
