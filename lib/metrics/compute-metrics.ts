import "server-only"
import type { BureauExtraction } from "@/lib/extraction/schema"
import type { CaseMetrics } from "@/types/credit-report"
import { EMPTY_METRICS } from "@/types/credit-report"
import type { Bureau } from "@/types/case"
import type { NormalizedTradelineInput } from "@/lib/normalization/normalize-tradelines"
import { buildExecutiveSnapshot } from "@/lib/metrics/executive-snapshot"

function parseInquiryDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null
  const d = new Date(dateStr)
  return Number.isNaN(d.getTime()) ? null : d
}

export function computeCaseMetrics(
  extractions: BureauExtraction[],
  tradelines: NormalizedTradelineInput[]
): CaseMetrics {
  if (extractions.length === 0) return { ...EMPTY_METRICS }

  const scores = extractions
    .map((e) => e.credit_score)
    .filter((s): s is number => s != null && s > 0)

  const utilizations = tradelines
    .map((t) => t.utilization_pct)
    .filter((u): u is number => u != null)

  const allInquiries = extractions.flatMap((e) =>
    e.inquiries.map((inq) => ({ ...inq, bureau: e.bureau }))
  )

  const twelveMonthsAgo = new Date()
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)

  const hardInquiries12 = allInquiries.filter((inq) => {
    if (inq.inquiry_type !== "hard") return false
    const d = parseInquiryDate(inq.inquiry_date)
    return d ? d >= twelveMonthsAgo : false
  }).length

  const collections = extractions.flatMap((e) => e.collections)
  const publicRecords = extractions.flatMap((e) => e.public_records)

  const totalDebt = tradelines.reduce((sum, t) => sum + (t.balance ?? 0), 0)
  const negativeCount = tradelines.filter((t) => t.is_negative).length
  const collectionsBalance = collections.reduce((sum, c) => sum + (c.balance ?? 0), 0)

  const averageScore =
    scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null

  const averageUtilization =
    utilizations.length > 0
      ? Math.round((utilizations.reduce((a, b) => a + b, 0) / utilizations.length) * 10) / 10
      : null

  const inquiryRate =
    tradelines.length > 0
      ? Math.round((allInquiries.length / tradelines.length) * 100) / 100
      : null

  const base: CaseMetrics = {
    average_score: averageScore,
    average_utilization: averageUtilization,
    total_inquiries: allInquiries.length,
    hard_inquiries_12mo: hardInquiries12,
    inquiry_rate: inquiryRate,
    total_debt: Math.round(totalDebt * 100) / 100,
    negative_item_count: negativeCount,
    collections_count: collections.length,
    collections_balance: Math.round(collectionsBalance * 100) / 100,
    public_records_count: publicRecords.length,
    tradeline_count: tradelines.length,
    bureaus_analyzed: extractions.map((e) => e.bureau as Bureau),
  }

  return {
    ...base,
    executive_snapshot: buildExecutiveSnapshot(base, extractions, tradelines),
  }
}
