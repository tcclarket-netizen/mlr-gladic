import type { Bureau } from "@/types/case"

export type ExecutiveSnapshot = {
  credit_tier: string
  risk_profile: string
  funding_readiness: string
  primary_limiters: string[]
  scores_by_bureau: Record<Bureau, number | null>
  utilization_by_bureau: Record<Bureau, string>
  missing_bureaus_note: string
  bureau_abbreviations: Record<Bureau, string>
}

import type { OppositionReportMetrics } from "@/types/opposition-report"

export type { OppositionReportMetrics } from "@/types/opposition-report"

export type CaseMetrics = {
  average_score: number | null
  average_utilization: number | null
  total_inquiries: number
  hard_inquiries_12mo: number
  inquiry_rate: number | null
  total_debt: number
  negative_item_count: number
  collections_count: number
  collections_balance: number
  public_records_count: number
  tradeline_count: number
  bureaus_analyzed: Bureau[]
  executive_snapshot?: ExecutiveSnapshot
  opposition_report?: OppositionReportMetrics
}

export const EMPTY_METRICS: CaseMetrics = {
  average_score: null,
  average_utilization: null,
  total_inquiries: 0,
  hard_inquiries_12mo: 0,
  inquiry_rate: null,
  total_debt: 0,
  negative_item_count: 0,
  collections_count: 0,
  collections_balance: 0,
  public_records_count: 0,
  tradeline_count: 0,
  bureaus_analyzed: [],
}
