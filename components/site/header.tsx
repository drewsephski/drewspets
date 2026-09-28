"use client"
import Link from "next/link"
import { useState } from "react"
import { ArrowUpRight, Menu, X } from "lucide-react"
export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="Drew’s Pet Care home">
      <svg viewBox="0 0 36 40" fill="none" aria-hidden="true">
        <path
          d="M8 13 4 6c-1-2 1-4 3-3l9 6h6l8-6c2-1 4 1 3 3l-3 12v10c0 7-5 10-12 10S6 34 6 28V18"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M13 22h.1M25 22h.1"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="m17 28 2 2 2-2M19 30v3"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <span>
        Drew’s<span className="brand-sub">PET CARE</span>
      </span>
    </Link>
  )
}
const links = [
  ["Services", "/#services"],
  ["About", "/#about"],
  ["Service Area", "/#service-area"],
  ["Rates", "/#rates"],
  ["Reviews", "/#reviews"],
  ["FAQ", "/#faq"],
]
export function Header() {
  const [open, setOpen] = useState(false)
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Brand />
        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map(([name, href]) => (
            <Link key={name} href={href}>
              {name}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <Link href="/book" className="button small">
            Request a booking <ArrowUpRight size={15} />
          </Link>
          <button
            className="menu-button"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {open && (
        <nav
          className="mobile-nav shell"
          id="mobile-menu"
          aria-label="Mobile navigation"
        >
          {[...links, ["Apply to be a sitter", "/apply"]].map(
            ([name, href]) => (
              <Link onClick={() => setOpen(false)} key={name} href={href}>
                {name}
                <ArrowUpRight size={18} />
              </Link>
            )
          )}
        </nav>
      )}
    </header>
  )
}
