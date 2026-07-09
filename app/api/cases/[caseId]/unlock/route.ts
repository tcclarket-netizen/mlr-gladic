import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { unlockCaseProduct } from "@/lib/billing/case-entitlements"
import { BILLING_PRODUCTS, type BillingProduct } from "@/lib/billing/products"
import { getMembershipEntitlement } from "@/lib/billing/entitlements"

export const runtime = "nodejs"

type Body = { product?: BillingProduct }

export async function POST(
  request: Request,
  context: { params: Promise<{ caseId: string }> }
) {
  const { caseId } = await context.params
  const body = (await request.json().catch(() => ({}))) as Body
  const product = body.product

  if (!product || !BILLING_PRODUCTS.includes(product)) {
    return NextResponse.json({ error: "Invalid product." }, { status: 400 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: caseRow } = await supabase
    .from("cases")
    .select("id")
    .eq("id", caseId)
    .eq("user_id", user.id)
    .maybeSingle()

  if (!caseRow) {
    return NextResponse.json({ error: "Case not found." }, { status: 404 })
  }

  const { data: billing } = await supabase
    .from("user_billing")
    .select("plan_key, billing_status, current_period_start, current_period_end")
    .eq("user_id", user.id)
    .maybeSingle()

  const membership = getMembershipEntitlement(billing)
  if (!membership.allowed) {
    return NextResponse.json(
      { error: membership.reason ?? "Membership is not active." },
      { status: 402 }
    )
  }

  const result = await unlockCaseProduct(supabase, user.id, caseId, product, billing)
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 402 })
  }

  return NextResponse.json({
    success: true,
    product,
    alreadyUnlocked: result.alreadyUnlocked,
  })
}
