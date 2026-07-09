import "server-only"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { BillingProduct } from "@/lib/billing/products"
import { BILLING_PRODUCT_LABELS } from "@/lib/billing/products"
import {
  checkProductQuota,
  getBillingPeriod,
  type QuotaCheck,
} from "@/lib/billing/usage-summary"
import type { UserBilling } from "@/lib/billing/types"

export type CaseProductEntitlements = Record<BillingProduct, boolean>

export async function getCaseProductEntitlements(
  supabase: SupabaseClient,
  userId: string,
  caseId: string,
  billing: Pick<UserBilling, "current_period_start" | "current_period_end"> | null
): Promise<CaseProductEntitlements> {
  const { startIso } = getBillingPeriod(billing)
  const { data } = await supabase
    .from("case_product_entitlements")
    .select("product")
    .eq("user_id", userId)
    .eq("case_id", caseId)
    .eq("billing_period_start", startIso)

  const unlocked = new Set((data ?? []).map((row) => row.product as BillingProduct))
  return {
    opposition: unlocked.has("opposition"),
    legal: unlocked.has("legal"),
    self: unlocked.has("self"),
  }
}

export async function isCaseProductUnlocked(
  supabase: SupabaseClient,
  userId: string,
  caseId: string,
  product: BillingProduct,
  billing: Pick<UserBilling, "current_period_start" | "current_period_end"> | null
) {
  const entitlements = await getCaseProductEntitlements(supabase, userId, caseId, billing)
  return entitlements[product]
}

export type UnlockResult =
  | { ok: true; alreadyUnlocked: boolean }
  | { ok: false; error: string }

export async function unlockCaseProduct(
  supabase: SupabaseClient,
  userId: string,
  caseId: string,
  product: BillingProduct,
  billing: Pick<UserBilling, "plan_key" | "current_period_start" | "current_period_end"> | null
): Promise<UnlockResult> {
  const alreadyUnlocked = await isCaseProductUnlocked(supabase, userId, caseId, product, billing)
  if (alreadyUnlocked) {
    return { ok: true, alreadyUnlocked: true }
  }

  const quota: QuotaCheck = await checkProductQuota(supabase, userId, billing, product)
  if (!quota.allowed) {
    return { ok: false, error: quota.reason }
  }

  const { startIso } = getBillingPeriod(billing)
  const { error } = await supabase.from("case_product_entitlements").insert({
    user_id: userId,
    case_id: caseId,
    product,
    billing_period_start: startIso,
  })

  if (error) {
    if (error.code === "23505") {
      return { ok: true, alreadyUnlocked: true }
    }
    return { ok: false, error: error.message }
  }

  await supabase.from("case_events").insert({
    user_id: userId,
    case_id: caseId,
    event_type: "product_unlocked",
    title: `${BILLING_PRODUCT_LABELS[product]} unlocked`,
    metadata: { product },
  })

  return { ok: true, alreadyUnlocked: false }
}
