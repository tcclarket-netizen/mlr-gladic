import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { getStripeClient } from "@/lib/stripe/config"

export const runtime = "nodejs"

export async function POST() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: billing } = await supabase
    .from("user_billing")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle()

  if (!billing?.stripe_customer_id) {
    return NextResponse.json(
      { error: "No Stripe customer found. Start with a plan checkout first." },
      { status: 400 }
    )
  }

  const hdrs = await headers()
  const origin = process.env.NEXT_PUBLIC_SITE_URL || hdrs.get("origin") || "http://localhost:3000"

  const stripe = getStripeClient()
  const session = await stripe.billingPortal.sessions.create({
    customer: billing.stripe_customer_id,
    return_url: `${origin}/billing`,
  })

  return NextResponse.json({ url: session.url })
}
