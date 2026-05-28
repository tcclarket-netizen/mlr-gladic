import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { getPlanByKey, getStripePriceIdForPlan, type BillingPlanKey } from "@/lib/billing/plans"
import { getStripeClient } from "@/lib/stripe/config"

export const runtime = "nodejs"

type Body = { planKey?: BillingPlanKey }

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Body
  const plan = body.planKey ? getPlanByKey(body.planKey) : undefined
  if (!plan || plan.key === "free_trial") {
    return NextResponse.json({ error: "Invalid plan selection." }, { status: 400 })
  }

  const priceId = plan.mode !== "setup" ? getStripePriceIdForPlan(plan.key) : null
  if (plan.mode !== "setup" && !priceId) {
    return NextResponse.json({ error: `Missing Stripe price mapping for ${plan.key}.` }, { status: 500 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const stripe = getStripeClient()

  const { data: billing } = await supabase
    .from("user_billing")
    .select("stripe_customer_id")
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
      plan_key: "free_trial",
      billing_status: "none",
      updated_at: new Date().toISOString(),
    })
  }

  const hdrs = await headers()
  const origin = process.env.NEXT_PUBLIC_SITE_URL || hdrs.get("origin") || "http://localhost:3000"
  const setupCurrency = (process.env.STRIPE_PAY_PER_REPORT_CURRENCY ?? "usd").toLowerCase()

  const session = await stripe.checkout.sessions.create({
    mode: plan.mode,
    customer: customerId,
    ...(priceId ? { line_items: [{ price: priceId, quantity: 1 }] } : {}),
    success_url: `${origin}/billing?checkout=success`,
    cancel_url: `${origin}/billing?checkout=cancel`,
    ...(plan.mode !== "setup" ? { allow_promotion_codes: true } : {}),
    metadata: {
      user_id: user.id,
      plan_key: plan.key,
    },
    ...(plan.mode === "subscription"
      ? { subscription_data: { metadata: { user_id: user.id, plan_key: plan.key } } }
      : {}),
    ...(plan.mode === "setup"
      ? {
          currency: setupCurrency,
          setup_intent_data: {
            metadata: { user_id: user.id, plan_key: plan.key },
          },
        }
      : {}),
  })

  return NextResponse.json({ url: session.url })
}
