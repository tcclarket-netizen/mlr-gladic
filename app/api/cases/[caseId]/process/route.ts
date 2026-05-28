import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { processCase } from "@/lib/cases/process-case"
import { hasOpenAI } from "@/lib/openai/client"
import { getProcessingEntitlement } from "@/lib/billing/entitlements"
import { chargePayPerReport } from "@/lib/stripe/pay-per-report"
import { checkMonthlyReportQuota } from "@/lib/billing/usage-limits"
import type { BillingPlanKey } from "@/lib/billing/plans"

export const maxDuration = 300
export const runtime = "nodejs"

async function updateReportBillingAttribution(input: {
  supabase: Awaited<ReturnType<typeof createClient>>
  userId: string
  caseId: string
  planKey: BillingPlanKey
  mode: "subscription" | "pay_per_report"
  paymentIntentId?: string | null
  chargedAmountCents?: number | null
}) {
  await input.supabase
    .from("generated_reports")
    .update({
      billing_mode_at_generation: input.mode,
      billing_plan_at_generation: input.planKey,
      stripe_payment_intent_id: input.paymentIntentId ?? null,
      charged_amount_cents: input.chargedAmountCents ?? null,
    })
    .eq("user_id", input.userId)
    .eq("case_id", input.caseId)
    .eq("report_type", "legal_report")
}

export async function POST(
  _request: Request,
  context: { params: Promise<{ caseId: string }> }
) {
  if (!hasOpenAI()) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured. Add it to .env.local." },
      { status: 503 }
    )
  }

  const { caseId } = await context.params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: billing } = await supabase
    .from("user_billing")
    .select(
      "plan_key, billing_status, stripe_customer_id, stripe_default_payment_method_id, reports_charged_count"
    )
    .eq("user_id", user.id)
    .maybeSingle()

  const entitlement = getProcessingEntitlement(billing)
  if (!entitlement.allowed) {
    return NextResponse.json(
      { error: entitlement.reason ?? "Your plan does not allow processing reports." },
      { status: 402 }
    )
  }

  const quota = await checkMonthlyReportQuota(
    supabase,
    user.id,
    (billing?.plan_key as BillingPlanKey | undefined) ?? "free_trial"
  )
  if (!quota.allowed) {
    return NextResponse.json({ error: quota.reason }, { status: 402 })
  }

  const result = await processCase(supabase, user.id, caseId)

  if ("error" in result) {
    console.error(result.error)
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  const planKey = (billing?.plan_key as BillingPlanKey | undefined) ?? "free_trial"

  if (billing?.plan_key === "pay_per_report") {
    if (!billing.stripe_customer_id || !billing.stripe_default_payment_method_id) {
      return NextResponse.json(
        {
          error:
            "Report was generated, but autopay is not configured. Set up Billing before processing pay-per-report.",
        },
        { status: 402 }
      )
    }

    const charge = await chargePayPerReport({
      userId: user.id,
      caseId,
      customerId: billing.stripe_customer_id,
      paymentMethodId: billing.stripe_default_payment_method_id,
    })

    if (!charge.ok) {
      await supabase.from("case_events").insert({
        user_id: user.id,
        case_id: caseId,
        event_type: "billing_charge_failed",
        title: "Pay-per-report charge failed",
        metadata: {
          reason: charge.error ?? "Unknown Stripe off-session payment failure",
        },
      })

      await updateReportBillingAttribution({
        supabase,
        userId: user.id,
        caseId,
        planKey,
        mode: "pay_per_report",
      })

      return NextResponse.json(
        {
          error:
            "Report generated successfully, but automatic charge failed. Update payment method in Billing.",
        },
        { status: 402 }
      )
    }

    await updateReportBillingAttribution({
      supabase,
      userId: user.id,
      caseId,
      planKey,
      mode: "pay_per_report",
      paymentIntentId: charge.paymentIntent?.id ?? null,
      chargedAmountCents: Number.parseInt(process.env.STRIPE_PAY_PER_REPORT_AMOUNT_CENTS ?? "2900", 10),
    })

    await supabase
      .from("user_billing")
      .update({
        reports_charged_count: (billing.reports_charged_count ?? 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)

    await supabase.from("case_events").insert({
      user_id: user.id,
      case_id: caseId,
      event_type: "billing_charge_succeeded",
      title: "Pay-per-report charge succeeded",
      metadata: {
        amount_cents: Number.parseInt(process.env.STRIPE_PAY_PER_REPORT_AMOUNT_CENTS ?? "2900", 10),
      },
    })
  }

  if (billing?.plan_key !== "pay_per_report") {
    await updateReportBillingAttribution({
      supabase,
      userId: user.id,
      caseId,
      planKey,
      mode: "subscription",
    })
  }

  return NextResponse.json({ success: true })
}
