"use client"
import { Button } from "@/components/ui/button"
export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="shell success-card">
      <span className="eyebrow">SOMETHING WENT WRONG</span>
      <h1>This page couldn’t load.</h1>
      <p>
        Try loading it again. If the problem continues, come back in a moment.
      </p>
      <Button onClick={reset} className="site-button" size="lg">
        Try again
      </Button>
    </div>
  )
}
