import type Stripe from "stripe"
import { createAdminClient } from "@/lib/supabase/admin"
import { getPlanByKey, NO_MEMBERSHIP_PLAN_KEY } from "@/lib/billing/plans"

const MANAGED_STATUSES = new Set<Stripe.Subscription.Status>([
  "active",
  "trialing",
  "past_due",
  "unpaid",
])

export function isManagedSubscriptionStatus(status: Stripe.Subscription.Status) {
  return MANAGED_STATUSES.has(status)
}

export function mapSubscriptionBillingStatus(status: Stripe.Subscription.Status) {
  if (status === "trialing") return "trialing"
  if (status === "active") return "active"
  if (status === "past_due") return "past_due"
  if (status === "canceled") return "canceled"
  if (status === "incomplete") return "incomplete"
  if (status === "incomplete_expired") return "incomplete_expired"
  if (status === "unpaid") return "unpaid"
  return "none"
}

type SubscriptionWithLegacyPeriod = Stripe.Subscription & {
  current_period_start?: number
  current_period_end?: number
}

/** Basil+ API: billing period lives on subscription items, not the subscription root. */
export function getSubscriptionPeriodIso(subscription: Stripe.Subscription): {
  start: string | null
  end: string | null
} {
  const items = subscription.items?.data ?? []
  const starts = items
    .map((item) => item.current_period_start)
    .filter((value): value is number => typeof value === "number" && value > 0)
  const ends = items
    .map((item) => item.current_period_end)
    .filter((value): value is number => typeof value === "number" && value > 0)

  const legacy = subscription as SubscriptionWithLegacyPeriod
  const startUnix =
    (starts.length ? Math.min(...starts) : undefined) ?? legacy.current_period_start
  const endUnix = (ends.length ? Math.max(...ends) : undefined) ?? legacy.current_period_end

  return {
    start: startUnix ? new Date(startUnix * 1000).toISOString() : null,
    end: endUnix ? new Date(endUnix * 1000).toISOString() : null,
  }
}

export async function listCustomerSubscriptions(stripe: Stripe, customerId: string) {
  const subscriptions: Stripe.Subscription[] = []

  for (const status of ["active", "trialing", "past_due", "unpaid"] as const) {
    const page = await stripe.subscriptions.list({
      customer: customerId,
      status,
      limit: 100,
    })
    subscriptions.push(...page.data)
  }

  return subscriptions
}

export async function cancelSubscriptionsExcept(
  stripe: Stripe,
  subscriptions: Stripe.Subscription[],
  keepSubscriptionId: string
) {
  for (const subscription of subscriptions) {
    if (
      subscription.id !== keepSubscriptionId &&
      isManagedSubscriptionStatus(subscription.status)
    ) {
      await stripe.subscriptions.cancel(subscription.id)
    }
  }
}

export async function upsertUserBillingFromSubscription(subscription: Stripe.Subscription) {
  const admin = createAdminClient()
  const planFromMeta = subscription.metadata?.plan_key
  const userId = subscription.metadata?.user_id

  if (!userId) return

  const period = getSubscriptionPeriodIso(subscription)

  await admin.from("user_billing").upsert({
    user_id: userId,
    stripe_customer_id:
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer.id,
    stripe_subscription_id: subscription.id,
    stripe_price_id: subscription.items.data[0]?.price?.id ?? null,
    plan_key: getPlanByKey(planFromMeta ?? "")?.key ?? NO_MEMBERSHIP_PLAN_KEY,
    billing_status: mapSubscriptionBillingStatus(subscription.status),
    current_period_start: period.start,
    current_period_end: period.end,
    cancel_at_period_end: subscription.cancel_at_period_end,
    updated_at: new Date().toISOString(),
  })
}

export async function updateCustomerSubscriptionPlan(
  stripe: Stripe,
  subscriptionId: string,
  priceId: string,
  metadata: Record<string, string>
) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const itemId = subscription.items.data[0]?.id

  if (!itemId) {
    throw new Error("Subscription has no line items.")
  }

  const currentPriceId = subscription.items.data[0]?.price?.id
  if (currentPriceId === priceId) {
    return subscription
  }

  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
    items: [{ id: itemId, price: priceId }],
    proration_behavior: "create_prorations",
    metadata: {
      ...subscription.metadata,
      ...metadata,
    },
    expand: ["items.data.price"],
  })
}

export function pickPrimarySubscription(subscriptions: Stripe.Subscription[]) {
  return [...subscriptions].sort((a, b) => b.created - a.created)[0] ?? null
}
