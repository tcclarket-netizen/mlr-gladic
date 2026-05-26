import Link from "next/link"
import { FolderOpen, Plus, ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getCasesForUser } from "@/lib/cases/queries"
import {
  caseStatusLabel,
  caseStatusStyles,
  getCaseDisplayMeta,
  reportStatusStyles,
} from "@/lib/cases/display"
import { cn } from "@/lib/utils"

export default async function CasesPage() {
  const cases = await getCasesForUser()

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Cases</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Manage client cases, bureau uploads, and generated documents.
            </p>
          </div>
          <Button size="sm" asChild>
            <Link href="/cases/new">
              <Plus className="mr-1.5 h-3.5 w-3.5" /> New Case
            </Link>
          </Button>
        </div>

        <div className="rounded-lg border border-border bg-card">
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
      </div>
    </div>
  )
}
