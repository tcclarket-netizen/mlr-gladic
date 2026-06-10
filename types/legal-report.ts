import type { CaseMetrics } from "@/types/credit-report"

export type LegalReportCover = {
  title: string
  subtitle: string
  prepared_by: string
  classification: string
  client_capacity: string
  scope: string
  delivery_format: string
  record_type: string
}

export type LegalReportSection = {
  id: string
  /** Section label in headings/TOC (e.g. 3, "3A", 4). */
  number: number | string
  title: string
  body: string
}

export type LegalReportContent = {
  cover: LegalReportCover
  notice_of_limitation: string
  table_of_contents: string[]
  sections: LegalReportSection[]
  disclaimer: string
  non_representation: string
  metrics: CaseMetrics
  client_name: string
  case_state: string
  case_reference: string
  generated_at: string
}

export type GeneratedReport = {
  id: string
  user_id: string
  case_id: string
  report_type: string
  title: string
  content: LegalReportContent
  markdown: string | null
  status: "generating" | "ready" | "failed"
  generated_at: string
}
