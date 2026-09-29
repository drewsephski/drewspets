import Link from "next/link"
import { Button } from "@/components/ui/button"
export default function NotFound() {
  return (
    <div className="shell success-card">
      <span className="eyebrow">PAGE NOT FOUND</span>
      <h1>That page can’t be found.</h1>
      <p>
        Try the home page to find services, rates, and ways to get in touch.
      </p>
      <Button
        nativeButton={false}
        render={<Link href="/" />}
        className="site-button"
        size="lg"
      >
        Back to home
      </Button>
    </div>
  )
}
