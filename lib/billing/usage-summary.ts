import "server-only"
import type { SupabaseClient } from "@supabase/supabase-js"
import { getPlanQuotas, isUnlimitedQuota, type BillingPlanKey } from "@/lib/billing/plans"
import type { BillingProduct } from "@/lib/billing/products"
import type { UserBilling } from "@/lib/billing/types"
import {
  getPayPerReportAmountCents,
  isPayPerReportChargeProduct,
  isPayPerReportPlan,
} from "@/lib/billing/pay-per-report-pricing"

export type ProductUsage = {
  used: number
  limit: number
  remaining: number
  /** When set, each unlock charges this amount (pay-per-report plan). */
  payPerUnlockCents?: number | null
}

export type UsageSummary = {
  planKey: BillingPlanKey
  periodStart: string
  periodEnd: string | null
  opposition: ProductUsage
  legal: ProductUsage
  self: ProductUsage
}

type BillingPeriodInput = Pick<
  UserBilling,
  | "plan_key"
  | "current_period_start"
  | "current_period_end"
  | "stripe_customer_id"
  | "stripe_default_payment_method_id"
>

function monthWindowUtc(now = new Date()) {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0))
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0))
  return {
    startIso: start.toISOString(),
    endIso: end.toISOString(),
  }
}

export function getBillingPeriod(billing: BillingPeriodInput | null, now = new Date()) {
  if (billing?.current_period_start) {
    return {
      startIso: billing.current_period_start,
      endIso: billing.current_period_end ?? null,
    }
  }

  const { startIso, endIso } = monthWindowUtc(now)
  return { startIso, endIso }
}

export async function countProductUsage(
  supabase: SupabaseClient,
  userId: string,
  product: BillingProduct,
  periodStartIso: string,
  options?: { lifetime?: boolean }
): Promise<number> {
  let query = supabase
    .from("case_product_entitlements")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("product", product)

  if (!options?.lifetime) {
    query = query.eq("billing_period_start", periodStartIso)
  }

  const { count } = await query
  return count ?? 0
}

export async function getUsageSummary(
  supabase: SupabaseClient,
  userId: string,
  billing: BillingPeriodInput | null
): Promise<UsageSummary> {
  const planKey = (billing?.plan_key as BillingPlanKey | undefined) ?? "none"
  const quotas = getPlanQuotas(planKey)
  const { startIso, endIso } = getBillingPeriod(billing)
  const isFreeTrial = planKey === "none"

  const [oppositionUsed, legalUsed, selfUsed] = await Promise.all([
    countProductUsage(supabase, userId, "opposition", startIso, {
      lifetime: isFreeTrial,
    }),
    countProductUsage(supabase, userId, "legal", startIso),
    countProductUsage(supabase, userId, "self", startIso),
  ])

  const toUsage = (used: number, limit: number, product: BillingProduct): ProductUsage => {
    if (planKey === "pay_per_report" && isPayPerReportChargeProduct(product)) {
      return {
        used,
        limit: 0,
        remaining: 1,
        payPerUnlockCents: getPayPerReportAmountCents(product),
      }
    }
    if (isUnlimitedQuota(limit)) {
      return { used, limit: Number.POSITIVE_INFINITY, remaining: Number.POSITIVE_INFINITY }
    }
    return {
      used,
      limit,
      remaining: Math.max(0, limit - used),
    }
  }

  return {
    planKey,
    periodStart: startIso,
    periodEnd: endIso,
    opposition: toUsage(oppositionUsed, quotas.opposition, "opposition"),
    legal: toUsage(legalUsed, quotas.legal, "legal"),
    self: toUsage(selfUsed, quotas.self, "self"),
  }
}

export type QuotaCheck = { allowed: true } | { allowed: false; reason: string }

export async function checkProductQuota(
  supabase: SupabaseClient,
  userId: string,
  billing: BillingPeriodInput | null,
  product: BillingProduct
): Promise<QuotaCheck> {
  const planKey = (billing?.plan_key as BillingPlanKey | undefined) ?? "none"

  if (isPayPerReportPlan(planKey) && isPayPerReportChargeProduct(product)) {
    if (!billing?.stripe_customer_id || !billing.stripe_default_payment_method_id) {
      return {
        allowed: false,
        reason:
          "Connect a payment card in Billing (Pay Per Report) before unlocking this report.",
      }
    }
    return { allowed: true }
  }

  const summary = await getUsageSummary(supabase, userId, billing)
  const usage = summary[product]

  if (usage.limit <= 0) {
    return {
      allowed: false,
      reason: `Your plan does not include ${product} unlocks. Choose a membership plan in Billing.`,
    }
  }

  if (isUnlimitedQuota(usage.limit)) {
    return { allowed: true }
  }

  if (usage.remaining <= 0) {
    const planKey = (billing?.plan_key as BillingPlanKey | undefined) ?? "none"
    const periodLabel =
      planKey === "none" && product === "opposition"
        ? "your free trial"
        : "this billing period"
    return {
      allowed: false,
      reason: `No ${product} unlocks remaining for ${periodLabel} (${usage.used}/${usage.limit} used).`,
    }
  }

  return { allowed: true }
}
