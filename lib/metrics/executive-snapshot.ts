import "server-only"
import type { BureauExtraction } from "@/lib/extraction/schema"
import type { CaseMetrics, ExecutiveSnapshot } from "@/types/credit-report"
import type { Bureau } from "@/types/case"
import type { NormalizedTradelineInput } from "@/lib/normalization/normalize-tradelines"

const ALL_BUREAUS: Bureau[] = ["experian", "equifax", "transunion"]

const BUREAU_ABBR: Record<Bureau, string> = {
  experian: "EX",
  equifax: "EQ",
  transunion: "TU",
}

function creditTier(score: number | null): string {
  if (score == null) return "N/A"
  if (score >= 740) return "Good"
  if (score >= 670) return "Fair"
  if (score >= 580) return "Fair"
  return "Poor"
}

export function buildExecutiveSnapshot(
  metrics: CaseMetrics,
  extractions: BureauExtraction[],
  tradelines: NormalizedTradelineInput[]
): ExecutiveSnapshot {
  const analyzed = new Set(metrics.bureaus_analyzed)
  const scoresByBureau: ExecutiveSnapshot["scores_by_bureau"] = {
    experian: null,
    equifax: null,
    transunion: null,
  }
  const utilizationByBureau: ExecutiveSnapshot["utilization_by_bureau"] = {
    experian: "N/A",
    equifax: "N/A",
    transunion: "N/A",
  }

  for (const e of extractions) {
    scoresByBureau[e.bureau] = e.credit_score ?? null
    const bureauTls = tradelines.filter((t) => t.bureaus.includes(e.bureau))
    const utils = bureauTls
      .map((t) => t.utilization_pct)
      .filter((u): u is number => u != null)
    if (utils.length > 0) {
      const avg = utils.reduce((a, b) => a + b, 0) / utils.length
      utilizationByBureau[e.bureau] = `${avg.toFixed(2)}%`
    } else if (bureauTls.length > 0) {
      utilizationByBureau[e.bureau] = "computed N/A"
    }
  }

  const missing = ALL_BUREAUS.filter((b) => !analyzed.has(b))
  const missingNote =
    missing.length > 0
      ? ` (${missing.map((b) => b.charAt(0).toUpperCase() + b.slice(1)).join(" and ")} PDFs not available in current upload set)`
      : ""

  const hasNegative = metrics.negative_item_count > 0 || metrics.collections_count > 0
  const avgScore = metrics.average_score

  const primaryLimiters: string[] = []
  if (hasNegative) primaryLimiters.push("Negative items (derogatory/collection/charge-off notation)")
  if (metrics.tradeline_count < 3) primaryLimiters.push("Limited/truncated tradeline depth")
  if (metrics.hard_inquiries_12mo >= 3) primaryLimiters.push("Elevated recent hard inquiries")
  if (primaryLimiters.length === 0) primaryLimiters.push("No major limiters identified in current upload set")

  let fundingReadiness = "Conditional"
  if (avgScore != null && avgScore >= 700 && !hasNegative) {
    fundingReadiness = "Favorable (subject to underwriting; no guarantees)"
  } else if (avgScore != null && avgScore < 580 || metrics.collections_count > 0) {
    fundingReadiness =
      "Conditional (prime approvals less likely; secured/credit-builder outcomes more realistic until negatives age/are corrected)"
  }

  return {
    credit_tier: creditTier(avgScore),
    risk_profile: hasNegative
      ? "Moderate risk (derogatory/negative items present; review utilization and inquiry density)"
      : "Lower procedural risk profile in current upload set (continue record-building)",
    funding_readiness: fundingReadiness,
    primary_limiters: primaryLimiters,
    scores_by_bureau: scoresByBureau,
    utilization_by_bureau: utilizationByBureau,
    missing_bureaus_note: missingNote,
    bureau_abbreviations: BUREAU_ABBR,
  }
}

export {
  formatScoresLine,
  formatUtilizationLine,
  formatBureauCheckboxes,
} from "@/lib/metrics/metrics-display"
