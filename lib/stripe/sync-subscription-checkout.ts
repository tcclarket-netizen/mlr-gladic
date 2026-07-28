import "server-only"
import type Stripe from "stripe"
import { getStripeClient } from "@/lib/stripe/config"
import {
  cancelSubscriptionsExcept,
  listCustomerSubscriptions,
  upsertUserBillingFromSubscription,
} from "@/lib/stripe/subscription-lifecycle"

function subscriptionFromSession(session: Stripe.Checkout.Session): Stripe.Subscription | null {
  const sub = session.subscription
  if (!sub) return null
  if (typeof sub === "string") return null
  return sub
}

export async function applySubscriptionFromCheckoutSession(
  sessionId: string,
  expectedUserId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const stripe = getStripeClient()
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["subscription"],
  })

  if (session.mode !== "subscription") {
    return { ok: false, error: "Checkout session is not a subscription." }
  }

  if (session.status !== "complete") {
    return { ok: false, error: "Checkout is not complete yet." }
  }

  const userId = session.metadata?.user_id
  if (!userId || userId !== expectedUserId) {
    return { ok: false, error: "Checkout session does not match your account." }
  }

  let subscription = subscriptionFromSession(session)
  if (!subscription) {
    const subscriptionId =
      typeof session.subscription === "string" ? session.subscription : session.subscription?.id
    if (!subscriptionId) {
      return { ok: false, error: "Missing subscription on checkout session." }
    }
    subscription = await stripe.subscriptions.retrieve(subscriptionId)
  }

  const customerId =
    typeof session.customer === "string" ? session.customer : session.customer?.id ?? null

  if (customerId) {
    try {
      const existing = await listCustomerSubscriptions(stripe, customerId)
      await cancelSubscriptionsExcept(stripe, existing, subscription.id)
    } catch {
      // Still persist membership even if duplicate subscription cleanup fails.
    }
  }

  await upsertUserBillingFromSubscription(subscription)
  return { ok: true }
}

export async function findLatestCompletedSubscriptionCheckoutSession(
  customerId: string,
  userId: string
): Promise<Stripe.Checkout.Session | null> {
  const stripe = getStripeClient()
  const sessions = await stripe.checkout.sessions.list({
    customer: customerId,
    limit: 15,
  })

  return (
    sessions.data.find(
      (s) =>
        s.mode === "subscription" &&
        s.status === "complete" &&
        s.metadata?.user_id === userId
    ) ?? null
  )
}
