import type { CaseMetrics, OppositionReportMetrics } from "@/types/credit-report"
import type { Bureau } from "@/types/case"
import {
  OPPOSITION_NOT_FOUND,
  type OppositionBureauName,
  type OppositionIdentityEntry,
  type OppositionMetricValue,
  type OcuCalculationMethod,
  type SuccessClassification,
} from "@/types/opposition-report"

const BUREAU_ORDER: OppositionBureauName[] = ["Experian", "Equifax", "TransUnion"]

const BUREAU_KEY_TO_NAME: Record<string, OppositionBureauName> = {
  experian: "Experian",
  equifax: "Equifax",
  transunion: "TransUnion",
}

const EMPTY_COMPLETENESS = {
  oasCompletenessWarning: false,
  ocuCompletenessWarning: false,
  ospCompletenessWarning: false,
  oipCompletenessWarning: false,
}

const EMPTY_RISK = {
  hasNegativeActivity: false,
  negativeAccountCount: 0,
  latePaymentAccountCount: 0,
  collectionAccountCount: 0,
  chargeOffAccountCount: 0,
  negativeClosedAccountCount: 0,
}

const EMPTY_AUDIT: OppositionReportMetrics["calculationAudit"] = {
  oasMethod: "",
  ocuMethod: "",
  ospMethod: "",
  oipMethod: "",
  bureausUsed: { oas: [], ocu: [], osp: [], oip: [] },
}

function classifySuccessRating(rating: number): SuccessClassification {
  if (rating >= 95) return "Elite"
  if (rating >= 85) return "Strong"
  if (rating >= 75) return "Moderate"
  return "Needs Improvement"
}

function toMetricValue(value: unknown): OppositionMetricValue {
  if (typeof value === "number" && !Number.isNaN(value)) return value
  return OPPOSITION_NOT_FOUND
}

function mapBureauSources(
  byBureau: Record<string, number | null | undefined> | undefined
): Partial<Record<OppositionBureauName, number>> {
  if (!byBureau) return {}
  const out: Partial<Record<OppositionBureauName, number>> = {}
  for (const [key, value] of Object.entries(byBureau)) {
    const name = BUREAU_KEY_TO_NAME[key.toLowerCase()]
    if (name && typeof value === "number" && !Number.isNaN(value)) {
      out[name] = value
    }
  }
  return out
}

function isIdentityEntry(value: unknown): value is OppositionIdentityEntry {
  if (!value || typeof value !== "object") return false
  const e = value as OppositionIdentityEntry
  return (
    Array.isArray(e.originalValues) &&
    typeof e.normalizedValue === "string" &&
    Array.isArray(e.bureauSources) &&
    typeof e.requiresReview === "boolean"
  )
}

function baselineMessageFromDates(
  reportDates: OppositionReportMetrics["baselineValidation"]["reportDates"]
): string {
  const lines = BUREAU_ORDER.map((name) => {
    const date = reportDates[name]
    return date
      ? `${name} Report Date: ${date}`
      : `${name} Report Date: ${OPPOSITION_NOT_FOUND}`
  })
  return `${lines.join(" · ")}. One or more bureau report dates were not found.`
}

/** Coerce DB JSON (new or legacy opposition_report) into a safe display shape. */
export function normalizeStoredOppositionReport(raw: unknown): OppositionReportMetrics | null {
  if (!raw || typeof raw !== "object") return null

  const record = raw as Record<string, unknown>

  if ("metrics" in record && record.metrics && typeof record.metrics === "object") {
    return fillNewFormatDefaults(record as OppositionReportMetrics)
  }

  if ("oas" in record || "oas_by_bureau" in record) {
    return migrateLegacyOppositionReport(record)
  }

  return null
}

function fillNewFormatDefaults(report: OppositionReportMetrics): OppositionReportMetrics {
  const identity = report.identityReview ?? {
    addresses: [] as OppositionIdentityEntry[],
    employers: [] as OppositionIdentityEntry[],
  }

  const reportDates = report.baselineValidation?.reportDates ?? {}
  const baselineValidation = report.baselineValidation ?? {
    baselineWarning: true,
    reportDates,
    message: baselineMessageFromDates(reportDates),
  }

  return {
    reportName: report.reportName ?? "The Opposition Report™",
    calculatedAt: report.calculatedAt ?? "",
    baselineValidation,
    bureaus: report.bureaus ?? [],
    metrics: report.metrics ?? {
      oas: OPPOSITION_NOT_FOUND,
      ocu: OPPOSITION_NOT_FOUND,
      osp: OPPOSITION_NOT_FOUND,
      oip: OPPOSITION_NOT_FOUND,
      riskDeduction: 0,
      successRating: 100,
      successClassification: "Elite",
    },
    sourceBreakdown: report.sourceBreakdown ?? {
      oasSources: {},
      ocuSources: {},
      ospSources: {},
      inquirySources: {},
    },
    completenessWarnings: report.completenessWarnings ?? EMPTY_COMPLETENESS,
    identityReview: {
      addresses: Array.isArray(identity.addresses)
        ? identity.addresses.filter(isIdentityEntry)
        : [],
      employers: Array.isArray(identity.employers)
        ? identity.employers.filter(isIdentityEntry)
        : [],
    },
    riskExposure: report.riskExposure ?? EMPTY_RISK,
    primeBandQualification: report.primeBandQualification ?? {
      status: "Unable To Determine",
      currentOAS: OPPOSITION_NOT_FOUND,
      requiredOAS: 745,
    },
    ocuCalculationMethod:
      report.ocuCalculationMethod ?? ("Bureau Reported Utilization" as OcuCalculationMethod),
    ocuCalculationNote: report.ocuCalculationNote,
    calculationAudit: report.calculationAudit ?? EMPTY_AUDIT,
  }
}

type LegacyIdentityFlag = { label?: string; requiresReview?: boolean }

function migrateLegacyOppositionReport(
  legacy: Record<string, unknown>
): OppositionReportMetrics {
  const riskDeduction =
    typeof legacy.ore_deduction_pct === "number" ? legacy.ore_deduction_pct : 0
  const successRating =
    typeof legacy.osr === "number" ? legacy.osr : Math.max(0, 100 - riskDeduction)

  const oas = legacy.oas
  const primeStatus =
    typeof oas === "number"
      ? oas >= 745
        ? "Prime Qualified"
        : "Not Prime Qualified"
      : "Unable To Determine"

  const identityFlags = Array.isArray(legacy.identity_flags)
    ? (legacy.identity_flags as LegacyIdentityFlag[])
    : []

  const addressEntries: OppositionIdentityEntry[] = identityFlags
    .filter((f) => f.label)
    .map((f) => ({
      originalValues: [f.label!],
      normalizedValue: f.label!,
      bureauSources: [],
      requiresReview: Boolean(f.requiresReview),
    }))

  const reportDates: OppositionReportMetrics["baselineValidation"]["reportDates"] = {}

  return {
    reportName: "The Opposition Report™",
    calculatedAt: "",
    baselineValidation: {
      baselineWarning: true,
      reportDates,
      message: baselineMessageFromDates(reportDates),
    },
    bureaus: [],
    metrics: {
      oas: toMetricValue(legacy.oas),
      ocu: toMetricValue(legacy.ocu),
      osp: toMetricValue(legacy.osp),
      oip: toMetricValue(legacy.oip),
      riskDeduction,
      successRating,
      successClassification: classifySuccessRating(successRating),
    },
    sourceBreakdown: {
      oasSources: mapBureauSources(
        legacy.oas_by_bureau as Record<Bureau, number | null> | undefined
      ),
      ocuSources: mapBureauSources(
        legacy.ocu_by_bureau as Record<Bureau, number | null> | undefined
      ),
      ospSources: mapBureauSources(
        legacy.osp_by_bureau as Record<Bureau, number | null> | undefined
      ),
      inquirySources: {},
    },
    completenessWarnings: {
      oasCompletenessWarning: Array.isArray(legacy.missing_bureaus) && legacy.missing_bureaus.length > 0,
      ocuCompletenessWarning: false,
      ospCompletenessWarning: false,
      oipCompletenessWarning: false,
    },
    identityReview: {
      addresses: addressEntries,
      employers: [],
    },
    riskExposure: {
      hasNegativeActivity: (legacy.ore_negative_count as number) > 0,
      negativeAccountCount:
        typeof legacy.ore_negative_count === "number" ? legacy.ore_negative_count : 0,
      latePaymentAccountCount: 0,
      collectionAccountCount: 0,
      chargeOffAccountCount: 0,
      negativeClosedAccountCount: 0,
    },
    primeBandQualification: {
      status: primeStatus as OppositionReportMetrics["primeBandQualification"]["status"],
      currentOAS: typeof oas === "number" ? oas : OPPOSITION_NOT_FOUND,
      requiredOAS: 745,
    },
    ocuCalculationMethod: "Bureau Reported Utilization",
    calculationAudit: EMPTY_AUDIT,
  }
}

export function deriveOppositionReport(metrics: CaseMetrics): OppositionReportMetrics | null {
  return normalizeStoredOppositionReport(metrics.opposition_report)
}

export function formatOppositionMetric(
  value: OppositionMetricValue | null | undefined,
  opts?: { suffix?: string; decimals?: number; currency?: boolean }
): string {
  if (value == null || value === OPPOSITION_NOT_FOUND) return OPPOSITION_NOT_FOUND
  if (opts?.currency) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value)
  }
  const { suffix = "", decimals } = opts ?? {}
  const n = decimals != null ? value.toFixed(decimals) : String(value)
  return `${n}${suffix}`
}

export function formatSourceLine(
  sources: Partial<Record<OppositionBureauName, number>> | undefined,
  format: (n: number) => string = (n) => String(n)
): string {
  return BUREAU_ORDER.map((name) => {
    const v = sources?.[name]
    const short = name === "Experian" ? "EX" : name === "Equifax" ? "EQ" : "TU"
    return `${short} ${v != null ? format(v) : "—"}`
  }).join(" · ")
}

export function hasCompletenessWarning(report: OppositionReportMetrics): boolean {
  const w = report.completenessWarnings ?? EMPTY_COMPLETENESS
  return (
    w.oasCompletenessWarning ||
    w.ocuCompletenessWarning ||
    w.ospCompletenessWarning ||
    w.oipCompletenessWarning ||
    Boolean(report.baselineValidation?.baselineWarning)
  )
}
