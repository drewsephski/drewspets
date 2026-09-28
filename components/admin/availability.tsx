import Link from "next/link"
import { getDb } from "@/lib/db"
import { availabilityBlocks } from "@/lib/db/schema"
import { and, lte, gte } from "drizzle-orm"
import { today } from "@/lib/validation"
import { AvailabilityControl } from "@/components/forms/admin-controls"
import { removeAvailability } from "@/lib/server/admin-actions"
export async function Availability({ month }: { month?: string }) {
  const value =
    month && /^\d{4}-(0[1-9]|1[0-2])$/.test(month) ? month : today().slice(0, 7)
  const start = new Date(`${value}-01T12:00:00Z`)
  const end = new Date(
    Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 0, 12)
  )
  const blocks = await getDb()
    .select()
    .from(availabilityBlocks)
    .where(
      and(
        lte(availabilityBlocks.startDate, end.toISOString().slice(0, 10)),
        gte(availabilityBlocks.endDate, value + "-01")
      )
    )
  const prev = new Date(
    Date.UTC(start.getUTCFullYear(), start.getUTCMonth() - 1, 1)
  )
    .toISOString()
    .slice(0, 7)
  const next = new Date(
    Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1)
  )
    .toISOString()
    .slice(0, 7)
  return (
    <>
      <div className="admin-header">
        <Link className="text-link" href={`/admin/availability?month=${prev}`}>
          ← Previous
        </Link>
        <h2 style={{ fontSize: 25 }}>
          {start.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
            timeZone: "UTC",
          })}
        </h2>
        <Link className="text-link" href={`/admin/availability?month=${next}`}>
          Next →
        </Link>
      </div>
      <p>
        Unmarked days are available for review. Bookings and calendar blocks are
        separate; check both before confirming care.
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7,1fr)",
          marginTop: 25,
        }}
      >
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <span key={day} className="calendar-label">
            {day}
          </span>
        ))}
      </div>
      <div className="calendar-grid">
        {Array.from({ length: start.getUTCDay() }, (_, i) => (
          <div className="calendar-day" key={`blank-${i}`} />
        ))}
        {Array.from({ length: end.getUTCDate() }, (_, i) => {
          const date = `${value}-${String(i + 1).padStart(2, "0")}`
          const matching = blocks.filter(
            (b) => b.startDate <= date && b.endDate >= date
          )
          const state = matching.some((b) => b.state === "unavailable")
            ? "unavailable"
            : matching.length
              ? "partial"
              : "available"
          return (
            <div key={date} className={`calendar-day ${state}`}>
              <strong>{i + 1}</strong>
              <small>
                {state === "partial"
                  ? "Partially available"
                  : state === "unavailable"
                    ? "Unavailable"
                    : "Available"}
              </small>
            </div>
          )
        })}
      </div>
      <div className="admin-grid">
        <AvailabilityControl />
        <div>
          {blocks.map((b) => (
            <div className="panel" key={b.id} style={{ marginBottom: 15 }}>
              <h3 style={{ fontSize: 15 }}>
                {b.startDate} → {b.endDate}
              </h3>
              <p>
                {b.state} · {b.reason || "No private reason"}
              </p>
              <form action={removeAvailability}>
                <input type="hidden" name="id" value={b.id} />
                <button className="plain-button">Remove block</button>
              </form>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
