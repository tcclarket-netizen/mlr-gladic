import type { NormalizedBureauAccount } from "@/types/opposition-report"

const CHARGE_OFF_STATUS_RE =
  /charge\s*off|charged\s*off|charged-off|written\s*off|written-off|charged off as bad debt/i
const CHARGE_OFF_HISTORY_RE = /\bCO\b/

const COLLECTION_RE =
  /collection|collections|placed for collection|collection account/i

const LATE_STATUS_RE =
  /past\s*due|delinquent|\blate\b|30\s*days\s*past\s*due|60\s*days\s*past\s*due|90\s*days\s*past\s*due|120\s*days\s*past\s*due/i
const LATE_HISTORY_RE = /\b(30|60|90|120|150|180)\b/

const INSTALLMENT_RE =
  /install|auto|mortgage|student|personal\s*loan|home\s*loan|lease/i

const REVOLVING_RE =
  /revolv|credit\s*card|charge\s*card|line\s*of\s*credit|\bloc\b|store\s*card|flex/i

const INACTIVE_STATUS_RE =
  /closed|charged\s*off|charge[- ]?off|collection|paid\s*in\s*full|transferred|sold|deceased/i

function accountTextBlob(account: NormalizedBureauAccount): string {
  return [
    account.accountName,
    account.accountType,
    account.status,
    account.paymentHistoryText,
  ]
    .filter(Boolean)
    .join(" ")
}

export function parseOpenClosed(status?: string): "Open" | "Closed" | string | undefined {
  if (!status) return undefined
  const s = status.toLowerCase()
  if (s.includes("closed") || s.includes("charged off") || s.includes("charge-off")) {
    return "Closed"
  }
  if (s.includes("open") && !s.includes("closed")) return "Open"
  return status
}

export function resolveOpenClosed(
  account: NormalizedBureauAccount
): "Open" | "Closed" | string | undefined {
  if (account.openClosed === "Open" || account.openClosed === "Closed") {
    return account.openClosed
  }
  return parseOpenClosed(account.status)
}

export function isRevolvingAccountType(accountType?: string): boolean {
  if (!accountType) return false
  const t = accountType.toLowerCase()
  if (INSTALLMENT_RE.test(t)) return false
  return REVOLVING_RE.test(t)
}

export function isClosedOrInactiveAccount(account: NormalizedBureauAccount): boolean {
  const openClosed = resolveOpenClosed(account)
  const status = (account.status ?? "").toLowerCase()
  const type = (account.accountType ?? "").toLowerCase()
  const blob = accountTextBlob(account).toLowerCase()

  if (openClosed === "Closed") return true
  if (INACTIVE_STATUS_RE.test(status)) return true
  if (/closed|charge|collection/i.test(type)) return true
  if (COLLECTION_RE.test(blob) || CHARGE_OFF_STATUS_RE.test(blob)) return true
  return false
}

/** Open revolving tradeline eligible for OSP capacity. */
export function isOpenRevolvingForOsp(account: NormalizedBureauAccount): boolean {
  if (isClosedOrInactiveAccount(account)) return false
  if (resolveOpenClosed(account) !== "Open") return false
  if (!isRevolvingAccountType(account.accountType)) return false
  if (COLLECTION_RE.test(accountTextBlob(account))) return false
  if (CHARGE_OFF_STATUS_RE.test(account.status ?? "")) return false
  return true
}

export function isExcludedFromRevolvingLimit(account: NormalizedBureauAccount): boolean {
  if (isClosedOrInactiveAccount(account)) return true
  const type = (account.accountType ?? "").toLowerCase()
  if (INSTALLMENT_RE.test(type)) return true
  if (COLLECTION_RE.test(accountTextBlob(account))) return true
  return false
}

export function classifyAccountNegatives(
  account: NormalizedBureauAccount
): Pick<
  NormalizedBureauAccount,
  "isCollection" | "isChargeOff" | "isLatePaymentAccount" | "isNegativeClosedAccount"
> {
  const status = account.status ?? ""
  const paymentHistory = account.paymentHistoryText ?? ""
  const blob = accountTextBlob(account)
  const openClosed = resolveOpenClosed(account)

  const isCollection =
    account.isCollection === true ||
    COLLECTION_RE.test(blob) ||
    (account.accountType ?? "").toLowerCase().includes("collection")

  const isChargeOff =
    account.isChargeOff === true ||
    CHARGE_OFF_STATUS_RE.test(status) ||
    CHARGE_OFF_STATUS_RE.test(blob) ||
    CHARGE_OFF_HISTORY_RE.test(paymentHistory)

  const isLatePaymentAccount =
    !isCollection &&
    !isChargeOff &&
    (account.isLatePaymentAccount === true ||
      LATE_HISTORY_RE.test(paymentHistory) ||
      LATE_STATUS_RE.test(status) ||
      (account.pastDueAmount != null && account.pastDueAmount > 0))

  const hasNegativeCondition = isCollection || isChargeOff || isLatePaymentAccount

  const isNegativeClosedAccount =
    openClosed === "Closed" && (hasNegativeCondition || CHARGE_OFF_STATUS_RE.test(status))

  return {
    isCollection,
    isChargeOff,
    isLatePaymentAccount,
    isNegativeClosedAccount,
  }
}

export function isNegativeAccount(account: NormalizedBureauAccount): boolean {
  const flags = classifyAccountNegatives(account)
  return (
    flags.isCollection ||
    flags.isChargeOff ||
    flags.isLatePaymentAccount ||
    flags.isNegativeClosedAccount
  )
}

export function accountDedupKey(account: NormalizedBureauAccount): string {
  const name = (account.accountName ?? "unknown")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 32)
  const last4 = account.accountNumberLast4 ?? ""
  if (last4) return `${name}-${last4}`
  const opened = (account.dateOpened ?? "").replace(/\D/g, "").slice(0, 8)
  const type = (account.accountType ?? "").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 16)
  return `${name}-${opened}-${type}`
}
