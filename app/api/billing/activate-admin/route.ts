import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { isAdminEmail } from "@/lib/billing/admin"
import { getPlanByKey } from "@/lib/billing/plans"

export const runtime = "nodejs"

export async function POST() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!isAdminEmail(user.email)) {
    return NextResponse.json(
      { error: "Admin plan is only available to authorized accounts." },
      { status: 403 }
    )
  }

  const plan = getPlanByKey("admin")
  if (!plan) {
    return NextResponse.json({ error: "Admin plan is not configured." }, { status: 500 })
  }

  const now = new Date()
  const periodEnd = new Date(now)
  periodEnd.setUTCFullYear(periodEnd.getUTCFullYear() + 10)

  const { error } = await supabase.from("user_billing").upsert({
    user_id: user.id,
    plan_key: "admin",
    billing_status: "active",
    current_period_start: now.toISOString(),
    current_period_end: periodEnd.toISOString(),
    cancel_at_period_end: false,
    updated_at: now.toISOString(),
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, planKey: "admin" })
}
