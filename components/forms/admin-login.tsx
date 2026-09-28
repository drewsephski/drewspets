"use client"
import { useState, type FormEvent } from "react"
import { Field } from "./fields"
export function AdminLogin({ ready }: { ready: boolean }) {
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBusy(true)
    setError("")
    const f = new FormData(e.currentTarget)
    try {
      const r = await fetch("/api/auth/sign-in/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: f.get("email"),
          password: f.get("password"),
        }),
      })
      if (!r.ok)
        throw new Error("Sign-in failed. Check your email and password.")
      window.location.assign("/admin")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to sign in. Try again.")
      setBusy(false)
    }
  }
  return (
    <form onSubmit={submit} className="form-card">
      <span className="eyebrow">DREW’S PET CARE · PRIVATE</span>
      <h2>Welcome back, Drew.</h2>
      <p>Your requests, pets, and upcoming care—all in one place.</p>
      {!ready && (
        <div className="form-info">
          Admin sign-in hasn’t been configured yet. Complete the database and
          account setup to get started.
        </div>
      )}
      <Field
        name="email"
        label="Email"
        type="email"
        autoComplete="username"
        required
      />
      <Field
        name="password"
        label="Password"
        type="password"
        autoComplete="current-password"
        required
      />
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <button className="button" disabled={!ready || busy}>
        {busy ? "Signing in…" : "Sign in securely"}
      </button>
    </form>
  )
}
export function SignOut() {
  return (
    <button
      className="plain-button"
      onClick={async () => {
        await fetch("/api/auth/sign-out", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: "{}",
        })
        window.location.assign("/admin/login")
      }}
    >
      Sign out
    </button>
  )
}
