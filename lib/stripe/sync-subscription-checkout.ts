import "server-only"
import type Stripe from "stripe"
import { getStripeClient } from "@/lib/stripe/config"
import { recordBillingLedgerEntry } from "@/lib/referrals/ledger"
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

async function recordSubscriptionLedgerFromCheckout(
  session: Stripe.Checkout.Session,
  subscription: Stripe.Subscription,
  userId: string
) {
  const stripe = getStripeClient()
  const planKey = session.metadata?.plan_key ?? "membership"

  const invoiceId =
    typeof subscription.latest_invoice === "string"
      ? subscription.latest_invoice
      : subscription.latest_invoice?.id ??
        (typeof session.invoice === "string" ? session.invoice : session.invoice?.id ?? null)

  let amountCents = session.amount_total ?? 0
  let currency = session.currency ?? "usd"
  let description = `Subscription (${planKey})`
  let occurredAt = new Date((session.created ?? Date.now() / 1000) * 1000).toISOString()
  let stripeReferenceId = invoiceId ?? session.id

  if (invoiceId) {
    try {
      const invoice = await stripe.invoices.retrieve(invoiceId)
      amountCents = invoice.amount_paid ?? amountCents
      currency = invoice.currency ?? currency
      description = invoice.lines?.data?.[0]?.description ?? description
      occurredAt = new Date(
        (invoice.status_transitions?.paid_at ?? invoice.created) * 1000
      ).toISOString()
      stripeReferenceId = invoice.id
    } catch {
      // Fall back to checkout session totals.
    }
  }

  if (amountCents <= 0) return

  await recordBillingLedgerEntry({
    userId,
    entryType: "subscription",
    amountCents,
    currency,
    description,
    stripeReferenceId,
    occurredAt,
    metadata: {
      plan_key: planKey,
      checkout_session_id: session.id,
      subscription_id: subscription.id,
    },
  })
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
  await recordSubscriptionLedgerFromCheckout(session, subscription, userId)
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
