"use client"

import { ArrowUpRight } from "@/components/site/arrows"
import Image from "next/image"
import Link from "next/link"
import { useTheme } from "next-themes"
import { useEffect, useRef, useState } from "react"
import { Menu, X, MapPin, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetClose,
  SheetDescription,
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
  ["Services", "/services"],
  ["Cat sitting", "/services/cat-sitting"],
  ["Dog walking", "/services/dog-walking"],
  ["Overnight", "/services/overnight-dog-sitting"],
  ["Towns", "/locations"],
  ["About", "/about"],
  ["FAQ", "/#faq"],
]
export function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()
  const headerRef = useRef<HTMLElement>(null)
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 8)
    update()
    window.addEventListener("scroll", update, { passive: true })
    return () => window.removeEventListener("scroll", update)
  }, [])
  // The nav sits between the brand and the actions; its offset from the
  // header's center is half their width difference. Expose it so the
  // scrolled pill can slide to the true center.
  useEffect(() => {
    const header = headerRef.current
    const brand = header?.querySelector<HTMLElement>(".brand")
    const actions = header?.querySelector<HTMLElement>(".header-actions")
    if (!header || !brand || !actions) return
    const measure = () =>
      header.style.setProperty(
        "--nav-shift",
        `${(actions.offsetWidth - brand.offsetWidth) / 2}px`
      )
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(brand)
    observer.observe(actions)
    return () => observer.disconnect()
  }, [])
  return (
    <header
      ref={headerRef}
      className="site-header"
      data-scrolled={scrolled || undefined}
    >
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
            variant="ghost"
            size="icon-lg"
            aria-label="Toggle color theme"
            title="Toggle color theme"
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
          >
            <Sun className="hidden dark:block" aria-hidden="true" />
            <Moon className="dark:hidden" aria-hidden="true" />
          </Button>
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
            <SheetContent className="mobile-menu-sheet" showCloseButton={false}>
              <div className="mobile-menu-toolbar">
                <span className="eyebrow">DREW’S PET CARE</span>
                <SheetClose
                  render={
                    <Button
                      variant="ghost"
                      size="icon-lg"
                      className="mobile-menu-close"
                    />
                  }
                  aria-label="Close navigation"
                >
                  <X size={20} />
                </SheetClose>
              </div>
              <div className="mobile-menu-body">
                <SheetHeader className="mobile-menu-intro">
                  <Image
                    src="/brand/dog-portrait.png"
                    alt=""
                    width={64}
                    height={64}
                  />
                  <SheetTitle>Care close to home.</SheetTitle>
                  <SheetDescription>
                    A familiar face for your pet. A little peace of mind for
                    you.
                  </SheetDescription>
                </SheetHeader>
                <nav className="mobile-nav" aria-label="Mobile navigation">
                  {[...links, ["Contact", "/contact"]].map(([name, href]) => (
                    <Link onClick={() => setOpen(false)} key={name} href={href}>
                      <span>{name}</span>
                      <ArrowUpRight size={18} />
                    </Link>
                  ))}
                </nav>
                <div className="mobile-menu-footer">
                  <Button
                    nativeButton={false}
                    render={<Link href="/book" />}
                    className="site-button"
                    size="lg"
                    onClick={() => setOpen(false)}
                  >
                    Let’s plan your pet’s care <ArrowUpRight size={18} />
                  </Button>
                  <p>
                    <MapPin size={14} /> Fox River Grove & nearby towns
                  </p>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
