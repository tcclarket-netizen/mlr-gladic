import { Gauge, BarChart3, FolderOpen, Scale, Headphones } from "lucide-react"
import { FadeIn, Stagger, StaggerItem } from "./motion"

const features = [
  {
    icon: Gauge,
    title: "Membership Usage",
    bullets: ["Current plan", "Monthly report allowance", "Reports used", "Reports remaining", "Renewal cycle"],
  },
  {
    icon: BarChart3,
    title: "Opposition Dashboard™",
    bullets: [
      "Opposition metrics",
      "Bureau comparison",
      "Credit resistance indicators",
      "Approval-readiness signals",
    ],
  },
  {
    icon: FolderOpen,
    title: "Report Library",
    bullets: ["Generated reports", "Status tracking", "Export-ready summaries", "Timestamped records"],
  },
  {
    icon: Scale,
    title: "Rights Intelligence Notes",
    bullets: [
      "Consumer-rights analysis",
      "Evidence preservation",
      "Administrative remedy considerations",
      "Self-help documentation framework",
    ],
  },
  {
    icon: Headphones,
    title: "Support Access",
    bullets: [
      "Priority support depending on membership",
      "Consultation availability depending on plan",
      "Guided next-step education",
    ],
  },
]

export function MlrDashboardFeatures() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <FadeIn className="mb-14 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-[#0B1020]">
            A Dashboard Built for Credit Rights Intelligence™
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-lg text-[#526174]">
            MLR turns scattered credit data into organized intelligence, report history, usage tracking, and
            action-readiness workflows.
          </p>
        </FadeIn>

        <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <StaggerItem key={f.title}>
              <div className="h-full rounded-xl border border-[#D8DEE9] bg-[#F5F7FB] p-6">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[#2454FF]/10">
                  <f.icon className="h-4 w-4 text-[#2454FF]" />
                </div>
                <h3 className="text-sm font-bold text-[#0B1020]">{f.title}</h3>
                <ul className="mt-3 space-y-1.5">
                  {f.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-xs text-[#526174]">
                      <span className="text-[#12B981]">✓</span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  )
}
