export type CaseStatus = "draft" | "active" | "review" | "closed"

export type Bureau = "experian" | "equifax" | "transunion"

export type UploadedReportStatus = "uploaded" | "processing" | "processed" | "failed"

import type { CaseMetrics } from "@/types/credit-report"

export type Case = {
  id: string
  user_id: string
  client_name: string
  state: string
  notes: string | null
  status: CaseStatus
  metrics?: CaseMetrics | Record<string, unknown>
  created_at: string
  updated_at: string
}

export type UploadedReport = {
  id: string
  user_id: string
  case_id: string
  bureau: Bureau
  file_path: string
  file_name: string
  file_size: number | null
  mime_type: string
  status: UploadedReportStatus
  created_at: string
  updated_at: string
}

export type CaseEvent = {
  id: string
  user_id: string
  case_id: string
  event_type: string
  title: string
  metadata: Record<string, unknown>
  created_at: string
}

export type CaseWithReports = Case & {
  uploaded_reports: UploadedReport[]
  case_events: CaseEvent[]
}

export type CaseListItem = Case & {
  uploaded_reports: Pick<UploadedReport, "bureau" | "status">[]
}
