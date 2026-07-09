import type { ReactNode } from "react"
import Link from "next/link"
import { GladicLogo } from "./gladic-logo"

export function MarketingAuthShell({
  children,
  title,
  subtitle,
}: {
  children: ReactNode
  title: string
  subtitle?: string
}) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="border-b border-[#D8DEE9]/80 bg-white/90 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-sm items-center justify-between">
          <GladicLogo size="sm" variant="onLight" href="/" />
          <Link href="/" className="text-xs text-[#2454FF] hover:underline">
            Back to home
          </Link>
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="rounded-xl border border-[#D8DEE9] bg-white p-7 shadow-sm">
            <h2 className="mb-1 text-base font-semibold text-[#0B1020]">{title}</h2>
            {subtitle && <p className="mb-6 text-sm text-[#526174]">{subtitle}</p>}
            {!subtitle && <div className="mb-6" />}
            {children}
          </div>

          <p className="mt-5 text-center text-[11px] leading-relaxed text-[#526174]">
            GLADIC AI™ is not a law firm and does not provide legal representation. Reports are for informational,
            educational, research, and self-help purposes only.
          </p>
        </div>
      </div>
    </div>
  )
}
