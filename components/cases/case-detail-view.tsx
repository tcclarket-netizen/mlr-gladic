"use client"

import Link from "next/link"
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Upload,
  FileText,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { BUREAUS, caseReferenceCode } from "@/lib/cases/constants"
import { caseStatusLabel, caseStatusStyles, formatCaseDate } from "@/lib/cases/display"
import type { CaseWithReports } from "@/types/case"

type CaseDetailViewProps = {
  caseData: CaseWithReports
}

export function CaseDetailView({ caseData }: CaseDetailViewProps) {
  const reference = caseReferenceCode(caseData.id)
  const reportsByBureau = Object.fromEntries(
    caseData.uploaded_reports.map((r) => [r.bureau, r])
  )
  const uploadCount = caseData.uploaded_reports.length

  const timeline = [
    {
      label: "Case created",
      date: formatCaseDate(caseData.created_at),
      done: true,
    },
    {
      label: "Reports uploaded",
      date: uploadCount > 0 ? `${uploadCount}/3 bureaus` : "Pending",
      done: uploadCount > 0,
    },
    {
      label: "Extraction complete",
      date: "Phase 2",
      done: caseData.uploaded_reports.some((r) => r.status === "processed"),
    },
    {
      label: "MY LEGAL REPORT™ generated",
      date: "Pending",
      done: false,
    },
    {
      label: "Dispute pack generated",
      date: "Pending",
      done: false,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6">
          <Link
            href="/cases"
            className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Cases
          </Link>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight text-foreground">
                  {caseData.client_name}
                </h1>
                <span
                  className={cn(
                    "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
                    caseStatusStyles[caseData.status]
                  )}
                >
                  {caseStatusLabel[caseData.status]}
                </span>
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                <span className="font-mono">{reference}</span> · {caseData.state} · Updated{" "}
                {formatCaseDate(caseData.updated_at)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/cases/${caseData.id}/upload`}>
                  <Upload className="mr-1.5 h-3.5 w-3.5" /> Upload Reports
                </Link>
              </Button>
              <Button size="sm" asChild disabled={uploadCount === 0}>
                <Link href="/reports">
                  <FileText className="mr-1.5 h-3.5 w-3.5" /> View Report
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="mb-6 grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Bureau Reports
            </h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {BUREAUS.map(({ key, name, color }) => {
                const report = reportsByBureau[key]
                const uploaded = Boolean(report)
                const processed = report?.status === "processed"
                const processing = report?.status === "processing"

                return (
                  <div key={key} className="rounded-lg border border-border bg-card p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className={cn("text-sm font-semibold", color)}>{name}</span>
                      {processed ? (
                        <CheckCircle className="h-4 w-4 text-status-success" />
                      ) : processing ? (
                        <Clock className="h-4 w-4 text-status-warning" />
                      ) : uploaded ? (
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                      ) : null}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {uploaded ? "Uploaded" : "Not uploaded"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {report?.file_name ?? "—"}
                    </p>
                    {processing && (
                      <p className="mt-1 text-[11px] text-status-warning">Processing</p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Case Timeline
            </h2>
            <div className="rounded-lg border border-border bg-card px-4 py-4">
              <ol className="space-y-3">
                {timeline.map((t, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div
                      className={cn(
                        "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                        t.done ? "bg-accent" : "bg-border"
                      )}
                    >
                      {t.done ? (
                        <CheckCircle className="h-3 w-3 text-accent-foreground" />
                      ) : (
                        <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p
                        className={cn(
                          "text-xs font-medium",
                          t.done ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        {t.label}
                      </p>
                      <p className="text-[11px] text-muted-foreground">{t.date}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        {uploadCount === 0 && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-border bg-card p-5">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-status-warning" />
            <div>
              <p className="text-sm font-medium text-foreground">No bureau reports yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Upload Experian, Equifax, and TransUnion PDFs to begin extraction and report
                generation.
              </p>
              <Button className="mt-3" size="sm" asChild>
                <Link href={`/cases/${caseData.id}/upload`}>Upload Reports</Link>
              </Button>
            </div>
          </div>
        )}

        <Tabs defaultValue="overview">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tradelines" disabled>
              Tradelines
            </TabsTrigger>
            <TabsTrigger value="legal-report" disabled>
              Legal Report
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-card p-5">
                <h3 className="text-sm font-semibold text-foreground">Bureau uploads</h3>
                <p className="mt-1 text-2xl font-semibold">{uploadCount}/3</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {uploadCount === 3
                    ? "All bureaus uploaded"
                    : "Upload remaining bureau PDFs"}
                </p>
                <Link
                  href={`/cases/${caseData.id}/upload`}
                  className="mt-3 inline-flex text-xs text-accent hover:underline"
                >
                  Manage uploads →
                </Link>
              </div>
              <div className="rounded-lg border border-border bg-card p-5">
                <h3 className="text-sm font-semibold text-foreground">Case notes</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {caseData.notes?.trim() || "No notes added."}
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <p className="mt-8 text-[11px] leading-relaxed text-muted-foreground">
          TurnKey Credit is not a law firm. All documents are for educational and procedural
          self-help purposes only.
        </p>
      </div>
    </div>
  )
}
