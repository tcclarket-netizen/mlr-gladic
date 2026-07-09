import type { BillingProduct } from "@/lib/billing/products"
import { BILLING_PRODUCT_LABELS } from "@/lib/billing/products"
import { isUnlimitedQuota } from "@/lib/billing/plans"
import type { ProductUsage, UsageSummary } from "@/lib/billing/usage-summary"
import type { CaseProductEntitlements } from "@/lib/billing/case-entitlements"

export type { UsageSummary, ProductUsage, CaseProductEntitlements }

export function formatProductQuotaLabel(product: BillingProduct, usage: ProductUsage) {
  const label = BILLING_PRODUCT_LABELS[product]
  if (usage.limit <= 0) {
    return "Not included on your plan"
  }
  if (isUnlimitedQuota(usage.limit)) {
    return `Unlimited ${label} unlocks`
  }
  if (usage.remaining <= 0) {
    return `0 of ${usage.limit} ${label} unlocks remaining this period`
  }
  return `${usage.remaining} of ${usage.limit} ${label} unlocks remaining this period`
}

export function formatUnlockConfirmMessage(product: BillingProduct, usage: ProductUsage) {
  const label = BILLING_PRODUCT_LABELS[product]
  if (isUnlimitedQuota(usage.limit)) {
    return {
      title: `Unlock ${label}?`,
      body: "Your admin plan includes unlimited unlocks. This will unlock the report for this case.",
      remainingAfter: Number.POSITIVE_INFINITY,
    }
  }
  const remainingAfter = Math.max(0, usage.remaining - 1)
  return {
    title: `Use 1 ${label} unlock?`,
    body:
      usage.remaining <= 0
        ? "You have no unlocks left this billing period."
        : `This will use 1 unlock. You will have ${remainingAfter} remaining after this action.`,
    remainingAfter,
  }
}
