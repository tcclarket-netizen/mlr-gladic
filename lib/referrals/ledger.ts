import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"

export type BillingLedgerEntryType = "subscription" | "pay_per_report" | "other"

type RecordLedgerInput = {
  userId: string
  entryType: BillingLedgerEntryType
  amountCents: number
  currency?: string
  description?: string | null
  stripeReferenceId?: string | null
  occurredAt?: string
  metadata?: Record<string, unknown>
}

export async function recordBillingLedgerEntry(input: RecordLedgerInput): Promise<void> {
  if (input.amountCents <= 0) return

  const admin = createAdminClient()

  if (input.stripeReferenceId) {
    const { data: existing } = await admin
      .from("billing_ledger_entries")
      .select("id")
      .eq("stripe_reference_id", input.stripeReferenceId)
      .maybeSingle()
    if (existing) return
  }

  const { data: referral } = await admin
    .from("user_referrals")
    .select("partner_id")
    .eq("user_id", input.userId)
    .maybeSingle()

  const { error } = await admin.from("billing_ledger_entries").insert({
    user_id: input.userId,
    partner_id: referral?.partner_id ?? null,
    entry_type: input.entryType,
    amount_cents: input.amountCents,
    currency: (input.currency ?? "usd").toLowerCase(),
    description: input.description ?? null,
    stripe_reference_id: input.stripeReferenceId ?? null,
    occurred_at: input.occurredAt ?? new Date().toISOString(),
    metadata: input.metadata ?? {},
  })

  if (error && error.code !== "23505") {
    console.error("[billing_ledger] insert failed", error.message)
  }
}
