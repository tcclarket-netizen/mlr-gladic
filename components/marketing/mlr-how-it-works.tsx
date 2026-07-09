import { UserPlus, Upload, Sparkles, LayoutDashboard } from "lucide-react"
import { FadeIn, Stagger, StaggerItem } from "./motion"

const steps = [
  {
    icon: UserPlus,
    step: "1",
    title: "Create Your Membership Account",
    description:
      "Choose a membership level and unlock monthly report access inside the MLR workspace.",
  },
  {
    icon: Upload,
    step: "2",
    title: "Upload Credit Documents Securely",
    description: "Upload supported credit-reporting files through a protected document workflow.",
  },
  {
    icon: Sparkles,
    step: "3",
    title: "Generate GLADIC AI™ Reports",
    description:
      "Generate Opposition Reports™, My Legal Reports™, and My Self Reports™ depending on your membership.",
  },
  {
    icon: LayoutDashboard,
    step: "4",
    title: "Review Dashboard Intelligence",
    description:
      "Track reports, review insights, organize records, and monitor your reporting cycle from one dashboard.",
  },
]

export function MlrHowItWorks() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <FadeIn className="mb-14 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-[#0B1020]">
            From Credit File to Rights Intelligence in Minutes
          </h2>
        </FadeIn>

        <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <StaggerItem key={s.step}>
              <div className="rounded-xl border border-[#D8DEE9] bg-white p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2454FF]/10">
                    <s.icon className="h-4 w-4 text-[#2454FF]" />
                  </div>
                  <span className="text-xs font-bold text-[#2454FF]">Step {s.step}</span>
                </div>
                <h3 className="text-sm font-bold text-[#0B1020]">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#526174]">{s.description}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        <FadeIn className="mt-10 text-center">
          <p className="text-sm font-medium tracking-wide text-[#526174]">
            Membership → Upload → Analyze → Generate → Dashboard
          </p>
        </FadeIn>
      </div>
    </section>
  )
}
