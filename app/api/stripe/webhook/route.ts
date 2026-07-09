import { NextResponse } from "next/server"
import type Stripe from "stripe"
import { createAdminClient } from "@/lib/supabase/admin"
import { getPlanByKey, NO_MEMBERSHIP_PLAN_KEY } from "@/lib/billing/plans"
import { getStripeClient, getStripeWebhookSecret } from "@/lib/stripe/config"
import {
  cancelSubscriptionsExcept,
  listCustomerSubscriptions,
  upsertUserBillingFromSubscription,
} from "@/lib/stripe/subscription-lifecycle"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const stripe = getStripeClient()
  const signature = request.headers.get("stripe-signature")
  if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 })

  const body = await request.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, getStripeWebhookSecret())
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid webhook signature"
    return NextResponse.json({ error: message }, { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session
    const admin = createAdminClient()

    const userId = session.metadata?.user_id
    const planKey = getPlanByKey(session.metadata?.plan_key ?? "")?.key ?? NO_MEMBERSHIP_PLAN_KEY

    if (userId && session.mode === "subscription") {
      const customerId =
        typeof session.customer === "string" ? session.customer : session.customer?.id ?? null
      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id ?? null

      await admin.from("user_billing").upsert({
        user_id: userId,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        plan_key: planKey,
        billing_status: "active",
        updated_at: new Date().toISOString(),
      })

      if (customerId && subscriptionId) {
        const existing = await listCustomerSubscriptions(stripe, customerId)
        await cancelSubscriptionsExcept(stripe, existing, subscriptionId)
      }
    }

    if (session.mode === "subscription" && typeof session.subscription === "string") {
      const subscription = await stripe.subscriptions.retrieve(session.subscription)
      await upsertUserBillingFromSubscription(subscription)
    }
  }

  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.created") {
    const subscription = event.data.object as Stripe.Subscription
    await upsertUserBillingFromSubscription(subscription)

    const customerId =
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer.id
    const existing = await listCustomerSubscriptions(stripe, customerId)
    await cancelSubscriptionsExcept(stripe, existing, subscription.id)
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription
    const admin = createAdminClient()
    const { data: billingRow } = await admin
      .from("user_billing")
      .select("plan_key")
      .eq("stripe_subscription_id", sub.id)
      .maybeSingle()

    if (billingRow?.plan_key === "admin") {
      return NextResponse.json({ received: true })
    }

    await admin
      .from("user_billing")
      .update({
        plan_key: NO_MEMBERSHIP_PLAN_KEY,
        billing_status: "canceled",
        stripe_subscription_id: null,
        stripe_price_id: null,
        current_period_start: null,
        current_period_end: null,
        cancel_at_period_end: false,
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_subscription_id", sub.id)
  }

  return NextResponse.json({ received: true })
}
