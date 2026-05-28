import "server-only"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { BillingPlanKey } from "@/lib/billing/plans"

type PlanLimits = {
  monthlyCases: number | null
  monthlyReports: number | null
}

const PLAN_LIMITS: Record<BillingPlanKey, PlanLimits> = {
  free_trial: { monthlyCases: 1, monthlyReports: 1 },
  pay_per_report: { monthlyCases: null, monthlyReports: null },
  consultant: { monthlyCases: 25, monthlyReports: 50 },
  agency: { monthlyCases: null, monthlyReports: null },
}

export type QuotaCheck = { allowed: true } | { allowed: false; reason: string }

function monthWindowUtc(now = new Date()) {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0))
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0))
  return {
    startIso: start.toISOString(),
    endIso: end.toISOString(),
  }
}

export async function checkMonthlyCaseQuota(
  supabase: SupabaseClient,
  userId: string,
  planKey: BillingPlanKey
): Promise<QuotaCheck> {
  const limit = PLAN_LIMITS[planKey].monthlyCases
  if (limit == null) return { allowed: true }

  const { startIso, endIso } = monthWindowUtc()
  const { count } = await supabase
    .from("cases")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", startIso)
    .lt("created_at", endIso)
  const used = count ?? 0

  if (used >= limit) {
    return {
      allowed: false,
      reason: `Monthly case limit reached (${used}/${limit}) for your current plan.`,
    }
  }

  return { allowed: true }
}

export async function checkMonthlyReportQuota(
  supabase: SupabaseClient,
  userId: string,
  planKey: BillingPlanKey
): Promise<QuotaCheck> {
  const limit = PLAN_LIMITS[planKey].monthlyReports
  if (limit == null) return { allowed: true }

  const { startIso, endIso } = monthWindowUtc()
  const mode = planKey === "pay_per_report" ? "pay_per_report" : "subscription"
  const { count } = await supabase
    .from("generated_reports")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("report_type", "legal_report")
    .eq("status", "ready")
    .eq("billing_mode_at_generation", mode)
    .eq("billing_plan_at_generation", planKey)
    .gte("generated_at", startIso)
    .lt("generated_at", endIso)
  const used = count ?? 0

  if (used >= limit) {
    return {
      allowed: false,
      reason: `Monthly report generation limit reached (${used}/${limit}) for your current plan.`,
    }
  }

  return { allowed: true }
}
