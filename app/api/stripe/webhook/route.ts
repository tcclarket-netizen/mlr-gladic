import { NextResponse } from "next/server"
import type Stripe from "stripe"
import { createAdminClient } from "@/lib/supabase/admin"
import { getPlanByKey } from "@/lib/billing/plans"
import { getStripeClient, getStripeWebhookSecret } from "@/lib/stripe/config"

export const runtime = "nodejs"

function subscriptionStatus(status: Stripe.Subscription.Status) {
  if (status === "trialing") return "trialing"
  if (status === "active") return "active"
  if (status === "past_due") return "past_due"
  if (status === "canceled") return "canceled"
  if (status === "incomplete") return "incomplete"
  if (status === "incomplete_expired") return "incomplete_expired"
  if (status === "unpaid") return "unpaid"
  return "none"
}

async function cancelExistingSubscriptionForUser(userId: string, stripe: Stripe) {
  const admin = createAdminClient()
  const { data: billing } = await admin
    .from("user_billing")
    .select("stripe_subscription_id")
    .eq("user_id", userId)
    .maybeSingle()

  const subscriptionId = billing?.stripe_subscription_id
  if (!subscriptionId) return

  try {
    const existing = await stripe.subscriptions.retrieve(subscriptionId)
    if (existing.status !== "canceled") {
      await stripe.subscriptions.cancel(subscriptionId)
    }
  } catch (error) {
    const stripeError = error as Stripe.errors.StripeError
    // If the subscription is already gone/canceled, continue billing sync.
    if (stripeError?.code !== "resource_missing") {
      throw error
    }
  }
}

async function upsertFromSubscription(subscription: Stripe.Subscription) {
  const admin = createAdminClient()
  const planFromMeta = subscription.metadata?.plan_key
  const userId = subscription.metadata?.user_id

  if (!userId) return

  await admin.from("user_billing").upsert({
    user_id: userId,
    stripe_customer_id:
      typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id,
    stripe_subscription_id: subscription.id,
    stripe_price_id: subscription.items.data[0]?.price?.id ?? null,
    plan_key: getPlanByKey(planFromMeta ?? "")?.key ?? "consultant",
    billing_status: subscriptionStatus(subscription.status),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
    updated_at: new Date().toISOString(),
  })
}

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
    const planKey = getPlanByKey(session.metadata?.plan_key ?? "")?.key ?? "pay_per_report"

    if (userId) {
      const customerId =
        typeof session.customer === "string" ? session.customer : session.customer?.id ?? null
      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id ?? null

      if (planKey === "pay_per_report") {
        if (session.mode === "setup" && typeof session.setup_intent === "string") {
          await cancelExistingSubscriptionForUser(userId, stripe)

          const setupIntent = await stripe.setupIntents.retrieve(session.setup_intent)
          const paymentMethodId =
            typeof setupIntent.payment_method === "string"
              ? setupIntent.payment_method
              : setupIntent.payment_method?.id ?? null

          await admin.from("user_billing").upsert({
            user_id: userId,
            stripe_customer_id: customerId,
            stripe_subscription_id: null,
            stripe_price_id: null,
            stripe_default_payment_method_id: paymentMethodId,
            plan_key: "pay_per_report",
            billing_status: "active",
            current_period_end: null,
            cancel_at_period_end: false,
            updated_at: new Date().toISOString(),
          })
        }
      } else {
        await admin.from("user_billing").upsert({
          user_id: userId,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          plan_key: planKey,
          billing_status: session.mode === "subscription" ? "active" : "one_time_paid",
          updated_at: new Date().toISOString(),
        })
      }
    }

    if (session.mode === "subscription" && typeof session.subscription === "string") {
      const subscription = await stripe.subscriptions.retrieve(session.subscription)
      await upsertFromSubscription(subscription)
    }
  }

  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.created") {
    await upsertFromSubscription(event.data.object as Stripe.Subscription)
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription
    const admin = createAdminClient()
    await admin
      .from("user_billing")
      .update({
        billing_status: "canceled",
        cancel_at_period_end: false,
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_subscription_id", sub.id)
  }

  return NextResponse.json({ received: true })
}
