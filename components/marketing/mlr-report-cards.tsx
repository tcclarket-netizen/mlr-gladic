import Link from "next/link"
import { BarChart3, Scale, FolderOpen } from "lucide-react"
import { MLR_COLORS } from "@/lib/marketing/mlr-brand"
import { FadeIn, Stagger, StaggerItem } from "./motion"

const reports = [
  {
    icon: BarChart3,
    name: "Opposition Report™",
    label: "Credit Resistance & Approval Readiness",
    phrase: "SEE IT. What is happening?",
    description:
      "The Opposition Report™ analyzes credit-reporting data and produces an intelligence dashboard focused on credit resistance, utilization pressure, inquiry pressure, reporting inconsistencies, and approval-readiness signals.",
    bullets: [
      "Opposition Average Score™",
      "Opposition Credit Usage™",
      "Opposition Spending Power™",
      "Opposition Inquiry Pressure™",
      "Opposition Risk Exposure™",
      "Bureau comparison insights",
      "Dashboard-ready credit intelligence",
      "Credit monitoring analysis depending on membership",
    ],
    cta: "Included in Memberships",
    accent: MLR_COLORS.signalCyan,
  },
  {
    icon: Scale,
    name: "My Legal Report™",
    label: "Consumer Rights Analysis",
    phrase: "UNDERSTAND IT. What rights and laws may apply?",
    description:
      "My Legal Report™ organizes credit-reporting concerns into a structured consumer-rights analysis using GLADIC AI's proprietary legal issue identification protocols and IRAC-based analytical framework.",
    bullets: [
      "Consumer-rights issue spotting",
      "Federal law summary",
      "Reporting concern analysis",
      "Potential administrative remedy mapping",
      "IRAC-style issue organization",
      "Evidence and documentation notes",
      "Research and self-help educational framing",
      "Dashboard-linked reporting history",
    ],
    cta: "Included in Select Memberships",
    accent: MLR_COLORS.rightsBlue,
  },
  {
    icon: FolderOpen,
    name: "My Self Report™",
    label: "Self-Help & Pre-Litigation Preparation",
    phrase: "DOCUMENT IT. ACT ON IT. What should I preserve, organize, and prepare?",
    description:
      "My Self Report™ helps users organize facts, documents, evidence, timelines, and self-help preparation materials for administrative, regulatory, contractual, or legal-action consideration.",
    bullets: [
      "Self-help preparation framework",
      "Evidence preservation list",
      "Timeline organization",
      "Documentation checklist",
      "Pre-litigation package framework",
      "Consumer Rights Roadmap",
      "Case preparation structure",
      "Action-readiness summary",
    ],
    cta: "Included in Advanced Memberships",
    accent: MLR_COLORS.casefileGold,
  },
]

export function MlrReportCards() {
  return (
    <section id="reports" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <FadeIn className="mb-14 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-[#0B1020]">
            Three Proprietary Reports. One Membership Workspace.
          </h2>
          <p className="mt-3 text-lg text-[#526174]">See the issue. Understand the rights. Build the record.</p>
        </FadeIn>

        <Stagger className="grid gap-6 lg:grid-cols-3">
          {reports.map((report) => (
            <StaggerItem key={report.name}>
              <div className="flex h-full flex-col rounded-xl border border-[#D8DEE9] bg-white p-7 shadow-sm transition-shadow hover:shadow-md">
                <div
                  className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${report.accent}15` }}
                >
                  <report.icon className="h-5 w-5" style={{ color: report.accent }} />
                </div>
                <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: report.accent }}>
                  {report.label}
                </p>
                <h3 className="mt-2 text-lg font-bold text-[#0B1020]">{report.name}</h3>
                <p className="mt-1 text-sm font-semibold text-[#2454FF]">{report.phrase}</p>
                <p className="mt-3 text-sm leading-relaxed text-[#526174]">{report.description}</p>
                <ul className="mt-4 flex-1 space-y-1.5">
                  {report.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-xs text-[#526174]">
                      <span className="mt-0.5 text-[#12B981]">✓</span>
                      {b}
                    </li>
                  ))}
                </ul>
                <Link
                  href="#memberships"
                  className="mt-6 inline-block rounded-lg border border-[#D8DEE9] px-4 py-2 text-center text-xs font-semibold text-[#2454FF] transition-colors hover:bg-[#2454FF]/5"
                >
                  {report.cta}
                </Link>
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        <FadeIn className="mt-10 text-center">
          <p className="text-sm font-medium tracking-wide text-[#526174]">
            SEE the problem → UNDERSTAND your rights → BUILD your record
          </p>
        </FadeIn>
      </div>
    </section>
  )
}
