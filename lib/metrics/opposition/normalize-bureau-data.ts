import type { BureauExtraction } from "@/lib/extraction/schema"
import type {
  NormalizedBureauAccount,
  NormalizedBureauData,
  OppositionBureauName,
} from "@/types/opposition-report"
import { classifyAccountNegatives, parseOpenClosed } from "@/lib/metrics/opposition/account-classification"
import { computeActiveRevolvingLimitFromAccounts } from "@/lib/metrics/opposition/revolving-capacity"

const BUREAU_LABEL: Record<BureauExtraction["bureau"], OppositionBureauName> = {
  experian: "Experian",
  equifax: "Equifax",
  transunion: "TransUnion",
}

const CHARGE_OFF_HISTORY = /\bCO\b/
const LATE_HISTORY = /\b(30|60|90|120|150|180)\b/
const LATE_STATUS =
  /past\s*due|delinquent|\blate\b|30\s*days\s*past\s*due|60\s*days\s*past\s*due|90\s*days\s*past\s*due/i

function formatAddressLine(
  line?: string | null,
  city?: string | null,
  state?: string | null,
  postal?: string | null
): string | null {
  const parts = [
    line?.trim(),
    [city?.trim(), state?.trim()].filter(Boolean).join(", "),
    postal?.trim(),
  ].filter((p) => p && p.length > 0)
  if (parts.length === 0) return null
  return parts.join(" ")
}

function isValidScore(score: number | null | undefined): score is number {
  return typeof score === "number" && !Number.isNaN(score) && score >= 300 && score <= 850
}

function isValidNumber(n: number | null | undefined): n is number {
  return typeof n === "number" && !Number.isNaN(n) && n >= 0
}

function mapTradelineToAccount(
  tl: BureauExtraction["tradelines"][number]
): NormalizedBureauAccount {
  const openClosed = parseOpenClosed(tl.account_status ?? undefined)
  const balance = tl.balance ?? undefined
  const creditLimit = tl.credit_limit ?? undefined
  const creditUsagePercentage =
    balance != null && creditLimit != null && creditLimit > 0
      ? Math.round((balance / creditLimit) * 1000) / 10
      : undefined

  const base: NormalizedBureauAccount = {
    accountName: tl.creditor_name,
    accountType: tl.account_type ?? undefined,
    openClosed,
    status: tl.account_status ?? undefined,
    balance,
    creditLimit,
    creditUsagePercentage,
    pastDueAmount: tl.past_due_amount ?? undefined,
    paymentHistoryText: tl.payment_history_notes ?? undefined,
    accountNumberLast4: tl.account_number_last4 ?? undefined,
    dateOpened: tl.date_opened ?? undefined,
  }

  const flags = classifyAccountNegatives(base)

  if (tl.is_negative && !flags.isCollection && !flags.isChargeOff && !flags.isLatePaymentAccount) {
    const paymentHistory = base.paymentHistoryText ?? ""
    const status = base.status ?? ""
    if (CHARGE_OFF_HISTORY.test(paymentHistory) || /charge/i.test(status)) {
      return { ...base, ...flags, isChargeOff: true }
    }
    if (LATE_HISTORY.test(paymentHistory) || LATE_STATUS.test(status)) {
      return { ...base, ...flags, isLatePaymentAccount: true }
    }
    if (openClosed === "Closed") {
      return { ...base, ...flags, isNegativeClosedAccount: true }
    }
    return { ...base, ...flags, isLatePaymentAccount: true }
  }

  return { ...base, ...flags   }
}

function mapCollectionToAccount(
  c: BureauExtraction["collections"][number]
): NormalizedBureauAccount {
  return {
    accountName: c.creditor_name,
    accountType: "Collection",
    openClosed: "Closed",
    status: c.status ?? "Collection",
    balance: c.balance ?? undefined,
    isCollection: true,
    isChargeOff: false,
    isLatePaymentAccount: false,
    isNegativeClosedAccount: true,
  }
}

export function normalizeBureauExtractions(
  extractions: BureauExtraction[]
): NormalizedBureauData[] {
  return extractions.map((e) => {
    const tradelines = e.tradelines ?? []
    const accounts: NormalizedBureauAccount[] = [
      ...tradelines.map(mapTradelineToAccount),
      ...e.collections.map(mapCollectionToAccount),
    ]

    const hasTradelineData = tradelines.length > 0

    const computedLimit = computeActiveRevolvingLimitFromAccounts(accounts, hasTradelineData)
    let activeRevolvingCreditLimitTotal: number | undefined = computedLimit ?? undefined
    if (activeRevolvingCreditLimitTotal == null && isValidNumber(e.active_revolving_credit_limit_total)) {
      activeRevolvingCreditLimitTotal = Math.round(e.active_revolving_credit_limit_total)
    }

    const addresses = (e.addresses ?? [])
      .map((a) => {
        const line = formatAddressLine(a.line, a.city, a.state, a.postal_code)
        if (!line) return null
        if (a.status === "current") return `${line} [current]`
        if (a.status === "former") return `${line} [former]`
        return line
      })
      .filter((a): a is string => Boolean(a))

    const employers = (e.employers ?? [])
      .map((emp) => emp.name?.trim())
      .filter((name): name is string => Boolean(name && name !== "Unknown"))

    const inquiries =
      Array.isArray(e.inquiries) && e.inquiries.length >= 0 ? e.inquiries.length : undefined

    return {
      bureau: BUREAU_LABEL[e.bureau],
      reportDate: e.report_date?.trim() || undefined,
      creditScore: isValidScore(e.credit_score) ? e.credit_score : undefined,
      bureauLevelUtilizationPercentage: isValidNumber(e.bureau_level_utilization_pct)
        ? Math.round(e.bureau_level_utilization_pct * 10) / 10
        : undefined,
      bureauLevelCreditUsed: isValidNumber(e.bureau_level_credit_used)
        ? e.bureau_level_credit_used
        : undefined,
      bureauLevelCreditLimit: isValidNumber(e.bureau_level_credit_limit)
        ? e.bureau_level_credit_limit
        : undefined,
      activeRevolvingCreditLimitTotal,
      activeRevolvingCreditUsedTotal: isValidNumber(e.active_revolving_credit_used_total)
        ? e.active_revolving_credit_used_total
        : undefined,
      inquiries,
      addresses,
      employers,
      accounts,
    }
  })
}
