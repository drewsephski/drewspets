import Link from "next/link"
export default function NotFound() {
  return (
    <div className="shell success-card">
      <span className="eyebrow">A LITTLE OFF THE PATH.</span>
      <h1>Let’s get you home.</h1>
      <p>
        This page isn’t available. If you’re opening a private booking link,
        check that you copied the whole link.
      </p>
      <Link className="button" href="/">
        Back to home
      </Link>
    </div>
  )
}
