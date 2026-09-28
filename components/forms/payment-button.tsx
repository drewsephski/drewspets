"use client"
import { useState } from "react"
import { ArrowUpRight } from "lucide-react"
import { conversion } from "@/components/site/analytics"
export function PaymentButton({
  token,
  kind,
  label,
}: {
  token: string
  kind: "deposit" | "full" | "balance"
  label: string
}) {
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  return (
    <div>
      <button
        className="button"
        disabled={busy}
        onClick={async () => {
          setBusy(true)
          setError("")
          try {
            const response = await fetch("/api/checkout", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token, kind }),
            })
            const data = await response.json()
            if (!response.ok) throw new Error(data.error)
            conversion("payment_started")
            window.location.assign(data.url)
          } catch (e) {
            setError(
              e instanceof Error ? e.message : "Payment could not be started."
            )
            setBusy(false)
          }
        }}
      >
        {busy ? "Opening secure checkout…" : label}
        <ArrowUpRight size={16} />
      </button>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
    </div>
  )
}
