import Link from "next/link"
import {
  FolderOpen,
  FileText,
  Clock,
  Upload,
  Plus,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { getCurrentProfile } from "@/lib/supabase/profile"
import { getDashboardStats } from "@/lib/cases/queries"
import { CaseAnalyticsCharts } from "@/components/dashboard/case-analytics-charts"
import {
  caseStatusLabel,
  caseStatusStyles,
  getCaseDisplayMeta,
  reportStatusStyles,
} from "@/lib/cases/display"
import { cn } from "@/lib/utils"

export default async function DashboardPage() {
  const [profile, stats] = await Promise.all([getCurrentProfile(), getDashboardStats()])

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
      value: String(
        stats.recentCases.filter((c) => c.status === "review").length
      ),
      icon: Clock,
      change: "Cases awaiting extraction",
    },
  ]

  const cases = stats.recentCases

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Good morning, {firstName}
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Here&apos;s a summary of your TurnKey workspace.
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

          {cases.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FolderOpen className="mb-3 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm font-medium text-foreground">No cases yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Create your first case to upload bureau reports.
              </p>
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
                    <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">
                      Case
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">
                      Client
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">
                      Bureaus
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">
                      Report
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">
                      Updated
                    </th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {cases.map((c) => {
                    const meta = getCaseDisplayMeta(c)
                    return (
                      <tr
                        key={c.id}
                        className="border-b border-border transition-colors last:border-0 hover:bg-secondary/30"
                      >
                        <td className="px-5 py-3.5">
                          <span className="font-mono text-xs text-muted-foreground">
                            {meta.reference}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="font-medium text-foreground">{c.client_name}</span>
                          <span className="ml-2 text-xs text-muted-foreground">{c.state}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
                              caseStatusStyles[c.status]
                            )}
                          >
                            {caseStatusLabel[c.status]}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={cn(
                              "text-xs font-medium",
                              meta.bureauCount === 3
                                ? "text-status-success"
                                : "text-status-warning"
                            )}
                          >
                            {meta.bureauCount}/3
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={cn(
                              "text-xs font-medium",
                              reportStatusStyles[meta.reportLabel]
                            )}
                          >
                            {meta.reportLabel}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-xs text-muted-foreground">{meta.updated}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <Link
                            href={`/cases/${c.id}`}
                            className="flex items-center gap-1 text-xs text-accent hover:underline"
                          >
                            Open <ArrowUpRight className="h-3 w-3" />
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="mt-8 text-[11px] leading-relaxed text-muted-foreground">
          TurnKey Credit is not a law firm and does not provide legal advice. All documents are for
          educational and procedural self-help purposes only.
        </p>
      </div>
    </div>
  )
}
