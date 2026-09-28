import { notFound } from "next/navigation"
import Link from "next/link"
import { eq, desc, and, lte, gte } from "drizzle-orm"
import { getDb } from "@/lib/db"
import * as t from "@/lib/db/schema"
import { requireAdmin } from "@/lib/server/auth"
import { revokeLink } from "@/lib/server/admin-actions"
import {
  StatusControl,
  NoteControl,
  ExpirePayment,
} from "@/components/forms/admin-controls"
import { money, services } from "@/lib/content"
import { z } from "zod"
export default async function RequestDetail({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()
  const { id } = await params
  if (!z.uuid().safeParse(id).success) notFound()
  const db = getDb()
  const [r] = await db
    .select()
    .from(t.bookingRequests)
    .where(eq(t.bookingRequests.id, id))
  if (!r) notFound()
  const [client] = await db
    .select()
    .from(t.clients)
    .where(eq(t.clients.id, r.clientId))
  const pets = await db
    .select()
    .from(t.bookingPets)
    .where(eq(t.bookingPets.requestId, id))
  const notes = await db
    .select()
    .from(t.notes)
    .where(eq(t.notes.requestId, id))
    .orderBy(desc(t.notes.createdAt))
  const payments = await db
    .select()
    .from(t.payments)
    .where(eq(t.payments.requestId, id))
  const blocks = await db
    .select()
    .from(t.availabilityBlocks)
    .where(
      and(
        lte(t.availabilityBlocks.startDate, r.endDate),
        gte(t.availabilityBlocks.endDate, r.startDate)
      )
    )
  return (
    <>
      <Link className="text-link" href="/admin/requests">
        ← All requests
      </Link>
      <div className="admin-header" style={{ marginTop: 20 }}>
        <div>
          <h2 style={{ fontSize: 33 }}>{client.name}’s request</h2>
          <p>
            {services.find((s) => s.slug === r.service)?.name} · {r.startDate} →{" "}
            {r.endDate}
          </p>
        </div>
        <span className="status-badge">{r.status.replaceAll("_", " ")}</span>
      </div>
      {r.outsideArea && (
        <div className="form-info">
          This address needs a service-area review.
        </div>
      )}
      {blocks.length > 0 && (
        <div className="form-error">
          Availability overlap:{" "}
          {blocks
            .map((b) => `${b.startDate}–${b.endDate} (${b.state})`)
            .join(", ")}
          . Review before accepting.
        </div>
      )}
      <div className="admin-grid">
        <div>
          <section className="panel">
            <h3>Client & location</h3>
            <dl className="detail-list">
              {Object.entries({
                Email: client.email,
                Phone: client.phone,
                "Contact by": client.preferredContact,
                Address: `${r.location.address} ${r.location.unit}, ${r.location.city}, IL ${r.location.zip}`,
                "Preferred time": r.preferredTime || "To discuss",
                Duration: `${r.duration} minutes`,
                Frequency: `${r.visitsPerDay} / day`,
                Estimate: r.estimatedCents
                  ? money(r.estimatedCents)
                  : "Personal quote",
                Received: money(r.paidCents),
              }).map(([k, v]) => (
                <div key={k} style={{ display: "contents" }}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </section>
          {pets.map((p) => (
            <section className="panel" key={p.id}>
              <h3>
                {p.snapshot.name} · {p.snapshot.species}
              </h3>
              <dl className="detail-list">
                {Object.entries(p.snapshot)
                  .filter(([key]) => !["name", "species"].includes(key))
                  .map(([key, value]) => (
                    <div key={key} style={{ display: "contents" }}>
                      <dt>{key}</dt>
                      <dd>{value || "Not provided"}</dd>
                    </div>
                  ))}
              </dl>
            </section>
          ))}
          <section className="panel">
            <h3>Care instructions · private</h3>
            <dl className="detail-list">
              {Object.entries(r.care).map(([key, value]) => (
                <div key={key} style={{ display: "contents" }}>
                  <dt>{key}</dt>
                  <dd>{value || "Not provided"}</dd>
                </div>
              ))}
            </dl>
          </section>
          <section className="panel">
            <h3>Notes & messages</h3>
            {notes.length ? (
              notes.map((n) => (
                <div
                  key={n.id}
                  style={{
                    padding: "15px 0",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <span className="status-badge">
                    {n.visibility === "private"
                      ? "Private · only Drew"
                      : "Client-visible"}
                  </span>
                  <p style={{ marginTop: 9, whiteSpace: "pre-wrap" }}>
                    {n.body}
                  </p>
                  <small>
                    {n.createdAt.toLocaleString("en-US", {
                      timeZone: "America/Chicago",
                    })}
                  </small>
                </div>
              ))
            ) : (
              <p>No notes yet.</p>
            )}
          </section>
        </div>
        <aside>
          <StatusControl
            id={id}
            status={r.status}
            finalCents={r.finalCents}
            depositCents={r.depositCents}
          />
          <div style={{ marginTop: 22 }}>
            <NoteControl id={id} />
          </div>
          <section className="panel" style={{ marginTop: 22 }}>
            <h3>Payments</h3>
            {payments.length ? (
              payments.map((p) => (
                <p key={p.id}>
                  {money(p.amountCents)} · {p.kind} · {p.status}
                </p>
              ))
            ) : (
              <p>No payments yet.</p>
            )}
            {payments.some((p) => p.status === "pending") && (
              <ExpirePayment id={id} />
            )}
            <p style={{ marginTop: 15 }}>
              Refunds and disputed payments must be reviewed in Stripe. Never
              mark money received manually.
            </p>
          </section>
          <section className="panel">
            <h3>Private booking link</h3>
            <p>
              {r.tokenRevoked
                ? "The client link is revoked."
                : "Client access expires 180 days after the requested stay. Revoke access if the link is shared accidentally."}
            </p>
            {!r.tokenRevoked && (
              <form action={revokeLink}>
                <input type="hidden" name="id" value={id} />
                <button className="plain-button" style={{ marginTop: 15 }}>
                  Revoke client link
                </button>
              </form>
            )}
          </section>
        </aside>
      </div>
    </>
  )
}
