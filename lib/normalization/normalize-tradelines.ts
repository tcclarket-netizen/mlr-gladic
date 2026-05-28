import "server-only"
import type { BureauExtraction } from "@/lib/extraction/schema"
import type { VerificationStatus } from "@/types/tradeline"

export type NormalizedTradelineInput = {
  normalized_key: string
  creditor_name: string
  account_type: string | null
  account_status: string | null
  bureaus: string[]
  balance: number | null
  credit_limit: number | null
  utilization_pct: number | null
  date_opened: string | null
  is_negative: boolean
  verification_status: VerificationStatus
  dispute_basis: string | null
  raw_by_bureau: Record<string, unknown>
}

function normalizeCreditorKey(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 32)
}

function inferVerification(t: {
  is_negative: boolean
  account_status?: string | null
  creditor_name: string
}): { status: VerificationStatus; basis: string | null } {
  const status = (t.account_status ?? "").toLowerCase()
  const name = t.creditor_name.toLowerCase()

  if (name.includes("collection") || status.includes("collection")) {
    return {
      status: "suppression_candidate",
      basis: "Collection reporting — verification and method-of-verification review recommended.",
    }
  }
  if (t.is_negative || status.includes("charge") || status.includes("delinquent")) {
    return {
      status: "proof_required",
      basis: "Negative or derogatory status — procedural deficiency review; furnisher proof required.",
    }
  }
  if (status.includes("closed") || status.includes("paid")) {
    return {
      status: "method_needed",
      basis: "Closed/paid status — method-of-verification documentation may be required.",
    }
  }
  return { status: "review", basis: null }
}

export function normalizeTradelinesFromExtractions(
  extractions: BureauExtraction[]
): NormalizedTradelineInput[] {
  const map = new Map<string, NormalizedTradelineInput>()

  for (const extraction of extractions) {
    for (const tl of extraction.tradelines) {
      const last4 = tl.account_number_last4 ?? ""
      const key = `${normalizeCreditorKey(tl.creditor_name)}-${last4}`
      const balance = tl.balance ?? null
      const limit = tl.credit_limit ?? null
      const utilization =
        balance != null && limit != null && limit > 0
          ? Math.round((balance / limit) * 1000) / 10
          : null

      const { status, basis } = inferVerification({
        is_negative: tl.is_negative ?? false,
        account_status: tl.account_status,
        creditor_name: tl.creditor_name,
      })

      const existing = map.get(key)
      if (existing) {
        if (!existing.bureaus.includes(extraction.bureau)) {
          existing.bureaus.push(extraction.bureau)
        }
        existing.balance = Math.max(existing.balance ?? 0, balance ?? 0) || existing.balance
        existing.credit_limit = Math.max(existing.credit_limit ?? 0, limit ?? 0) || existing.credit_limit
        existing.is_negative = existing.is_negative || (tl.is_negative ?? false)
        existing.raw_by_bureau[extraction.bureau] = tl
        if (existing.is_negative && !existing.dispute_basis) {
          existing.verification_status = status
          existing.dispute_basis = basis
        }
      } else {
        map.set(key, {
          normalized_key: key,
          creditor_name: tl.creditor_name,
          account_type: tl.account_type ?? null,
          account_status: tl.account_status ?? null,
          bureaus: [extraction.bureau],
          balance,
          credit_limit: limit,
          utilization_pct: utilization,
          date_opened: tl.date_opened ?? null,
          is_negative: tl.is_negative ?? false,
          verification_status: status,
          dispute_basis: basis,
          raw_by_bureau: { [extraction.bureau]: tl },
        })
      }
    }
  }

  return Array.from(map.values())
}
