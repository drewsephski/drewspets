import Link from "next/link"
import { desc, eq, inArray } from "drizzle-orm"
import { getDb } from "@/lib/db"
import { bookingRequests, clients } from "@/lib/db/schema"
import { statuses, type BookingStatus } from "@/lib/validation"
import { services, money } from "@/lib/content"
export async function RequestList({
  bookings = false,
  status,
}: {
  bookings?: boolean
  status?: string
}) {
  const valid = statuses.includes(status as BookingStatus)
    ? (status as BookingStatus)
    : undefined
  const rows = await getDb()
    .select({ request: bookingRequests, client: clients })
    .from(bookingRequests)
    .innerJoin(clients, eq(clients.id, bookingRequests.clientId))
    .where(
      valid
        ? eq(bookingRequests.status, valid)
        : bookings
          ? inArray(bookingRequests.status, [
              "confirmed",
              "in_progress",
              "completed",
            ])
          : undefined
    )
    .orderBy(desc(bookingRequests.createdAt))
    .limit(200)
  return (
    <>
      <div className="admin-header">
        <h2 style={{ fontSize: 30 }}>
          {bookings ? "Bookings" : "Booking requests"}
        </h2>
        <form>
          <label className="field" style={{ margin: 0 }}>
            Filter by status
            <select name="status" defaultValue={status || ""}>
              <option value="">
                {bookings ? "Confirmed, active & completed" : "All statuses"}
              </option>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </label>
          <button className="plain-button">Apply filter</button>
        </form>
      </div>
      {rows.length ? (
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Service</th>
                <th>Dates</th>
                <th>Status</th>
                <th>Quote</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ request: r, client: c }) => (
                <tr key={r.id}>
                  <td>
                    <Link href={`/admin/requests/${r.id}`}>{c.name}</Link>
                  </td>
                  <td>{services.find((s) => s.slug === r.service)?.name}</td>
                  <td>
                    {r.startDate}
                    <br />
                    {r.endDate}
                  </td>
                  <td>
                    <span className="status-badge">
                      {r.status.replaceAll("_", " ")}
                    </span>
                  </td>
                  <td>
                    {r.finalCents !== null ? money(r.finalCents) : "Not quoted"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <h3>
            {bookings ? "Your next good day is ahead." : "No requests to show."}
          </h3>
          <p>
            {bookings
              ? "Confirmed bookings will appear here with their dates and details."
              : "Try a different filter, or check back after the first request."}
          </p>
        </div>
      )}
      <p className="quiet-note">Showing up to 200 most recent records.</p>
    </>
  )
}
