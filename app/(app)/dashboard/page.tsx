import Link from "next/link"
import {
  FolderOpen,
  FileText,
  Clock,
  Upload,
  Plus,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { getCurrentProfile } from "@/lib/supabase/profile"
import { getCasesForUser, getDashboardStats } from "@/lib/cases/queries"
import { CaseAnalyticsCharts } from "@/components/dashboard/case-analytics-charts"
import { CasesTableClient } from "@/components/cases/cases-table-client"

export default async function DashboardPage() {
  const [profile, stats, cases] = await Promise.all([
    getCurrentProfile(),
    getDashboardStats(),
    getCasesForUser(),
  ])

  const firstName =
    profile?.full_name?.trim().split(" ")[0] ||
    profile?.full_name ||
    "there"

  const metrics = [
    {
      label: "Active Cases",
      value: String(stats.activeCases),
      icon: FolderOpen,
      change: stats.activeCases === 0 ? "Create your first case" : "Excludes closed cases",
    },
    {
      label: "Reports Uploaded",
      value: String(stats.totalUploads),
      icon: Upload,
      change: `${stats.totalUploads} bureau PDFs on file`,
    },
    {
      label: "Processed Reports",
      value: String(stats.readyReports),
      icon: FileText,
      change: "Phase 2 extraction pipeline",
    },
    {
      label: "Pending Review",
      value: String(stats.statusCounts.review),
      icon: Clock,
      change: "Cases awaiting extraction",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Good morning, {firstName}
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Here&apos;s a summary of your GLADIC workspace.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/cases">
                <FolderOpen className="mr-1.5 h-3.5 w-3.5" /> View Cases
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/cases/new">
                <Plus className="mr-1.5 h-3.5 w-3.5" /> New Case
              </Link>
            </Button>
          </div>
        </div>

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

        <CaseAnalyticsCharts
          casesByDay={stats.casesByDay}
          statusCounts={stats.statusCounts}
        />

        <div className="rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold text-foreground">Recent Cases</h2>
            <Link
              href="/cases"
              className="flex items-center gap-1 text-xs text-accent hover:underline"
            >
              View all <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <CasesTableClient cases={cases} pageSize={5} />
        </div>

        <p className="mt-8 text-[11px] leading-relaxed text-muted-foreground">
          GLADIC AI™ is not a law firm and does not provide legal advice. All documents are for
          educational and procedural self-help purposes only.
        </p>
      </div>
    </div>
  )
}
