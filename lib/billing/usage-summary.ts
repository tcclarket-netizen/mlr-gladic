import "server-only"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { BillingPlanKey } from "@/lib/billing/plans"
import { getPlanQuotas } from "@/lib/billing/plans"
import type { BillingProduct } from "@/lib/billing/products"
import type { UserBilling } from "@/lib/billing/types"

export type ProductUsage = {
  used: number
  limit: number
  remaining: number
}

export type UsageSummary = {
  planKey: BillingPlanKey
  periodStart: string
  periodEnd: string | null
  opposition: ProductUsage
  legal: ProductUsage
  self: ProductUsage
}

type BillingPeriodInput = Pick<UserBilling, "plan_key" | "current_period_start" | "current_period_end">

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

  const toUsage = (used: number, limit: number): ProductUsage => ({
    used,
    limit,
    remaining: Math.max(0, limit - used),
  })

  return {
    planKey,
    periodStart: startIso,
    periodEnd: endIso,
    opposition: toUsage(oppositionUsed, quotas.opposition),
    legal: toUsage(legalUsed, quotas.legal),
    self: toUsage(selfUsed, quotas.self),
  }
}

export type QuotaCheck = { allowed: true } | { allowed: false; reason: string }

export async function checkProductQuota(
  supabase: SupabaseClient,
  userId: string,
  billing: BillingPeriodInput | null,
  product: BillingProduct
): Promise<QuotaCheck> {
  const summary = await getUsageSummary(supabase, userId, billing)
  const usage = summary[product]

  if (usage.limit <= 0) {
    return {
      allowed: false,
      reason: `Your plan does not include ${product} unlocks. Choose a membership plan in Billing.`,
    }
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
