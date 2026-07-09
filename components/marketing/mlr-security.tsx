import { Lock, CheckCircle } from "lucide-react"
import { MLR_COLORS } from "@/lib/marketing/mlr-brand"
import { FadeIn } from "./motion"

const items = [
  "Secure document uploads",
  "Encrypted storage",
  "Protected customer dashboard",
  "Access-controlled reporting workspace",
  "Enterprise-grade security controls",
  "Report-history organization",
  "Privacy-first product design",
  "Clear cancellation and billing visibility",
]

export function MlrSecurity() {
  return (
    <section id="security" className="border-y border-[#D8DEE9] bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <FadeIn className="mb-12 text-center">
          <div className="mb-3 inline-flex items-center gap-2 text-[#2454FF]">
            <Lock className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-widest">Security</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-[#0B1020]">
            Designed Around Secure Document Handling
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-lg text-[#526174]">
            Credit data is sensitive. MLR should look and feel like a protected workspace from the first click.
          </p>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="mx-auto max-w-3xl rounded-xl border border-[#D8DEE9] bg-white p-8 shadow-sm">
            <ul className="grid gap-3 sm:grid-cols-2">
              {items.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-[#526174]">
                  <CheckCircle className="h-4 w-4 shrink-0 text-[#12B981]" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-6 border-t border-[#D8DEE9] pt-5 text-xs leading-relaxed text-[#526174]">
              Security descriptions should be presented as platform commitments, not legal guarantees.
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
