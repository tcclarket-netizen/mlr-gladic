import "server-only"
import type { BureauExtraction } from "@/lib/extraction/schema"
import {
  OPPOSITION_NOT_FOUND,
  type OcuCalculationMethod,
  type OppositionBureauName,
  type OppositionMetricValue,
  type OppositionReportMetrics,
  type SuccessClassification,
} from "@/types/opposition-report"
import { normalizeBureauExtractions } from "@/lib/metrics/opposition/normalize-bureau-data"
import { buildIdentityReview } from "@/lib/metrics/opposition/identity-review"
import { calculateRiskExposure } from "@/lib/metrics/opposition/risk-exposure"
import { buildCalculationAudit } from "@/lib/metrics/opposition/calculation-audit"
import {
  computeDerivedActiveRevolvingUtilization,
  resolveActiveRevolvingLimitTotal,
} from "@/lib/metrics/opposition/revolving-capacity"

const ALL_BUREAU_NAMES: OppositionBureauName[] = ["Experian", "Equifax", "TransUnion"]
const BASELINE_MAX_DAYS = 90
const PRIME_OAS = 745

const DERIVED_OCU_NOTE =
  "OCU calculated from active revolving account balances and limits because bureau summary utilization was unavailable or distorted by charged-off balances."

function parseReportDate(value?: string): Date | null {
  if (!value?.trim()) return null
  const d = new Date(value.trim())
  return Number.isNaN(d.getTime()) ? null : d
}

function formatBaselineDateLines(
  reportDates: OppositionReportMetrics["baselineValidation"]["reportDates"]
): string {
  return ALL_BUREAU_NAMES.map((name) => {
    const date = reportDates[name]
    return date
      ? `${name} Report Date: ${date}`
      : `${name} Report Date: ${OPPOSITION_NOT_FOUND}`
  }).join(" · ")
}

function buildBaselineValidation(bureaus: ReturnType<typeof normalizeBureauExtractions>) {
  const reportDates: OppositionReportMetrics["baselineValidation"]["reportDates"] = {}

  for (const b of bureaus) {
    if (b.reportDate) reportDates[b.bureau] = b.reportDate
  }

  const dateLines = formatBaselineDateLines(reportDates)

  const allThreePresent =
    reportDates.Experian && reportDates.Equifax && reportDates.TransUnion

  if (!allThreePresent) {
    return {
      baselineWarning: true,
      reportDates,
      daysBetweenOldestAndNewest: undefined,
      message: `${dateLines}. One or more bureau report dates were not found.`,
    }
  }

  const parsed = ALL_BUREAU_NAMES.map((name) => parseReportDate(reportDates[name]!)).filter(
    (d): d is Date => d != null
  )

  const timestamps = parsed.map((d) => d.getTime())
  const min = Math.min(...timestamps)
  const max = Math.max(...timestamps)
  const daysBetween = Math.round((max - min) / (1000 * 60 * 60 * 24))
  const baselineWarning = daysBetween > BASELINE_MAX_DAYS

  return {
    baselineWarning,
    reportDates,
    daysBetweenOldestAndNewest: daysBetween,
    message: baselineWarning
      ? `${dateLines}. Bureau report dates span ${daysBetween} days (exceeds ${BASELINE_MAX_DAYS}-day baseline threshold).`
      : `${dateLines}. Bureau report dates are within ${BASELINE_MAX_DAYS} days (${daysBetween} day span).`,
  }
}

function resolveBureauReportedUtilization(
  bureau: ReturnType<typeof normalizeBureauExtractions>[number]
): number | undefined {
  if (
    bureau.bureauLevelUtilizationPercentage != null &&
    !Number.isNaN(bureau.bureauLevelUtilizationPercentage)
  ) {
    return Math.round(bureau.bureauLevelUtilizationPercentage * 10) / 10
  }

  const used = bureau.bureauLevelCreditUsed
  const limit = bureau.bureauLevelCreditLimit
  if (
    used != null &&
    limit != null &&
    !Number.isNaN(used) &&
    !Number.isNaN(limit) &&
    limit > 0
  ) {
    return Math.round((used / limit) * 1000) / 10
  }

  return undefined
}

function calculateOas(bureaus: ReturnType<typeof normalizeBureauExtractions>) {
  const oasSources: Partial<Record<OppositionBureauName, number>> = {}
  const used: OppositionBureauName[] = []
  const scores: number[] = []

  for (const b of bureaus) {
    if (b.creditScore != null) {
      oasSources[b.bureau] = b.creditScore
      used.push(b.bureau)
      scores.push(b.creditScore)
    }
  }

  if (scores.length === 0) {
    return {
      oas: OPPOSITION_NOT_FOUND as OppositionMetricValue,
      oasSources,
      oasCompletenessWarning: false,
      oasUsed: used,
      oasDivisor: 0,
    }
  }

  const divisor = scores.length === 3 ? 3 : scores.length
  const oas = Math.round(scores.reduce((a, b) => a + b, 0) / divisor)

  return {
    oas,
    oasSources,
    oasCompletenessWarning: scores.length < 3,
    oasUsed: used,
    oasDivisor: divisor,
  }
}

function calculateOcu(bureaus: ReturnType<typeof normalizeBureauExtractions>) {
  const ocuSources: Partial<Record<OppositionBureauName, number>> = {}
  const ocuUsed: OppositionBureauName[] = []
  const utils: number[] = []
  let anyDerived = false

  for (const b of bureaus) {
    const hasTradelines = (b.accounts?.length ?? 0) > 0
    const reported = resolveBureauReportedUtilization(b)
    let util: number | undefined
    let derived = false

    if (reported != null) {
      util = reported
    } else {
      util = computeDerivedActiveRevolvingUtilization(b.accounts ?? [], hasTradelines)
      derived = util != null
    }

    if (util != null) {
      ocuSources[b.bureau] = util
      ocuUsed.push(b.bureau)
      utils.push(util)
      if (derived) anyDerived = true
    }
  }

  if (utils.length === 0) {
    return {
      ocu: OPPOSITION_NOT_FOUND as OppositionMetricValue,
      ocuSources,
      ocuCompletenessWarning: false,
      ocuUsed,
      ocuCalculationMethod: "Bureau Reported Utilization" as OcuCalculationMethod,
      ocuCalculationNote: undefined,
    }
  }

  const ocu = Math.round((utils.reduce((a, b) => a + b, 0) / utils.length) * 10) / 10
  const ocuCalculationMethod: OcuCalculationMethod = anyDerived
    ? "Derived Active Revolving Utilization"
    : "Bureau Reported Utilization"

  return {
    ocu,
    ocuSources,
    ocuCompletenessWarning: ocuUsed.length < 3,
    ocuUsed,
    ocuCalculationMethod,
    ocuCalculationNote:
      ocuCalculationMethod === "Derived Active Revolving Utilization"
        ? DERIVED_OCU_NOTE
        : undefined,
  }
}

function calculateOsp(bureaus: ReturnType<typeof normalizeBureauExtractions>) {
  const ospSources: Partial<Record<OppositionBureauName, number>> = {}
  const ospUsed: OppositionBureauName[] = []
  const limits: number[] = []

  for (const b of bureaus) {
    const hasTradelines = (b.accounts ?? []).length > 0
    const { total } = resolveActiveRevolvingLimitTotal(b, hasTradelines)

    if (total == null || Number.isNaN(total)) continue

    ospSources[b.bureau] = total
    ospUsed.push(b.bureau)
    limits.push(total)
  }

  if (limits.length === 0) {
    return {
      osp: OPPOSITION_NOT_FOUND as OppositionMetricValue,
      ospSources,
      ospCompletenessWarning: false,
      ospUsed,
    }
  }

  const osp = Math.round(limits.reduce((a, b) => a + b, 0) / limits.length)

  return {
    osp,
    ospSources,
    ospCompletenessWarning: ospUsed.length < 3,
    ospUsed,
  }
}

function calculateOip(bureaus: ReturnType<typeof normalizeBureauExtractions>) {
  const inquirySources: Partial<Record<OppositionBureauName, number>> = {}
  const oipUsed: OppositionBureauName[] = []
  const counts: number[] = []
  let missingOnUploadedBureau = false

  for (const b of bureaus) {
    if (b.inquiries == null || Number.isNaN(b.inquiries)) {
      missingOnUploadedBureau = true
      continue
    }
    inquirySources[b.bureau] = b.inquiries
    oipUsed.push(b.bureau)
    counts.push(b.inquiries)
  }

  if (counts.length === 0) {
    return {
      oip: OPPOSITION_NOT_FOUND as OppositionMetricValue,
      inquirySources,
      oipCompletenessWarning: false,
      oipUsed,
    }
  }

  const totalInquiries = counts.reduce((a, b) => a + b, 0)
  const oip = Math.round((totalInquiries / 12) * 100) / 100

  return {
    oip,
    inquirySources,
    oipCompletenessWarning: missingOnUploadedBureau || bureaus.length < 3,
    oipUsed,
  }
}

function classifySuccessRating(rating: number): SuccessClassification {
  if (rating >= 95) return "Elite"
  if (rating >= 85) return "Strong"
  if (rating >= 75) return "Moderate"
  return "Needs Improvement"
}

export function calculateOppositionReport(
  extractions: BureauExtraction[]
): OppositionReportMetrics | null {
  if (extractions.length === 0) return null

  const bureaus = normalizeBureauExtractions(extractions)
  const uploadedBureaus = bureaus.map((b) => b.bureau)
  const baselineValidation = buildBaselineValidation(bureaus)

  const { oas, oasSources, oasCompletenessWarning, oasUsed, oasDivisor } = calculateOas(bureaus)
  const {
    ocu,
    ocuSources,
    ocuCompletenessWarning,
    ocuUsed,
    ocuCalculationMethod,
    ocuCalculationNote,
  } = calculateOcu(bureaus)
  const { osp, ospSources, ospCompletenessWarning, ospUsed } = calculateOsp(bureaus)
  const { oip, inquirySources, oipCompletenessWarning, oipUsed } = calculateOip(bureaus)

  const riskExposure = calculateRiskExposure(bureaus)
  const riskDeduction = riskExposure.hasNegativeActivity ? 15 : 0
  const successRating = 100 - riskDeduction
  const successClassification = classifySuccessRating(successRating)

  const identityReview = buildIdentityReview(bureaus)

  let primeStatus: OppositionReportMetrics["primeBandQualification"]["status"] =
    "Unable To Determine"
  if (typeof oas === "number") {
    primeStatus = oas >= PRIME_OAS ? "Prime Qualified" : "Not Prime Qualified"
  }

  const calculationAudit = buildCalculationAudit({
    uploadedBureaus,
    oasUsed,
    ocuUsed,
    ospUsed,
    oipUsed,
    ocuCalculationMethod,
    oasDivisor: oasDivisor || oasUsed.length,
  })

  return {
    reportName: "The Opposition Report™",
    calculatedAt: new Date().toISOString(),
    baselineValidation,
    bureaus,
    metrics: {
      oas,
      ocu,
      osp,
      oip,
      riskDeduction,
      successRating,
      successClassification,
    },
    sourceBreakdown: {
      oasSources,
      ocuSources,
      ospSources,
      inquirySources,
    },
    completenessWarnings: {
      oasCompletenessWarning,
      ocuCompletenessWarning,
      ospCompletenessWarning,
      oipCompletenessWarning,
    },
    identityReview,
    riskExposure,
    primeBandQualification: {
      status: primeStatus,
      currentOAS: typeof oas === "number" ? oas : OPPOSITION_NOT_FOUND,
      requiredOAS: PRIME_OAS,
    },
    ocuCalculationMethod,
    ocuCalculationNote,
    calculationAudit,
  }
}
