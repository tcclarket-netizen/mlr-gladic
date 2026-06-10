import type { NormalizedBureauAccount, NormalizedBureauData } from "@/types/opposition-report"
import { isOpenRevolvingForOsp } from "@/lib/metrics/opposition/account-classification"

function isValidNumber(n: number | null | undefined): n is number {
  return typeof n === "number" && !Number.isNaN(n) && n >= 0
}

/** Sum open revolving limits from tradelines only (strict active capacity). */
export function computeActiveRevolvingLimitFromAccounts(
  accounts: NormalizedBureauAccount[],
  hasTradelineData: boolean
): number | undefined {
  if (!hasTradelineData) return undefined

  let total = 0
  let included = false

  for (const account of accounts) {
    if (!isOpenRevolvingForOsp(account)) continue
    included = true
    if (isValidNumber(account.creditLimit)) {
      total += account.creditLimit
    }
  }

  if (included) return Math.round(total)
  return 0
}

/** Derived OCU from open revolving balances ÷ limits (excludes closed/charged-off). */
export function computeDerivedActiveRevolvingUtilization(
  accounts: NormalizedBureauAccount[],
  hasTradelineData: boolean
): number | undefined {
  if (!hasTradelineData) return undefined

  let used = 0
  let limit = 0

  for (const account of accounts) {
    if (!isOpenRevolvingForOsp(account)) continue
    if (isValidNumber(account.balance)) used += account.balance
    if (isValidNumber(account.creditLimit) && account.creditLimit > 0) {
      limit += account.creditLimit
    }
  }

  if (limit > 0) {
    return Math.round((used / limit) * 1000) / 10
  }

  return undefined
}

export function resolveActiveRevolvingLimitTotal(
  bureau: NormalizedBureauData,
  hasTradelineData: boolean
): { total: number | undefined; source: "account_calculation" | "extracted_summary" | "none" } {
  const computed = computeActiveRevolvingLimitFromAccounts(
    bureau.accounts ?? [],
    hasTradelineData
  )

  if (computed != null) {
    return { total: computed, source: "account_calculation" }
  }

  if (isValidNumber(bureau.activeRevolvingCreditLimitTotal)) {
    return {
      total: Math.round(bureau.activeRevolvingCreditLimitTotal),
      source: "extracted_summary",
    }
  }

  return { total: undefined, source: "none" }
}
