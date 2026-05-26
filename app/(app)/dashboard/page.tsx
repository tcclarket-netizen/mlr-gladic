import Link from "next/link"
import {
  FolderOpen,
  FileText,
  Clock,
  Download,
  Plus,
  Upload,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const metrics = [
  { label: "Active Cases", value: "4", icon: FolderOpen, change: "+1 this month" },
  { label: "Reports Generated", value: "11", icon: FileText, change: "+3 this week" },
  { label: "Pending Disputes", value: "7", icon: Clock, change: "2 need review" },
  { label: "Documents Ready", value: "18", icon: Download, change: "Ready to download" },
]

const cases = [
  {
    id: "CAS-1042",
    client: "Jane Doe",
    state: "California",
    status: "Active",
    bureaus: 3,
    report: "Generated",
    disputes: 4,
    updated: "May 24, 2026",
  },
  {
    id: "CAS-1041",
    client: "Marcus Williams",
    state: "Texas",
    status: "Active",
    bureaus: 2,
    report: "In Progress",
    disputes: 2,
    updated: "May 22, 2026",
  },
  {
    id: "CAS-1039",
    client: "Sandra Lee",
    state: "Florida",
    status: "Review",
    bureaus: 3,
    report: "Needs Review",
    disputes: 6,
    updated: "May 19, 2026",
  },
  {
    id: "CAS-1037",
    client: "David Okafor",
    state: "New York",
    status: "Closed",
    bureaus: 3,
    report: "Generated",
    disputes: 0,
    updated: "May 10, 2026",
  },
]

const statusVariant: Record<string, string> = {
  Active: "text-status-success bg-status-success/10 border-status-success/20",
  Review: "text-status-warning bg-status-warning/10 border-status-warning/20",
  Closed: "text-muted-foreground bg-muted border-border",
  "In Progress": "text-status-pending bg-status-pending/10 border-status-pending/20",
}

const reportVariant: Record<string, string> = {
  Generated: "text-status-success",
  "In Progress": "text-status-pending",
  "Needs Review": "text-status-warning",
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Good morning, Jane</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Here&apos;s a summary of your TurnKey workspace.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/upload">
                <Upload className="mr-1.5 h-3.5 w-3.5" /> Upload Reports
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/cases/new">
                <Plus className="mr-1.5 h-3.5 w-3.5" /> New Case
              </Link>
            </Button>
          </div>
        </div>

        {/* Metrics */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map(({ label, value, icon: Icon, change }) => (
            <div key={label} className="rounded-lg border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">{label}</span>
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-secondary">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{change}</p>
            </div>
          ))}
        </div>

        {/* Cases table */}
        <div className="rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Recent Cases</h2>
            <Link href="/cases" className="flex items-center gap-1 text-xs text-accent hover:underline">
              View all <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          {cases.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FolderOpen className="mb-3 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm font-medium text-foreground">No cases yet</p>
              <p className="mt-1 text-xs text-muted-foreground">Create your first case to begin.</p>
              <Button className="mt-4" size="sm" asChild>
                <Link href="/cases/new">
                  <Plus className="mr-1.5 h-3.5 w-3.5" /> Create First Case
                </Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Case</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Client</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Bureaus</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Report</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Disputes</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Updated</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {cases.map((c) => (
                    <tr key={c.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-xs text-muted-foreground">{c.id}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-medium text-foreground">{c.client}</span>
                        <span className="ml-2 text-xs text-muted-foreground">{c.state}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium", statusVariant[c.status])}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={cn("text-xs font-medium", c.bureaus === 3 ? "text-status-success" : "text-status-warning")}>
                          {c.bureaus}/3
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={cn("text-xs font-medium", reportVariant[c.report])}>
                          {c.report}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs text-foreground">{c.disputes}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs text-muted-foreground">{c.updated}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <Link href={`/cases/${c.id.toLowerCase()}`} className="flex items-center gap-1 text-xs text-accent hover:underline">
                          Open <ArrowUpRight className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <p className="mt-8 text-[11px] leading-relaxed text-muted-foreground">
          TurnKey Credit is not a law firm and does not provide legal advice. All documents are for educational and
          procedural self-help purposes only.
        </p>
      </div>
    </div>
  )
}
