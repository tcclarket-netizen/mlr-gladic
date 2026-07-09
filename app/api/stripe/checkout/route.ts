import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import {
  getPlanByKey,
  getStripePriceIdForPlan,
  type BillingInterval,
  type BillingPlanKey,
} from "@/lib/billing/plans"
import { getStripeClient } from "@/lib/stripe/config"
import {
  cancelSubscriptionsExcept,
  isManagedSubscriptionStatus,
  listCustomerSubscriptions,
  pickPrimarySubscription,
  updateCustomerSubscriptionPlan,
  upsertUserBillingFromSubscription,
} from "@/lib/stripe/subscription-lifecycle"

export const runtime = "nodejs"

type Body = {
  planKey?: BillingPlanKey
  interval?: BillingInterval
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Body
  const plan = body.planKey ? getPlanByKey(body.planKey) : undefined
  const interval: BillingInterval = body.interval === "year" ? "year" : "month"

  if (!plan || plan.key === "none") {
    return NextResponse.json({ error: "Invalid plan selection." }, { status: 400 })
  }

  const priceId = getStripePriceIdForPlan(plan.key, interval)
  if (!priceId) {
    return NextResponse.json(
      { error: `Missing Stripe price mapping for ${plan.key} (${interval}).` },
      { status: 500 }
    )
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const stripe = getStripeClient()
  const hdrs = await headers()
  const origin = process.env.NEXT_PUBLIC_SITE_URL || hdrs.get("origin") || "http://localhost:3000"
  const subscriptionMetadata = {
    user_id: user.id,
    plan_key: plan.key,
    billing_interval: interval,
  }

  const { data: billing } = await supabase
    .from("user_billing")
    .select("stripe_customer_id, stripe_subscription_id")
    .eq("user_id", user.id)
    .maybeSingle()

  let customerId = billing?.stripe_customer_id ?? null

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      metadata: { user_id: user.id },
    })
    customerId = customer.id
    await supabase.from("user_billing").upsert({
      user_id: user.id,
      stripe_customer_id: customerId,
      plan_key: "none",
      billing_status: "none",
      updated_at: new Date().toISOString(),
    })
  }

  const existingSubscriptions = await listCustomerSubscriptions(stripe, customerId)
  const storedSubscriptionId = billing?.stripe_subscription_id
  const storedSubscription = storedSubscriptionId
    ? existingSubscriptions.find((sub) => sub.id === storedSubscriptionId) ??
      (await stripe.subscriptions
        .retrieve(storedSubscriptionId)
        .catch(() => null))
    : null

  const subscriptionToUpdate =
    storedSubscription && isManagedSubscriptionStatus(storedSubscription.status)
      ? storedSubscription
      : pickPrimarySubscription(existingSubscriptions)

  if (subscriptionToUpdate && isManagedSubscriptionStatus(subscriptionToUpdate.status)) {
    const currentPriceId = subscriptionToUpdate.items.data[0]?.price?.id
    if (currentPriceId === priceId) {
      return NextResponse.json({ error: "You are already on this plan." }, { status: 400 })
    }

    const updated = await updateCustomerSubscriptionPlan(
      stripe,
      subscriptionToUpdate.id,
      priceId,
      subscriptionMetadata
    )

    await cancelSubscriptionsExcept(stripe, existingSubscriptions, updated.id)
    await upsertUserBillingFromSubscription(updated)

    return NextResponse.json({ url: `${origin}/billing?checkout=updated` })
  }

  if (existingSubscriptions.length > 0) {
    const primary = pickPrimarySubscription(existingSubscriptions)
    if (primary) {
      const updated = await updateCustomerSubscriptionPlan(
        stripe,
        primary.id,
        priceId,
        subscriptionMetadata
      )
      await cancelSubscriptionsExcept(stripe, existingSubscriptions, updated.id)
      await upsertUserBillingFromSubscription(updated)
      return NextResponse.json({ url: `${origin}/billing?checkout=updated` })
    }
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/billing?checkout=success`,
    cancel_url: `${origin}/billing?checkout=cancel`,
    allow_promotion_codes: true,
    metadata: subscriptionMetadata,
    subscription_data: {
      metadata: subscriptionMetadata,
    },
  })

  return NextResponse.json({ url: session.url })
}
