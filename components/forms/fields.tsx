import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react"
export function Field({
  label,
  hint,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  return (
    <label className="field">
      <span>
        {label}
        {props.required ? " *" : ""}
      </span>
      <input {...props} />
      {hint && <small>{hint}</small>}
    </label>
  )
}
export function Textarea({
  label,
  hint,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string
  hint?: string
}) {
  return (
    <label className="field">
      <span>
        {label}
        {props.required ? " *" : ""}
      </span>
      <textarea {...props} />
      {hint && <small>{hint}</small>}
    </label>
  )
}
export function Select({
  label,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select {...props}>{children}</select>
    </label>
  )
}
export function Honeypot() {
  return (
    <div className="honeypot" aria-hidden="true">
      <label>
        Leave this empty
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  )
}
