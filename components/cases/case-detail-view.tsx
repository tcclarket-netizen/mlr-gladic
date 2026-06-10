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
import { CaseMetricsGrid } from "@/components/cases/case-metrics-grid"
import { VerificationBadge } from "@/components/cases/verification-badge"
import type { CaseExtractionData } from "@/lib/cases/queries"
import { EMPTY_METRICS } from "@/types/credit-report"

type CaseDetailViewProps = CaseExtractionData

export function CaseDetailView({
  case: caseData,
  metrics,
  tradelines,
  inquiries,
  collections,
  legalReport,
}: CaseDetailViewProps) {
  const reference = caseReferenceCode(caseData.id)
  const reportsByBureau = Object.fromEntries(
    caseData.uploaded_reports.map((r) => [r.bureau, r])
  )
  const uploadCount = caseData.uploaded_reports.length
  const hasExtraction = tradelines.length > 0
  const hasLegalReport = legalReport?.status === "ready"
  const displayMetrics = hasExtraction ? metrics : EMPTY_METRICS

  const timeline = [
    { label: "Case created", date: formatCaseDate(caseData.created_at), done: true },
    {
      label: "Reports uploaded",
      date: uploadCount > 0 ? `${uploadCount}/3 bureaus` : "Pending",
      done: uploadCount > 0,
    },
    {
      label: "Extraction complete",
      date: hasExtraction ? formatCaseDate(caseData.updated_at) : "Pending",
      done: hasExtraction,
    },
    {
      label: "MY LEGAL REPORT™ generated",
      date: hasLegalReport
        ? formatCaseDate(legalReport!.generated_at)
        : legalReport?.status === "generating"
          ? "Generating…"
          : "Pending",
      done: hasLegalReport,
    },
    { label: "Dispute pack generated", date: "Pending", done: false },
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
              <Button size="sm" asChild disabled={!hasLegalReport}>
                <Link href={`/cases/${caseData.id}/report`}>
                  <FileText className="mr-1.5 h-3.5 w-3.5" /> MY LEGAL REPORT™
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
                const failed = report?.status === "failed"

                return (
                  <div key={key} className="rounded-lg border border-border bg-card p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className={cn("text-sm font-semibold", color)}>{name}</span>
                      {processed ? (
                        <CheckCircle className="h-4 w-4 text-status-success" />
                      ) : processing ? (
                        <Clock className="h-4 w-4 text-status-warning" />
                      ) : failed ? (
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      ) : null}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {uploaded ? (failed ? "Failed" : processed ? "Processed" : report?.status) : "Not uploaded"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {report?.file_name ?? "—"}
                    </p>
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
                Upload PDFs, then run Process Reports to extract data and generate MY LEGAL REPORT™.
              </p>
              <Button className="mt-3" size="sm" asChild>
                <Link href={`/cases/${caseData.id}/upload`}>Upload Reports</Link>
              </Button>
            </div>
          </div>
        )}

        {uploadCount > 0 && !hasExtraction && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-status-warning/30 bg-status-warning/5 p-5">
            <Clock className="mt-0.5 h-5 w-5 shrink-0 text-status-warning" />
            <div>
              <p className="text-sm font-medium text-foreground">Ready to process</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Run extraction from the upload page to parse tradelines and generate your legal report.
              </p>
              <Button className="mt-3" size="sm" asChild>
                <Link href={`/cases/${caseData.id}/upload`}>Process Reports</Link>
              </Button>
            </div>
          </div>
        )}

        {hasExtraction && (
          <div className="mb-6">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Opposition Report™ Analysis
            </h2>
            <CaseMetricsGrid metrics={displayMetrics} />
          </div>
        )}

        <Tabs defaultValue={hasExtraction ? "tradelines" : "overview"}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tradelines" disabled={!hasExtraction}>
              Tradelines ({tradelines.length})
            </TabsTrigger>
            <TabsTrigger value="inquiries" disabled={!hasExtraction}>
              Inquiries ({inquiries.length})
            </TabsTrigger>
            <TabsTrigger value="legal-report" disabled={!hasLegalReport}>
              Legal Report
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-card p-5">
                <h3 className="text-sm font-semibold text-foreground">Bureau uploads</h3>
                <p className="mt-1 text-2xl font-semibold">{uploadCount}/3</p>
                <Link
                  href={`/cases/${caseData.id}/upload`}
                  className="mt-3 inline-flex text-xs text-accent hover:underline"
                >
                  Manage uploads →
                </Link>
              </div>
              <div className="rounded-lg border border-border bg-card p-5">
                <h3 className="text-sm font-semibold text-foreground">MY LEGAL REPORT™</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {hasLegalReport ? "Ready to view and download" : "Run processing to generate"}
                </p>
                {hasLegalReport && (
                  <Link
                    href={`/cases/${caseData.id}/report`}
                    className="mt-3 inline-flex text-xs text-accent hover:underline"
                  >
                    View full report →
                  </Link>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tradelines">
            <div className="overflow-hidden rounded-lg border border-border bg-card">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary/30">
                      {[
                        "Creditor",
                        "Bureaus",
                        "Type",
                        "Status",
                        "Balance",
                        "Limit",
                        "Verification",
                      ].map((h) => (
                        <th
                          key={h}
                          className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tradelines.map((t) => (
                      <tr
                        key={t.id}
                        className="border-b border-border last:border-0 hover:bg-secondary/20"
                      >
                        <td className="whitespace-nowrap px-4 py-3 text-xs font-medium text-foreground">
                          {t.creditor_name}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs uppercase text-muted-foreground">
                          {t.bureaus.join(", ")}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                          {t.account_type ?? "—"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs">
                          <span
                            className={cn(
                              "inline-flex rounded border px-1.5 py-0.5 text-[11px] font-medium",
                              t.is_negative
                                ? "border-destructive/20 bg-destructive/8 text-destructive"
                                : "border-border bg-muted text-muted-foreground"
                            )}
                          >
                            {t.account_status ?? (t.is_negative ? "Negative" : "—")}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-foreground">
                          {t.balance != null ? `$${t.balance.toLocaleString()}` : "—"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                          {t.credit_limit != null ? `$${t.credit_limit.toLocaleString()}` : "—"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <VerificationBadge status={t.verification_status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="inquiries">
            <div className="space-y-2 rounded-lg border border-border bg-card p-4">
              {inquiries.length === 0 ? (
                <p className="text-sm text-muted-foreground">No inquiries extracted.</p>
              ) : (
                inquiries.map((inq) => (
                  <div
                    key={inq.id}
                    className="flex items-center justify-between rounded-md border border-border px-4 py-2.5"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium text-foreground">
                        {inq.creditor_name}
                      </span>
                      <span className="text-xs uppercase text-muted-foreground">{inq.bureau}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "text-xs font-medium",
                          inq.inquiry_type === "hard" ? "text-destructive" : "text-muted-foreground"
                        )}
                      >
                        {inq.inquiry_type}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {inq.inquiry_date ?? "—"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
            {collections.length > 0 && (
              <div className="mt-4 rounded-lg border border-border bg-card p-4">
                <h3 className="mb-2 text-sm font-semibold text-foreground">Collections</h3>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  {collections.map((c) => (
                    <li key={c.id}>
                      {c.creditor_name} ({c.bureau}) — $
                      {c.balance?.toLocaleString() ?? "0"} — {c.status ?? "unknown"}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </TabsContent>

          <TabsContent value="legal-report">
            {legalReport?.content?.sections ? (
              <div className="space-y-4">
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  {legalReport.content.disclaimer}
                </p>
                {legalReport.content.sections.slice(0, 2).map((s) => (
                  <div key={s.id} className="rounded-lg border border-border bg-card p-5">
                    <h3 className="text-sm font-semibold text-foreground">{s.title}</h3>
                    <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">
                      {s.body}
                    </p>
                  </div>
                ))}
                <Button asChild>
                  <Link href={`/cases/${caseData.id}/report`}>View Full Report</Link>
                </Button>
              </div>
            ) : null}
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
