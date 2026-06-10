import type { NormalizedBureauData } from "@/types/opposition-report"
import {
  accountDedupKey,
  classifyAccountNegatives,
  isNegativeAccount,
} from "@/lib/metrics/opposition/account-classification"

export type RiskExposureResult = {
  hasNegativeActivity: boolean
  negativeAccountCount: number
  latePaymentAccountCount: number
  collectionAccountCount: number
  chargeOffAccountCount: number
  negativeClosedAccountCount: number
}

type DedupedAccount = {
  isCollection: boolean
  isChargeOff: boolean
  isLate: boolean
  isNegativeClosed: boolean
}

function mergeEntry(prev: DedupedAccount | undefined, account: DedupedAccount): DedupedAccount {
  if (!prev) return account
  return {
    isCollection: prev.isCollection || account.isCollection,
    isChargeOff: prev.isChargeOff || account.isChargeOff,
    isLate: prev.isLate || account.isLate,
    isNegativeClosed: prev.isNegativeClosed || account.isNegativeClosed,
  }
}

export function calculateRiskExposure(bureaus: NormalizedBureauData[]): RiskExposureResult {
  const seen = new Map<string, DedupedAccount>()

  for (const bureau of bureaus) {
    for (const raw of bureau.accounts ?? []) {
      const flags = classifyAccountNegatives(raw)
      const account = { ...raw, ...flags }
      if (!isNegativeAccount(account)) continue

      const key = accountDedupKey(account)
      const entry: DedupedAccount = {
        isCollection: Boolean(flags.isCollection),
        isChargeOff: Boolean(flags.isChargeOff),
        isLate: Boolean(flags.isLatePaymentAccount),
        isNegativeClosed: Boolean(flags.isNegativeClosedAccount),
      }

      seen.set(key, mergeEntry(seen.get(key), entry))
    }
  }

  const negatives = [...seen.values()]

  return {
    hasNegativeActivity: negatives.length > 0,
    negativeAccountCount: negatives.length,
    latePaymentAccountCount: negatives.filter((v) => v.isLate).length,
    collectionAccountCount: negatives.filter((v) => v.isCollection).length,
    chargeOffAccountCount: negatives.filter((v) => v.isChargeOff).length,
    negativeClosedAccountCount: negatives.filter((v) => v.isNegativeClosed).length,
  }
}
