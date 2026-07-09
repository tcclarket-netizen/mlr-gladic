import type { UserBilling } from "@/lib/billing/types"
import { isAdminPlan, isPaidPlan } from "@/lib/billing/plans"

export type ProcessingEntitlement = {
  allowed: boolean
  reason?: string
}

const BLOCKED_STATUSES = new Set(["past_due", "unpaid", "canceled"])

export function getMembershipEntitlement(
  billing: Pick<UserBilling, "plan_key" | "billing_status"> | null
): ProcessingEntitlement {
  if (!billing || billing.plan_key === "none") {
    return { allowed: true }
  }

  if (isAdminPlan(billing.plan_key)) {
    return { allowed: true }
  }

  if (!isPaidPlan(billing.plan_key)) {
    return { allowed: true }
  }

  if (BLOCKED_STATUSES.has(billing.billing_status)) {
    return {
      allowed: false,
      reason: `Your membership is ${billing.billing_status.replace("_", " ")}. Update payment in Billing to continue.`,
    }
  }

  return { allowed: true }
}

export function getCaseCreationEntitlement(
  billing: Pick<UserBilling, "plan_key" | "billing_status"> | null
): ProcessingEntitlement {
  return getMembershipEntitlement(billing)
}

export function getUploadEntitlement(
  billing: Pick<UserBilling, "plan_key" | "billing_status"> | null
): ProcessingEntitlement {
  return getMembershipEntitlement(billing)
}

export function getProcessingEntitlement(
  billing: Pick<UserBilling, "plan_key" | "billing_status"> | null
): ProcessingEntitlement {
  return getMembershipEntitlement(billing)
}

export function getExportEntitlement(
  billing: Pick<UserBilling, "plan_key" | "billing_status"> | null
): ProcessingEntitlement {
  return getMembershipEntitlement(billing)
}
