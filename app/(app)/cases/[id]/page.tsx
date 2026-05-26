"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Upload,
  FileText,
  AlertCircle,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

const bureauStatus = [
  { name: "Experian", uploaded: true, processed: true, date: "May 23, 2026", color: "text-red-600" },
  { name: "Equifax", uploaded: true, processed: true, date: "May 23, 2026", color: "text-blue-600" },
  { name: "TransUnion", uploaded: true, processed: false, date: "Processing…", color: "text-blue-800" },
]

const timeline = [
  { label: "Case created", date: "May 20, 2026", done: true },
  { label: "Reports uploaded", date: "May 23, 2026", done: true },
  { label: "Extraction complete", date: "May 23, 2026", done: true },
  { label: "MY LEGAL REPORT™ generated", date: "May 24, 2026", done: true },
  { label: "Dispute pack generated", date: "Pending", done: false },
  { label: "Agency filings ready", date: "Pending", done: false },
]

const metrics = [
  { label: "Avg. Score", value: "581", sub: "Across 3 bureaus" },
  { label: "Avg. Utilization", value: "74%", sub: "High — review recommended" },
  { label: "Total Inquiries", value: "9", sub: "Last 24 months" },
  { label: "Negative Items", value: "5", sub: "Across all bureaus" },
  { label: "Collections", value: "2", sub: "Open balance: $3,240" },
]

const tradelines = [
  { creditor: "Capital One", bureau: "All 3", type: "Credit Card", status: "Negative", balance: "$2,100", limit: "$2,500", opened: "Jan 2020", verification: "Proof Required" },
  { creditor: "Chase Bank", bureau: "EXP, EFX", type: "Credit Card", status: "Current", balance: "$450", limit: "$5,000", opened: "Mar 2018", verification: "Verified" },
  { creditor: "Portfolio Recovery", bureau: "All 3", type: "Collection", status: "Collection", balance: "$1,140", limit: "—", opened: "Jun 2022", verification: "Suppression Candidate" },
  { creditor: "Wells Fargo", bureau: "TU", type: "Auto Loan", status: "Closed", balance: "$0", limit: "$14,000", opened: "Nov 2016", verification: "Method Needed" },
  { creditor: "Midland Funding", bureau: "EXP", type: "Collection", status: "Collection", balance: "$2,100", limit: "—", opened: "Sep 2023", verification: "Review" },
]

const verificationColors: Record<string, string> = {
  "Verified": "text-status-success bg-status-success/10 border-status-success/20",
  "Proof Required": "text-status-warning bg-status-warning/10 border-status-warning/20",
  "Method Needed": "text-status-pending bg-status-pending/10 border-status-pending/20",
  "Review": "text-muted-foreground bg-muted border-border",
  "Suppression Candidate": "text-destructive bg-destructive/10 border-destructive/20",
}

export default function CaseDetailPage() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link href="/dashboard" className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
          </Link>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight text-foreground">Jane Doe</h1>
                <span className="inline-flex items-center rounded-md border border-status-success/20 bg-status-success/10 px-2 py-0.5 text-xs font-medium text-status-success">
                  Active
                </span>
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                <span className="font-mono">CAS-1042</span> · California · Updated May 24, 2026
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/upload"><Upload className="mr-1.5 h-3.5 w-3.5" /> Upload Reports</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/reports"><FileText className="mr-1.5 h-3.5 w-3.5" /> View Report</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Bureau cards + timeline row */}
        <div className="mb-6 grid gap-4 lg:grid-cols-3">
          {/* Bureau status */}
          <div className="lg:col-span-2">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Bureau Reports</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {bureauStatus.map((b) => (
                <div key={b.name} className="rounded-lg border border-border bg-card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className={cn("text-sm font-semibold", b.color)}>{b.name}</span>
                    {b.processed ? (
                      <CheckCircle className="h-4 w-4 text-status-success" />
                    ) : (
                      <Clock className="h-4 w-4 text-status-warning" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {b.uploaded ? "Uploaded" : "Not uploaded"}
                  </p>
                  <p className="text-xs text-muted-foreground">{b.date}</p>
                  {!b.processed && (
                    <p className="mt-1 text-[11px] text-status-warning">Processing in progress</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Processing Timeline</h2>
            <div className="rounded-lg border border-border bg-card px-4 py-4">
              <ol className="space-y-3">
                {timeline.map((t, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className={cn("mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full", t.done ? "bg-accent" : "bg-border")}>
                      {t.done
                        ? <CheckCircle className="h-3 w-3 text-accent-foreground" />
                        : <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                      }
                    </div>
                    <div>
                      <p className={cn("text-xs font-medium", t.done ? "text-foreground" : "text-muted-foreground")}>{t.label}</p>
                      <p className="text-[11px] text-muted-foreground">{t.date}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="mb-6">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">TurnKey Metrics</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {metrics.map(({ label, value, sub }) => (
              <div key={label} className="rounded-lg border border-border bg-card p-4">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="mt-1 text-xl font-semibold tracking-tight text-foreground">{value}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tradelines">Tradelines</TabsTrigger>
            <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
            <TabsTrigger value="legal-report">Legal Report</TabsTrigger>
            <TabsTrigger value="disputes">Dispute Letters</TabsTrigger>
            <TabsTrigger value="agency">Agency Filings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { title: "Tradelines", count: 12, note: "5 flagged for review", href: "#", cta: "Review Tradelines" },
                { title: "Inquiries", count: 9, note: "3 hard inquiries in last 12 months", href: "#", cta: "View Inquiries" },
                { title: "MY LEGAL REPORT™", count: 1, note: "Generated — ready to download", href: "/reports", cta: "View Report" },
                { title: "Dispute Letters", count: 4, note: "2 CRA · 2 Furnisher", href: "/letters", cta: "View Letters" },
              ].map(({ title, count, note, href, cta }) => (
                <div key={title} className="rounded-lg border border-border bg-card p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                    <span className="text-2xl font-semibold text-foreground">{count}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{note}</p>
                  <Link href={href} className="mt-3 flex items-center gap-1 text-xs text-accent hover:underline">
                    {cta} <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tradelines">
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary/30">
                      {["Creditor", "Bureau", "Type", "Status", "Balance", "Limit", "Opened", "Verification", "Action"].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tradelines.map((t, i) => (
                      <tr key={i} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                        <td className="px-4 py-3 text-xs font-medium text-foreground whitespace-nowrap">{t.creditor}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{t.bureau}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{t.type}</td>
                        <td className="px-4 py-3 text-xs whitespace-nowrap">
                          <span className={cn(
                            "inline-flex items-center rounded border px-1.5 py-0.5 text-[11px] font-medium",
                            t.status === "Negative" || t.status === "Collection" ? "text-destructive bg-destructive/8 border-destructive/20" : "text-muted-foreground bg-muted border-border"
                          )}>
                            {t.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-foreground whitespace-nowrap">{t.balance}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{t.limit}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{t.opened}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={cn("inline-flex items-center rounded border px-1.5 py-0.5 text-[11px] font-medium", verificationColors[t.verification])}>
                            {t.verification}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-accent hover:underline cursor-pointer whitespace-nowrap">
                          Dispute
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="inquiries">
            <div className="rounded-lg border border-border bg-card p-6">
              <p className="text-sm text-muted-foreground">9 inquiries found across all bureaus. 3 hard inquiries in the last 12 months.</p>
              <div className="mt-4 space-y-2">
                {[
                  { creditor: "Capital One", bureau: "EXP", type: "Hard", date: "Mar 12, 2026" },
                  { creditor: "Chase Bank", bureau: "EFX", type: "Hard", date: "Jan 8, 2026" },
                  { creditor: "Synchrony Bank", bureau: "TU", type: "Hard", date: "Nov 15, 2025" },
                  { creditor: "Progressive Insurance", bureau: "EXP", type: "Soft", date: "Oct 2, 2025" },
                  { creditor: "Employers", bureau: "EFX", type: "Soft", date: "Sep 14, 2025" },
                ].map((inq, i) => (
                  <div key={i} className="flex items-center justify-between rounded-md border border-border px-4 py-2.5">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium text-foreground">{inq.creditor}</span>
                      <span className="text-xs text-muted-foreground">{inq.bureau}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={cn("text-xs font-medium", inq.type === "Hard" ? "text-destructive" : "text-muted-foreground")}>{inq.type}</span>
                      <span className="text-xs text-muted-foreground">{inq.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="legal-report">
            <div className="rounded-lg border border-border bg-card p-6 flex flex-col items-center text-center gap-4 py-12">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-status-success/10">
                <FileText className="h-6 w-6 text-status-success" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">MY LEGAL REPORT™ is ready</p>
                <p className="text-xs text-muted-foreground mt-1">Generated on May 24, 2026</p>
              </div>
              <Button asChild>
                <Link href="/reports">View Full Report</Link>
              </Button>
              <p className="text-[11px] text-muted-foreground max-w-sm">
                This report is educational and procedural only. TurnKey Credit does not provide legal advice.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="disputes">
            <div className="rounded-lg border border-border bg-card p-6 flex flex-col items-center text-center gap-4 py-12">
              <p className="text-sm font-semibold text-foreground">4 dispute letters generated</p>
              <Button asChild>
                <Link href="/letters">View Dispute Letters</Link>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="agency">
            <div className="rounded-lg border border-border bg-card p-6 flex flex-col items-center text-center gap-4 py-12">
              <AlertCircle className="h-8 w-8 text-status-warning" />
              <p className="text-sm font-semibold text-foreground">Agency filing packets not yet generated</p>
              <p className="text-xs text-muted-foreground">Complete the dispute pack first, then generate agency filings.</p>
              <Button asChild>
                <Link href="/agency-filings">Go to Agency Filings</Link>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
