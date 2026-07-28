import "server-only"
import { getStripeClient } from "@/lib/stripe/config"
import type { UserBilling } from "@/lib/billing/types"
import {
  isManagedSubscriptionStatus,
  listCustomerSubscriptions,
  pickPrimarySubscription,
  upsertUserBillingFromSubscription,
} from "@/lib/stripe/subscription-lifecycle"

/** If Stripe has an active membership but DB still says pay-per-report, sync from Stripe. */
export async function reconcileMembershipFromStripe(
  billing: Pick<UserBilling, "plan_key" | "stripe_customer_id"> | null
): Promise<boolean> {
  if (!billing?.stripe_customer_id || billing.plan_key !== "pay_per_report") {
    return false
  }

  const stripe = getStripeClient()
  const subscriptions = await listCustomerSubscriptions(stripe, billing.stripe_customer_id)
  const primary = pickPrimarySubscription(subscriptions)
  if (!primary || !isManagedSubscriptionStatus(primary.status)) {
    return false
  }

  await upsertUserBillingFromSubscription(primary)
  return true
}
