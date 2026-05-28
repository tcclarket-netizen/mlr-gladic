import "server-only"
import type { NormalizedTradelineInput } from "@/lib/normalization/normalize-tradelines"
import {
  AFFIRMATIVE_POSTURE_BLOCK,
  SUPPORTING_AUTHORITY_BLOCK,
} from "@/lib/report-generation/report-template"

function formatMoney(n: number | null) {
  if (n == null) return "not clearly disclosed"
  return `$${n.toLocaleString()}`
}

function tradelineStatusLabel(tl: NormalizedTradelineInput): string {
  const status = (tl.account_status ?? "").trim()
  if (status) return status
  if (tl.is_negative) return "Negative / derogatory notation"
  return "Open/Never late"
}

function liabilityLevel(tl: NormalizedTradelineInput): "Low Liability" | "High Verification Required" {
  if (
    tl.is_negative ||
    tl.verification_status === "proof_required" ||
    tl.verification_status === "suppression_candidate"
  ) {
    return "High Verification Required"
  }
  return "Low Liability"
}

function buildAffirmativeParagraph(tl: NormalizedTradelineInput): string {
  const creditor = tl.creditor_name.toUpperCase()
  const type = tl.account_type ?? "Account"
  const status = tradelineStatusLabel(tl)
  const balance = formatMoney(tl.balance)
  const limit = tl.credit_limit != null ? `limit ${formatMoney(tl.credit_limit)}` : "limit/original balance not clearly disclosed"
  const opened = tl.date_opened ? `opened ${tl.date_opened}` : "open date not clearly disclosed"

  if (tl.is_negative || tl.verification_status === "proof_required") {
    return `${creditor} (${type}) is reported with status '${status}' and balance ${balance}, ${limit}, ${opened}. The consumer demands date-specific account-level documentation identifying (a) the precise date of first delinquency (if any), (b) a complete payment/transaction ledger, (c) the basis for any charge-off/collection notation, and (d) the method used to verify each disputed data element. A conclusory 'verified' response without these objective records and without a verification description may be insufficient under reasonable investigation standards; rights are preserved to request deletion or correction where objective verifiability cannot be demonstrated.`
  }

  if (tl.verification_status === "suppression_candidate") {
    return `${creditor} (${type}) is reported as a collection-related account with status '${status}' and balance ${balance}, ${opened}. Because collection reporting is highly fact-specific, the consumer reserves and demands documentary verification sufficient to satisfy objective and readily verifiable accuracy. A 'verified' response without a description of the method of verification and without itemized support for the reported amount/date sequence may be procedurally deficient; pending adequate disclosure, the consumer preserves the right to demand correction or suppression consistent with lawful dispute handling.`
  }

  return `${creditor} (${type}) is reported with status '${status}' and balance ${balance}, ${limit}, ${opened}. This tradeline is treated as procedurally reviewable and monitored for ongoing accuracy; the consumer preserves the right to demand a description of verification methodology, underlying documentation, and timely correction if any data element later becomes inconsistent, incomplete, or not objectively verifiable. No allegation of fraud is made by default; the posture is record-building, documentary verification, and compliance enforcement under applicable federal and state standards.`
}

export function buildTradelineFindingBlock(tl: NormalizedTradelineInput): string {
  const type = tl.account_type ?? "Account"
  const liability = liabilityLevel(tl)

  return [
    `${tl.creditor_name.toUpperCase()} - ${type} (Individual)`,
    `Legal Finding (Affirmative):`,
    buildAffirmativeParagraph(tl),
    SUPPORTING_AUTHORITY_BLOCK,
    AFFIRMATIVE_POSTURE_BLOCK,
    `Status: Procedurally Reviewable | ${liability}`,
    "",
  ].join("\n")
}

export function buildAllTradelineFindings(tradelines: NormalizedTradelineInput[]): string {
  if (tradelines.length === 0) {
    return "No tradelines were extracted in the current upload set. Upload bureau PDFs and re-run processing to populate mandatory account-level findings."
  }

  return tradelines.map((tl) => buildTradelineFindingBlock(tl)).join("\n")
}
