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
import { isPayPerReportPlan, isPayPerReportChargeProduct } from "@/lib/billing/pay-per-report-pricing"
import { chargePayPerReportUnlock } from "@/lib/stripe/pay-per-report-charge"
import { recordBillingLedgerEntry } from "@/lib/referrals/ledger"

export type CaseProductEntitlements = Record<BillingProduct, boolean>

type BillingForUnlock = Pick<
  UserBilling,
  | "plan_key"
  | "current_period_start"
  | "current_period_end"
  | "stripe_customer_id"
  | "stripe_default_payment_method_id"
  | "reports_charged_count"
>

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
  billing: BillingForUnlock | null
): Promise<UnlockResult> {
  const alreadyUnlocked = await isCaseProductUnlocked(supabase, userId, caseId, product, billing)
  if (alreadyUnlocked) {
    return { ok: true, alreadyUnlocked: true }
  }

  const quota: QuotaCheck = await checkProductQuota(supabase, userId, billing, product)
  if (!quota.allowed) {
    return { ok: false, error: quota.reason }
  }

  let billingMode: "subscription" | "pay_per_report" | null = null
  let paymentIntentId: string | null = null
  let chargedAmountCents: number | null = null

  if (
    billing &&
    isPayPerReportPlan(billing.plan_key) &&
    isPayPerReportChargeProduct(product)
  ) {
    if (!billing.stripe_customer_id || !billing.stripe_default_payment_method_id) {
      return {
        ok: false,
        error: "Connect a payment card in Billing before unlocking this report.",
      }
    }

    const charge = await chargePayPerReportUnlock({
      userId,
      caseId,
      product,
      customerId: billing.stripe_customer_id,
      paymentMethodId: billing.stripe_default_payment_method_id,
    })

    if (!charge.ok) {
      await supabase.from("case_events").insert({
        user_id: userId,
        case_id: caseId,
        event_type: "billing_charge_failed",
        title: "Pay-per-report charge failed",
        metadata: { product, reason: charge.error },
      })
      return { ok: false, error: charge.error }
    }

    billingMode = "pay_per_report"
    paymentIntentId = charge.paymentIntent.id
    chargedAmountCents = charge.amountCents

    await supabase
      .from("user_billing")
      .update({
        reports_charged_count: (billing.reports_charged_count ?? 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)

    await supabase.from("case_events").insert({
      user_id: userId,
      case_id: caseId,
      event_type: "billing_charge_succeeded",
      title: "Pay-per-report charge succeeded",
      metadata: {
        product,
        amount_cents: charge.amountCents,
        payment_intent_id: charge.paymentIntent.id,
      },
    })

    await recordBillingLedgerEntry({
      userId,
      entryType: "pay_per_report",
      amountCents: charge.amountCents,
      currency: charge.paymentIntent.currency ?? "usd",
      description: `${BILLING_PRODUCT_LABELS[product]} unlock`,
      stripeReferenceId: charge.paymentIntent.id,
      metadata: { product, case_id: caseId },
    })
  }

  const { startIso } = getBillingPeriod(billing)
  const { error } = await supabase.from("case_product_entitlements").insert({
    user_id: userId,
    case_id: caseId,
    product,
    billing_period_start: startIso,
    billing_mode: billingMode,
    stripe_payment_intent_id: paymentIntentId,
    charged_amount_cents: chargedAmountCents,
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
    metadata: { product, billing_mode: billingMode, payment_intent_id: paymentIntentId },
  })

  return { ok: true, alreadyUnlocked: false }
}
