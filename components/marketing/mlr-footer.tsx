import Link from "next/link"
import { MLR_BRAND } from "@/lib/marketing/mlr-brand"
import { GladicLogo } from "./gladic-logo"

const footerColumns = [
  {
    title: "Reports",
    links: [
      { label: "Opposition Report™", href: "#reports" },
      { label: "My Legal Report™", href: "#reports" },
      { label: "My Self Report™", href: "#reports" },
      { label: "Consumer Rights Roadmap", href: "#reports" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "FAQ", href: "#faq" },
      { label: "Security", href: "#security" },
      { label: "Refund Policy", href: "/refund-policy" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Use", href: "/terms" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About GLADIC AI™", href: "https://gladic.ai" },
      { label: "Contact", href: "https://gladic.ai/contact" },
      { label: "Support", href: "#faq" },
      { label: "Sign In", href: "/sign-in" },
    ],
  },
]

export function MlrFooter() {
  return (
    <footer className="border-t border-[#D8DEE9] bg-white py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <GladicLogo size="md" variant="onLight" showLabel={false} className="mb-3" />
            <p className="text-[10px] text-[#526174]">{MLR_BRAND.productFull}</p>
            <p className="mt-4 text-xs leading-relaxed text-[#526174]">{MLR_BRAND.parentTagline}</p>
            <p className="mt-2 text-xs leading-relaxed text-[#526174]">{MLR_BRAND.parentPositioning}</p>
          </div>

          {footerColumns.map((col) => (
            <div key={col.title}>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#0B1020]">{col.title}</p>
              <ul className="space-y-2">
                {col.links.map((link) => {
                  const isExternal = link.href.startsWith("http")
                  return (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-xs text-[#526174] transition-colors hover:text-[#2454FF]"
                        {...(isExternal
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                      >
                        {link.label}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-2 border-t border-[#D8DEE9] pt-8 sm:flex-row">
          <p className="text-xs text-[#526174]">© 2026 GLADIC AI™. All rights reserved.</p>
          <p className="text-xs text-[#526174]">Miami, Florida · 2026</p>
        </div>
      </div>
    </footer>
  )
}
