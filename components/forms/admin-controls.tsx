"use client"
import { useActionState } from "react"
import {
  updateRequest,
  addNote,
  saveAvailability,
  expireCheckout,
  type ActionState,
} from "@/lib/server/admin-actions"
import { transitions, type BookingStatus } from "@/lib/validation"
import { Field, Select, Textarea } from "./fields"
function Feedback({ state }: { state: ActionState }) {
  return (
    <>
      {state.error && (
        <div role="alert" className="form-error">
          {state.error}
        </div>
      )}
      {state.success && (
        <p role="status" className="form-info">
          {state.success}
        </p>
      )}
    </>
  )
}
export function StatusControl({
  id,
  status,
  finalCents,
  depositCents,
}: {
  id: string
  status: BookingStatus
  finalCents: number | null
  depositCents: number | null
}) {
  const [state, action, pending] = useActionState(updateRequest, {})
  return (
    <form action={action} className="panel">
      <h3>Review & confirm</h3>
      <input type="hidden" name="id" value={id} />
      <Select label="Status" name="status" defaultValue={status}>
        {[status, ...transitions[status]].map((s) => (
          <option key={s} value={s}>
            {s.replaceAll("_", " ")}
          </option>
        ))}
      </Select>
      <div className="field-row">
        <Field
          label="Agreed total ($)"
          type="number"
          name="finalDollars"
          required
          min="0"
          max="99999"
          step="0.01"
          defaultValue={finalCents ? finalCents / 100 : ""}
        />
        <Field
          label="Deposit ($, optional)"
          type="number"
          name="depositDollars"
          min="0"
          max="99999"
          step="0.01"
          defaultValue={(depositCents || 0) / 100}
        />
      </div>
      <p style={{ fontSize: 11, marginBottom: 17 }}>
        Confirm the quote with the client before approving. Marking “confirmed”
        also creates the booking record. A zero deposit means full payment.
      </p>
      <Feedback state={state} />
      <button className="button small" disabled={pending}>
        {pending ? "Saving…" : "Save request"}
      </button>
    </form>
  )
}
export function NoteControl({ id }: { id: string }) {
  const [state, action, pending] = useActionState(addNote, {})
  return (
    <form action={action} className="panel">
      <h3>Add a note</h3>
      <input type="hidden" name="id" value={id} />
      <Select label="Who can see this?" name="visibility">
        <option value="private">Only Drew · private note</option>
        <option value="client">Client · status-page message</option>
      </Select>
      <Textarea label="Note" name="body" required maxLength={5000} />
      <p style={{ fontSize: 11 }}>
        Client messages appear on the private status page. Never include access
        codes, addresses, or medical details in a client-visible message.
      </p>
      <Feedback state={state} />
      <button
        style={{ marginTop: 15 }}
        className="button small"
        disabled={pending}
      >
        {pending ? "Saving…" : "Save note"}
      </button>
    </form>
  )
}
export function AvailabilityControl() {
  const [state, action, pending] = useActionState(saveAvailability, {})
  return (
    <form action={action} className="panel">
      <h3>Adjust availability</h3>
      <div className="field-row">
        <Field type="date" label="From" name="startDate" required />
        <Field type="date" label="Through" name="endDate" required />
      </div>
      <Select label="Availability" name="state">
        <option value="unavailable">Unavailable</option>
        <option value="partial">Partially available</option>
      </Select>
      <Field label="Private reason" name="reason" maxLength={300} />
      <Feedback state={state} />
      <button className="button small" disabled={pending}>
        {pending ? "Saving…" : "Save availability"}
      </button>
    </form>
  )
}
export function ExpirePayment({ id }: { id: string }) {
  const [state, action, pending] = useActionState(expireCheckout, {})
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <Feedback state={state} />
      <button className="button secondary small" disabled={pending}>
        Expire open checkout
      </button>
    </form>
  )
}
