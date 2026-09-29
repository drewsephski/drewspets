"use client"

import { ArrowUpRight } from "@/components/site/arrows"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="Drew’s Pet Care home">
      <Image
        src="/brand/dog-portrait.png"
        alt=""
        width={48}
        height={48}
        className="brand-portrait"
        priority
      />
      <span>
        Drew’s<span className="brand-sub">PET CARE</span>
      </span>
    </Link>
  )
}
const links = [
  ["Services", "/#services"],
  ["About Drew", "/#about"],
  ["Nearby towns", "/#service-area"],
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
          <Button
            nativeButton={false}
            render={<Link href="/book" />}
            className="site-button"
            size="lg"
          >
            Check availability <ArrowUpRight size={15} />
          </Button>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-lg"
                  className="menu-button"
                  aria-label="Open navigation"
                />
              }
            >
              <Menu />
            </SheetTrigger>
            <SheetContent className="mobile-menu-sheet">
              <SheetHeader>
                <SheetTitle>Explore Drew’s Pet Care</SheetTitle>
              </SheetHeader>
              <nav className="mobile-nav" aria-label="Mobile navigation">
                {[...links, ["Contact", "/contact"]].map(([name, href]) => (
                  <Link onClick={() => setOpen(false)} key={name} href={href}>
                    {name}
                    <ArrowUpRight size={18} />
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
