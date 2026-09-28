"use client"
import { Button } from "@/components/ui/button"
export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="shell success-card">
      <h1>Let’s try that again.</h1>
      <p>
        This page couldn’t load. Your submitted requests are safe. Refresh the
        page or try again in a moment.
      </p>
      <Button onClick={reset} className="site-button" size="lg">
        Try again
      </Button>
    </div>
  )
}
