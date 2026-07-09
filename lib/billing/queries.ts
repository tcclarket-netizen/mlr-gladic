import { createClient } from "@/lib/supabase/server"
import type { UserBilling } from "@/lib/billing/types"
import {
  getCaseProductEntitlements,
  type CaseProductEntitlements,
} from "@/lib/billing/case-entitlements"
import { getUsageSummary, type UsageSummary } from "@/lib/billing/usage-summary"

export async function getUserBilling(): Promise<UserBilling | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data } = await supabase
    .from("user_billing")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle()

  return (data as UserBilling | null) ?? null
}

export type CaseBillingContext = {
  usage: UsageSummary
  entitlements: CaseProductEntitlements
}

export async function getCaseBillingContext(caseId: string): Promise<CaseBillingContext | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const billing = await getUserBilling()
  const [usage, entitlements] = await Promise.all([
    getUsageSummary(supabase, user.id, billing),
    getCaseProductEntitlements(supabase, user.id, caseId, billing),
  ])

  return { usage, entitlements }
}
