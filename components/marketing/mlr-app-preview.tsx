"use client"

import { useState } from "react"
import { CheckCircle, Upload, FileText, BarChart3, CreditCard, HelpCircle } from "lucide-react"
import { MLR_COLORS } from "@/lib/marketing/mlr-brand"
import { FadeIn } from "./motion"

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "reports", label: "Reports", icon: FileText },
  { id: "uploads", label: "Uploads", icon: Upload },
  { id: "membership", label: "Membership", icon: CreditCard },
  { id: "support", label: "Support", icon: HelpCircle },
]

export function MlrAppPreview() {
  const [active, setActive] = useState("dashboard")

  return (
    <section id="product" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <FadeIn className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-[#0B1020]">
            The Reporting App Behind GLADIC AI™
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-lg text-[#526174]">
            MLR is where members upload credit documents, generate reports, review dashboards, and organize Credit
            Rights Intelligence™ outputs.
          </p>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="overflow-hidden rounded-2xl border border-[#D8DEE9] bg-[#F5F7FB] shadow-xl">
            <div className="flex overflow-x-auto border-b border-[#D8DEE9] bg-white">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActive(tab.id)}
                  className={`flex items-center gap-2 whitespace-nowrap px-5 py-3.5 text-sm font-medium transition-colors ${
                    active === tab.id
                      ? "border-b-2 text-[#2454FF]"
                      : "text-[#526174] hover:text-[#0B1020]"
                  }`}
                  style={active === tab.id ? { borderBottomColor: MLR_COLORS.rightsBlue } : undefined}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6">
              {active === "dashboard" && <DashboardPanel />}
              {active === "reports" && <ReportsPanel />}
              {active === "uploads" && <UploadsPanel />}
              {active === "membership" && <MembershipPanel />}
              {active === "support" && <SupportPanel />}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

function DashboardPanel() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded-xl border border-[#D8DEE9] bg-white p-5 md:col-span-2">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#526174]">Opposition Dashboard™</p>
        <div className="flex items-end gap-2 h-24">
          {[40, 65, 50, 80, 55, 70, 45].map((h, i) => (
            <div key={i} className="flex-1 rounded-t bg-[#5DE1FF]/30" style={{ height: `${h}%` }} />
          ))}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {["Credit Resistance", "Inquiry Pressure", "Approval Signals"].map((m) => (
            <div key={m} className="rounded-lg bg-[#F5F7FB] p-3">
              <p className="text-[10px] text-[#526174]">{m}</p>
              <p className="text-sm font-bold text-[#0B1020]">Active</p>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <StatCard label="Active Membership" value="Accuracy Member™" />
        <StatCard label="Reports Generated" value="4 this cycle" />
        <StatCard label="Reports Remaining" value="2" highlight />
      </div>
    </div>
  )
}

function ReportsPanel() {
  const reports = [
    { name: "Opposition Report™", status: "Complete", date: "Mar 12" },
    { name: "My Legal Report™", status: "Processing", date: "Mar 14" },
    { name: "My Self Report™", status: "Queued", date: "—" },
  ]
  return (
    <div className="space-y-3">
      {reports.map((r) => (
        <div key={r.name} className="flex items-center justify-between rounded-xl border border-[#D8DEE9] bg-white p-4">
          <div>
            <p className="text-sm font-semibold text-[#0B1020]">{r.name}</p>
            <p className="text-xs text-[#526174]">{r.date}</p>
          </div>
          <span
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${
              r.status === "Complete"
                ? "bg-[#12B981]/10 text-[#12B981]"
                : r.status === "Processing"
                  ? "bg-[#5DE1FF]/10 text-[#2454FF]"
                  : "bg-[#F5F7FB] text-[#526174]"
            }`}
          >
            {r.status}
          </span>
        </div>
      ))}
    </div>
  )
}

function UploadsPanel() {
  return (
    <div className="rounded-xl border-2 border-dashed border-[#D8DEE9] bg-white p-10 text-center">
      <Upload className="mx-auto mb-3 h-8 w-8 text-[#526174]" />
      <p className="text-sm font-semibold text-[#0B1020]">Secure Upload Area</p>
      <p className="mt-1 text-xs text-[#526174]">Drag and drop credit-reporting documents or browse files</p>
      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[#12B981]">
        <CheckCircle className="h-3.5 w-3.5" /> Encrypted document workflow
      </div>
    </div>
  )
}

function MembershipPanel() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-xl border border-[#D8DEE9] bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#526174]">Current Plan</p>
        <p className="mt-1 text-xl font-bold text-[#0B1020]">Accuracy Member™</p>
        <p className="mt-1 text-xs text-[#526174]">Renews Apr 1, 2026</p>
      </div>
      <div className="rounded-xl border border-[#D8DEE9] bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#526174]">Monthly Allowance</p>
        <div className="mt-2 space-y-2">
          {[
            { label: "Opposition Reports™", used: 2, total: 3 },
            { label: "My Legal Reports™", used: 1, total: 2 },
            { label: "My Self Reports™", used: 1, total: 1 },
          ].map((q) => (
            <div key={q.label}>
              <div className="flex justify-between text-xs text-[#526174]">
                <span>{q.label}</span>
                <span>
                  {q.used}/{q.total}
                </span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-[#F5F7FB]">
                <div
                  className="h-full rounded-full bg-[#2454FF]"
                  style={{ width: `${(q.used / q.total) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SupportPanel() {
  return (
    <div className="rounded-xl border border-[#D8DEE9] bg-white p-6">
      <p className="text-sm font-semibold text-[#0B1020]">Membership Support</p>
      <p className="mt-2 text-sm text-[#526174]">
        Access guided next-step education and priority support based on your membership level.
      </p>
      <div className="mt-4 flex items-center gap-2 text-xs text-[#12B981]">
        <CheckCircle className="h-3.5 w-3.5" /> Support available per plan
      </div>
    </div>
  )
}

function StatCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${highlight ? "border-[#2454FF]/30 bg-[#2454FF]/5" : "border-[#D8DEE9] bg-white"}`}>
      <p className="text-[10px] text-[#526174]">{label}</p>
      <p className={`text-sm font-bold ${highlight ? "text-[#2454FF]" : "text-[#0B1020]"}`}>{value}</p>
    </div>
  )
}
