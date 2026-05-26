import { caseReferenceCode } from "@/lib/cases/constants"
import type { CaseListItem, CaseStatus, UploadedReportStatus } from "@/types/case"

export function formatCaseDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function countBureauUploads(reports: CaseListItem["uploaded_reports"]) {
  return reports?.length ?? 0
}

export function reportSummaryLabel(reports: CaseListItem["uploaded_reports"]) {
  const count = countBureauUploads(reports)
  if (count === 0) return "Not started"
  if (count < 3) return "In Progress"
  const allProcessed = reports.every((r) => r.status === "processed")
  if (allProcessed) return "Generated"
  const anyProcessing = reports.some(
    (r) => r.status === "processing" || r.status === "uploaded"
  )
  if (anyProcessing) return "In Progress"
  return "Needs Review"
}

export const caseStatusStyles: Record<CaseStatus, string> = {
  draft: "text-muted-foreground bg-muted border-border",
  active: "text-status-success bg-status-success/10 border-status-success/20",
  review: "text-status-warning bg-status-warning/10 border-status-warning/20",
  closed: "text-muted-foreground bg-muted border-border",
}

export const caseStatusLabel: Record<CaseStatus, string> = {
  draft: "Draft",
  active: "Active",
  review: "Review",
  closed: "Closed",
}

export const reportStatusStyles: Record<string, string> = {
  Generated: "text-status-success",
  "In Progress": "text-status-pending",
  "Needs Review": "text-status-warning",
  "Not started": "text-muted-foreground",
}

export function getCaseDisplayMeta(caseItem: CaseListItem) {
  return {
    reference: caseReferenceCode(caseItem.id),
    bureauCount: countBureauUploads(caseItem.uploaded_reports),
    reportLabel: reportSummaryLabel(caseItem.uploaded_reports),
    updated: formatCaseDate(caseItem.updated_at),
  }
}

export function bureauUploadStatus(
  reports: CaseListItem["uploaded_reports"],
  bureau: string
): UploadedReportStatus | null {
  return reports?.find((r) => r.bureau === bureau)?.status ?? null
}
