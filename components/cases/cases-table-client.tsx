"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { ArrowUpRight, FolderOpen, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  caseStatusLabel,
  caseStatusStyles,
  getCaseDisplayMeta,
  reportStatusStyles,
} from "@/lib/cases/display"
import { cn } from "@/lib/utils"
import type { CaseListItem, CaseStatus } from "@/types/case"

const STATUS_OPTIONS: Array<{ value: "all" | CaseStatus; label: string }> = [
  { value: "all", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "review", label: "Review" },
  { value: "closed", label: "Closed" },
]

type CasesTableClientProps = {
  cases: CaseListItem[]
  pageSize: number
}

export function CasesTableClient({ cases, pageSize }: CasesTableClientProps) {
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<"all" | CaseStatus>("all")
  const [page, setPage] = useState(1)

  const filteredCases = useMemo(() => {
    const q = query.trim().toLowerCase()
    return cases.filter((c) => {
      const statusOk = status === "all" || c.status === status
      const queryOk =
        q.length === 0 ||
        c.client_name.toLowerCase().includes(q) ||
        c.state.toLowerCase().includes(q)
      return statusOk && queryOk
    })
  }, [cases, query, status])

  const totalPages = Math.max(1, Math.ceil(filteredCases.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredCases.slice(start, start + pageSize)
  }, [filteredCases, currentPage, pageSize])

  const applyFilters = (nextQuery: string, nextStatus: "all" | CaseStatus) => {
    setQuery(nextQuery)
    setStatus(nextStatus)
    setPage(1)
  }

  return (
    <>
      <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => applyFilters(e.target.value, status)}
              placeholder="Search client or state"
              className="w-full rounded-md border border-input bg-background py-2 pl-8 pr-3 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <select
            value={status}
            onChange={(e) => applyFilters(query, e.target.value as "all" | CaseStatus)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <p className="text-xs text-muted-foreground">
          {filteredCases.length} case{filteredCases.length === 1 ? "" : "s"}
        </p>
      </div>

      {pageItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FolderOpen className="mb-3 h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm font-medium text-foreground">No matching cases</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Try a different search term or status filter.
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
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Case</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Client</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Bureaus</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Report</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Updated</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {pageItems.map((c) => {
                const meta = getCaseDisplayMeta(c)
                return (
                  <tr
                    key={c.id}
                    className="border-b border-border transition-colors last:border-0 hover:bg-secondary/30"
                  >
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs text-muted-foreground">{meta.reference}</span>
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
                          meta.bureauCount === 3 ? "text-status-success" : "text-status-warning"
                        )}
                      >
                        {meta.bureauCount}/3
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={cn("text-xs font-medium", reportStatusStyles[meta.reportLabel])}
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

      {filteredCases.length > 0 ? (
        <div className="flex items-center justify-between border-t border-border px-5 py-3">
          <p className="text-xs text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </>
  )
}
