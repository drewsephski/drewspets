import Link from "next/link"
import { desc, eq } from "drizzle-orm"
import { getDb } from "@/lib/db"
import * as t from "@/lib/db/schema"
import { reviewApplication } from "@/lib/server/admin-actions"
export async function PeopleList({
  kind,
}: {
  kind: "clients" | "pets" | "applications" | "inquiries"
}) {
  const db = getDb()
  if (kind === "clients") {
    const clients = await db
      .select()
      .from(t.clients)
      .orderBy(desc(t.clients.createdAt))
      .limit(100)
    const requests = await db
      .select({
        id: t.bookingRequests.id,
        clientId: t.bookingRequests.clientId,
        startDate: t.bookingRequests.startDate,
        status: t.bookingRequests.status,
      })
      .from(t.bookingRequests)
      .orderBy(desc(t.bookingRequests.createdAt))
    const pets = await db
      .select({ name: t.pets.name, clientId: t.pets.clientId })
      .from(t.pets)
    return (
      <>
        <h2 style={{ fontSize: 30, marginBottom: 25 }}>Clients</h2>
        {clients.map((c) => (
          <details className="panel" key={c.id} style={{ marginBottom: 17 }}>
            <summary style={{ cursor: "pointer" }}>
              {c.name} · {c.email}
            </summary>
            <p style={{ margin: "15px 0" }}>
              {c.phone} · Preferred contact: {c.preferredContact}
            </p>
            <p>
              Pets:{" "}
              {pets
                .filter((p) => p.clientId === c.id)
                .map((p) => p.name)
                .join(", ")}
            </p>
            <h3 style={{ fontSize: 15, marginTop: 20 }}>
              Requests, booking history & notes
            </h3>
            {requests
              .filter((r) => r.clientId === c.id)
              .map((r) => (
                <p key={r.id}>
                  <Link className="text-link" href={`/admin/requests/${r.id}`}>
                    {r.startDate} · {r.status.replaceAll("_", " ")} →
                  </Link>
                </p>
              ))}
          </details>
        ))}
        {!clients.length && (
          <Empty copy="Clients are created automatically when a booking request is submitted." />
        )}
        <p className="quiet-note">
          Showing the most recent 100 client records. New requests are kept
          separate until identity can be verified.
        </p>
      </>
    )
  }
  if (kind === "pets") {
    const pets = await db
      .select({ pet: t.pets, client: t.clients })
      .from(t.pets)
      .innerJoin(t.clients, eq(t.clients.id, t.pets.clientId))
      .orderBy(desc(t.pets.createdAt))
      .limit(100)
    return (
      <>
        <h2 style={{ fontSize: 30, marginBottom: 25 }}>Pets & care routines</h2>
        {pets.map(({ pet, client }) => (
          <details key={pet.id} className="panel" style={{ marginBottom: 17 }}>
            <summary style={{ cursor: "pointer" }}>
              {pet.name} · {pet.species} · {client.name}
            </summary>
            <dl className="detail-list" style={{ marginTop: 20 }}>
              {Object.entries(pet.details).map(([k, v]) => (
                <div style={{ display: "contents" }} key={k}>
                  <dt>{k}</dt>
                  <dd>{v || "Not provided"}</dd>
                </div>
              ))}
            </dl>
          </details>
        ))}
        {!pets.length && (
          <Empty copy="Pet profiles, medication instructions, and emergency contacts will appear after the first request." />
        )}
      </>
    )
  }
  if (kind === "applications") {
    const apps = await db
      .select()
      .from(t.applications)
      .orderBy(desc(t.applications.createdAt))
      .limit(100)
    return (
      <>
        <h2 style={{ fontSize: 30, marginBottom: 25 }}>Sitter applications</h2>
        {apps.map((a) => (
          <details key={a.id} className="panel" style={{ marginBottom: 17 }}>
            <summary style={{ cursor: "pointer" }}>
              {a.name} · {a.city} · {a.status}
            </summary>
            <dl className="detail-list" style={{ marginTop: 22 }}>
              {Object.entries({
                Email: a.email,
                Phone: a.phone,
                Availability: a.availability,
                Experience: a.experience,
                "Pet types": a.petTypes.join(", "),
                Transportation: a.transportation,
                Overnights: a.overnights,
                Introduction: a.why,
                References: a.references,
              }).map(([k, v]) => (
                <div style={{ display: "contents" }} key={k}>
                  <dt>{k}</dt>
                  <dd>{v || "Not provided"}</dd>
                </div>
              ))}
            </dl>
            <form action={reviewApplication} style={{ marginTop: 22 }}>
              <input type="hidden" name="id" value={a.id} />
              <label className="field">
                Review status
                <select name="status" defaultValue={a.status}>
                  {["new", "reviewed", "contacted", "archived"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              <button className="button small">Save review status</button>
            </form>
          </details>
        ))}
        {!apps.length && (
          <Empty copy="Applications from prospective local sitters will appear here." />
        )}
      </>
    )
  }
  const inquiries = await db
    .select()
    .from(t.inquiries)
    .orderBy(desc(t.inquiries.createdAt))
    .limit(100)
  return (
    <>
      <h2 style={{ fontSize: 30, marginBottom: 25 }}>General inquiries</h2>
      {inquiries.map((i) => (
        <section key={i.id} className="panel" style={{ marginBottom: 17 }}>
          <h3>{i.name}</h3>
          <a href={`mailto:${i.email}`} className="text-link">
            {i.email}
          </a>
          <p style={{ whiteSpace: "pre-wrap", margin: "17px 0" }}>
            {i.message}
          </p>
          <small>{i.createdAt.toLocaleDateString()}</small>
        </section>
      ))}
      {!inquiries.length && (
        <Empty copy="Messages sent through the contact page will appear here." />
      )}
    </>
  )
}
function Empty({ copy }: { copy: string }) {
  return (
    <div className="empty-state">
      <h3>Nothing here just yet.</h3>
      <p>{copy}</p>
    </div>
  )
}
