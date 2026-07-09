"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import { MLR_COLORS } from "@/lib/marketing/mlr-brand"
import { GladicLogo } from "./gladic-logo"

const navLinks = [
  { href: "#product", label: "Product" },
  { href: "#reports", label: "Reports" },
  { href: "#memberships", label: "Memberships" },
  { href: "#security", label: "Security" },
  { href: "#faq", label: "FAQ" },
]

export function MlrHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-[#D8DEE9]/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-[4.25rem] max-w-7xl items-center justify-between px-6">
        <GladicLogo size="sm" variant="onLight" href="/" />

        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-[#526174] transition-colors hover:text-[#0B1020]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/sign-in"
            className="rounded-lg px-4 py-2 text-sm font-medium text-[#526174] transition-colors hover:text-[#0B1020]"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:brightness-110"
            style={{ backgroundColor: MLR_COLORS.rightsBlue }}
          >
            Start Membership
          </Link>
        </div>

        <button
          type="button"
          className="text-[#0B1020] md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-[#D8DEE9] bg-white/95 px-6 py-4 backdrop-blur-md md:hidden">
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-[#526174]"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div
              className="mt-2 flex flex-col gap-2 border-t border-[#D8DEE9] pt-4"
            >
              <Link href="/sign-in" className="text-sm text-[#526174]">
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="rounded-lg px-4 py-2 text-center text-sm font-semibold text-white"
                style={{ backgroundColor: MLR_COLORS.rightsBlue }}
              >
                Start Membership
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
