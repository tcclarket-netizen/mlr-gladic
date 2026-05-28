import type { UserBilling } from "@/lib/billing/types"

export type ProcessingEntitlement = {
  allowed: boolean
  reason?: string
}

const ACTIVE_STATUSES = new Set(["active", "trialing", "one_time_paid", "past_due"])

export function getProcessingEntitlement(
  billing: Pick<
    UserBilling,
    "plan_key" | "billing_status" | "stripe_default_payment_method_id"
  > | null
): ProcessingEntitlement {
  // New users may not have a billing row yet; default to free-trial access.
  if (!billing) {
    return { allowed: true }
  }

  // Free trial processing is quota-limited in usage checks, not hard-blocked here.
  if (billing.plan_key === "free_trial") {
    return { allowed: true }
  }

  if (billing.plan_key === "pay_per_report" && !billing.stripe_default_payment_method_id) {
    return {
      allowed: false,
      reason: "Set up pay-per-report autopay in Billing before processing.",
    }
  }

  if (!ACTIVE_STATUSES.has(billing.billing_status)) {
    return {
      allowed: false,
      reason: `Billing status is '${billing.billing_status}'. Update payment details to continue.`,
    }
  }

  return { allowed: true }
}

export function getCaseCreationEntitlement(
  billing: Pick<
    UserBilling,
    "plan_key" | "billing_status" | "stripe_default_payment_method_id"
  > | null
): ProcessingEntitlement {
  if (!billing) return { allowed: true }

  // Free trial is quota-limited in usage checks, not hard-blocked here.
  if (billing.plan_key === "free_trial") {
    return { allowed: true }
  }

  return getProcessingEntitlement(billing)
}

export function getUploadEntitlement(
  billing: Pick<
    UserBilling,
    "plan_key" | "billing_status" | "stripe_default_payment_method_id"
  > | null
): ProcessingEntitlement {
  if (!billing) return { allowed: true }

  // Free trial is quota-limited in usage checks, not hard-blocked here.
  if (billing.plan_key === "free_trial") {
    return { allowed: true }
  }

  return getProcessingEntitlement(billing)
}

export function getExportEntitlement(
  billing: Pick<
    UserBilling,
    "plan_key" | "billing_status" | "stripe_default_payment_method_id"
  > | null
): ProcessingEntitlement {
  if (!billing) return { allowed: true }

  // Free trial is quota-limited in usage checks, not hard-blocked here.
  if (billing.plan_key === "free_trial") {
    return { allowed: true }
  }

  return getProcessingEntitlement(billing)
}
