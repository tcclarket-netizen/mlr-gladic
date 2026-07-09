import { User, AlertCircle, Users, Building2 } from "lucide-react"
import { FadeIn, Stagger, StaggerItem } from "./motion"

const audiences = [
  {
    icon: User,
    title: "Individual Consumers",
    description:
      "For users who want to understand credit-reporting issues, monitor opposition indicators, and generate structured reports every month.",
  },
  {
    icon: AlertCircle,
    title: "Active Disputes",
    description:
      "For consumers preparing documentation, reviewing reporting concerns, and organizing consumer-rights analysis.",
  },
  {
    icon: Users,
    title: "Consumer Advocates",
    description:
      "For professionals or advocates helping users organize credit-rights information and report outputs.",
  },
  {
    icon: Building2,
    title: "High-Volume Users",
    description:
      "For teams, professionals, and organizations that need recurring reporting capacity, premium dashboards, and support access.",
  },
]

export function MlrAudience() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <FadeIn className="mb-14 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-[#0B1020]">
            Built for People Who Need More Than Generic Credit Advice
          </h2>
        </FadeIn>

        <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {audiences.map((a) => (
            <StaggerItem key={a.title}>
              <div className="h-full rounded-xl border border-[#D8DEE9] bg-white p-6">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[#2454FF]/10">
                  <a.icon className="h-4 w-4 text-[#2454FF]" />
                </div>
                <h3 className="text-sm font-bold text-[#0B1020]">{a.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#526174]">{a.description}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  )
}
