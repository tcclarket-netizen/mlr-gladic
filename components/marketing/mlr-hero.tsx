import Link from "next/link"
import Image from "next/image"
import { CheckCircle, BarChart3, FileText, Upload, LayoutDashboard } from "lucide-react"
import { MLR_BRAND, MLR_COLORS } from "@/lib/marketing/mlr-brand"
import { FadeIn } from "./motion"

export function MlrHero() {
  return (
    <section className="relative overflow-hidden bg-white pb-20 pt-12">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background: `radial-gradient(ellipse 70% 50% at 80% 20%, ${MLR_COLORS.rightsBlue}12, transparent)`,
        }}
      />
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <FadeIn>
            <div className="mb-6 flex flex-wrap gap-2">
              <span className="rounded-full border border-[#D8DEE9] bg-white px-3 py-1 text-[11px] font-medium text-[#526174] shadow-sm">
                {MLR_BRAND.productBadge}
              </span>
              <span className="rounded-full border border-[#5DE1FF]/40 bg-[#5DE1FF]/10 px-3 py-1 text-[11px] font-medium text-[#1a6b8a]">
                {MLR_BRAND.platform}
              </span>
            </div>

            <h1 className="text-balance text-4xl font-bold leading-tight tracking-tight text-[#0B1020] sm:text-5xl">
              Generate Credit Rights Intelligence Reports From One Secure Workspace
            </h1>

            <p className="mt-5 text-pretty text-lg leading-relaxed text-[#526174]">
              MLR is the GLADIC AI™ reporting application for Opposition Reports™, My Legal Reports™, and My Self
              Reports™ — available exclusively through membership access.
            </p>

            <p className="mt-4 text-sm leading-relaxed text-[#526174]/90">
              Upload. Analyze. Generate. Track. GLADIC AI™ turns credit data into structured rights intelligence,
              dashboard insights, and self-help documentation frameworks.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/sign-up"
                className="inline-flex items-center rounded-lg px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:brightness-110"
                style={{ backgroundColor: MLR_COLORS.rightsBlue }}
              >
                Start Membership
              </Link>
              <Link
                href="#memberships"
                className="inline-flex items-center rounded-lg border border-[#D8DEE9] bg-white px-6 py-3 text-sm font-medium text-[#0B1020] shadow-sm transition-colors hover:bg-[#F5F7FB]"
              >
                Compare Plans
              </Link>
            </div>

            <p className="mt-4 text-xs text-[#526174]">{MLR_BRAND.cancelNote}</p>

            <p className="mt-6 rounded-lg border border-[#D8DEE9] bg-white/80 px-4 py-3 text-xs leading-relaxed text-[#526174] shadow-sm">
              Informational, educational, research, and self-help reporting only. GLADIC AI™ is not a law firm.
            </p>
          </FadeIn>

          <FadeIn delay={0.15} className="relative">
            <HeroDashboardMock />
          </FadeIn>
        </div>
      </div>
    </section>
  )
}

function HeroDashboardMock() {
  return (
    <div className="rounded-xl border border-[#D8DEE9] bg-[#111A33] p-4 shadow-2xl shadow-[#0B1020]/15">
      <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="overflow-hidden rounded-md bg-white px-1.5 py-1 shadow-sm">
            <Image
              src="/logo/gladic-ai.png"
              alt="GLADIC AI™"
              width={28}
              height={22}
              className="h-[22px] w-auto object-contain"
            />
          </div>
          <div>
            <p className="text-xs font-semibold text-white">MLR Dashboard</p>
            <p className="text-[10px] text-white/40">Dashboard Active</p>
          </div>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-[#12B981]/15 px-2 py-0.5 text-[10px] font-medium text-[#12B981]">
          <CheckCircle className="h-3 w-3" /> Active Membership
        </span>
      </div>

      <div className="mb-3 grid grid-cols-3 gap-2">
        {[
          { label: "Reports Remaining", value: "4" },
          { label: "Used This Cycle", value: "2" },
          { label: "Monthly Allowance", value: "6" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border border-white/10 bg-white/5 p-2.5">
            <p className="text-lg font-bold text-white">{stat.value}</p>
            <p className="text-[9px] text-white/40">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mb-3 grid grid-cols-3 gap-2">
        {[
          { icon: BarChart3, title: "Opposition Report™", color: "#5DE1FF" },
          { icon: FileText, title: "My Legal Report™", color: "#2454FF" },
          { icon: LayoutDashboard, title: "My Self Report™", color: "#D6A13A" },
        ].map(({ icon: Icon, title, color }) => (
          <div key={title} className="rounded-lg border border-white/10 bg-white/5 p-2.5">
            <Icon className="mb-1 h-3.5 w-3.5" style={{ color }} />
            <p className="text-[9px] font-medium leading-tight text-white/80">{title}</p>
          </div>
        ))}
      </div>

      <div className="mb-3 rounded-lg border border-white/10 bg-white/5 p-3">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[10px] font-semibold text-white/70">Opposition Dashboard™</p>
          <span className="text-[9px] text-[#5DE1FF]">Preview</span>
        </div>
        <div className="flex gap-1">
          {[65, 42, 78, 55].map((h, i) => (
            <div key={i} className="flex-1 rounded-sm bg-[#5DE1FF]/20" style={{ height: `${h * 0.4}px` }} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2 rounded-lg border border-dashed border-white/15 bg-white/3 p-2.5">
          <Upload className="h-3.5 w-3.5 text-white/40" />
          <p className="text-[9px] text-white/50">Secure Upload</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-2.5">
          <p className="text-[9px] font-medium text-white/60">Report Queue</p>
          <p className="text-[10px] text-white/40">2 processing</p>
        </div>
      </div>
    </div>
  )
}
