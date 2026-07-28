import type { BillingProduct } from "@/lib/billing/products"

export const PAY_PER_REPORT_CHARGE_PRODUCTS = ["opposition", "legal", "self"] as const
export type PayPerReportChargeProduct = (typeof PAY_PER_REPORT_CHARGE_PRODUCTS)[number]

export function isPayPerReportChargeProduct(
  product: BillingProduct
): product is PayPerReportChargeProduct {
  return (PAY_PER_REPORT_CHARGE_PRODUCTS as readonly BillingProduct[]).includes(product)
}

function parseCents(raw: string | undefined, fallback: number) {
  const val = Number.parseInt(raw ?? String(fallback), 10)
  if (!Number.isFinite(val) || val <= 0) return fallback
  return val
}

export function getPayPerReportAmountCents(product: PayPerReportChargeProduct) {
  if (product === "opposition") {
    return parseCents(process.env.STRIPE_PAY_PER_REPORT_OPPOSITION_AMOUNT_CENTS, 2499)
  }
  if (product === "legal") {
    return parseCents(process.env.STRIPE_PAY_PER_REPORT_LEGAL_AMOUNT_CENTS, 5999)
  }
  return parseCents(process.env.STRIPE_PAY_PER_REPORT_SELF_AMOUNT_CENTS, 14999)
}

export function getPayPerReportCurrency() {
  return (process.env.STRIPE_PAY_PER_REPORT_CURRENCY ?? "usd").toLowerCase()
}

export function formatPayPerReportAmount(cents: number, currency = "USD") {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  })
}

export function isPayPerReportPlan(planKey: string) {
  return planKey === "pay_per_report"
}

export function getPayPerReportPriceRangeLabel() {
  const amounts = PAY_PER_REPORT_CHARGE_PRODUCTS.map((p) => getPayPerReportAmountCents(p))
  const min = Math.min(...amounts)
  const max = Math.max(...amounts)
  if (min === max) return formatPayPerReportAmount(min)
  return `${formatPayPerReportAmount(min)}–${formatPayPerReportAmount(max)}`
}
