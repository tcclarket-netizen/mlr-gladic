import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"
import { partnerCommissionCents } from "@/lib/referrals/commission"

export type ReferralPartnerRow = {
  id: string
  name: string
  code: string
  contact_email: string | null
  notes: string | null
  commission_percent: number
  is_active: boolean
  created_at: string
  signup_count: number
  revenue_cents: number
  commission_owed_cents: number
}

export type ReferralSignupRow = {
  user_id: string
  partner_id: string
  partner_name: string
  partner_code: string
  referral_code: string
  attributed_at: string
  full_name: string | null
  email: string | null
}

export type BillingLedgerRow = {
  id: string
  user_id: string
  partner_id: string | null
  partner_name: string | null
  partner_code: string | null
  entry_type: string
  amount_cents: number
  currency: string
  description: string | null
  stripe_reference_id: string | null
  occurred_at: string
  user_email: string | null
  user_name: string | null
}

export type ReferralRevenueByDay = {
  date: string
  revenue_cents: number
}

export async function getReferralAdminDashboard(): Promise<{
  partners: ReferralPartnerRow[]
  signups: ReferralSignupRow[]
  transactions: BillingLedgerRow[]
  revenueByDay: ReferralRevenueByDay[]
}> {
  const admin = createAdminClient()

  const [
    { data: partnersRaw },
    { data: signupsRaw },
    { data: ledgerRaw },
    { data: signupAgg },
    { data: revenueAgg },
  ] = await Promise.all([
    admin.from("referral_partners").select("*").order("name"),
    admin
      .from("user_referrals")
      .select(
        "user_id, partner_id, referral_code, attributed_at, referral_partners(name, code)"
      )
      .order("attributed_at", { ascending: false })
      .limit(100),
    admin
      .from("billing_ledger_entries")
      .select(
        "id, user_id, partner_id, entry_type, amount_cents, currency, description, stripe_reference_id, occurred_at, referral_partners(name, code)"
      )
      .order("occurred_at", { ascending: false })
      .limit(200),
    admin.from("user_referrals").select("partner_id"),
    admin.from("billing_ledger_entries").select("partner_id, amount_cents, occurred_at"),
  ])

  const signupCounts = new Map<string, number>()
  const revenueByPartner = new Map<string, number>()
  const revenueByDayMap = new Map<string, number>()

  for (const row of signupAgg ?? []) {
    signupCounts.set(row.partner_id, (signupCounts.get(row.partner_id) ?? 0) + 1)
  }

  for (const row of revenueAgg ?? []) {
    if (!row.partner_id) continue
    revenueByPartner.set(
      row.partner_id,
      (revenueByPartner.get(row.partner_id) ?? 0) + (row.amount_cents ?? 0)
    )

    const day = String(row.occurred_at ?? "").slice(0, 10)
    if (day) {
      revenueByDayMap.set(day, (revenueByDayMap.get(day) ?? 0) + (row.amount_cents ?? 0))
    }
  }

  const revenueByDay: ReferralRevenueByDay[] = []
  const today = new Date()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today)
    d.setUTCDate(d.getUTCDate() - i)
    const key = d.toISOString().slice(0, 10)
    revenueByDay.push({
      date: key,
      revenue_cents: revenueByDayMap.get(key) ?? 0,
    })
  }

  const partners: ReferralPartnerRow[] = (partnersRaw ?? []).map((p) => {
    const revenueCents = revenueByPartner.get(p.id) ?? 0
    const commissionPercent = Number(p.commission_percent ?? 0)
    return {
      id: p.id,
      name: p.name,
      code: p.code,
      contact_email: p.contact_email,
      notes: p.notes,
      commission_percent: commissionPercent,
      is_active: p.is_active,
      created_at: p.created_at,
      signup_count: signupCounts.get(p.id) ?? 0,
      revenue_cents: revenueCents,
      commission_owed_cents: partnerCommissionCents(revenueCents, commissionPercent),
    }
  })

  const userIds = new Set<string>()
  for (const s of signupsRaw ?? []) userIds.add(s.user_id)
  for (const t of ledgerRaw ?? []) userIds.add(t.user_id)

  const profileById = new Map<string, { full_name: string | null }>()
  if (userIds.size > 0) {
    const { data: profiles } = await admin
      .from("profiles")
      .select("id, full_name")
      .in("id", [...userIds])
    for (const profile of profiles ?? []) {
      profileById.set(profile.id, { full_name: profile.full_name })
    }
  }

  const emailById = new Map<string, string>()
  await Promise.all(
    [...userIds].map(async (userId) => {
      const { data, error } = await admin.auth.admin.getUserById(userId)
      if (!error && data.user?.email) {
        emailById.set(userId, data.user.email)
      }
    })
  )

  const signups: ReferralSignupRow[] = (signupsRaw ?? []).map((row) => {
    const partner = row.referral_partners as { name: string; code: string } | null
    return {
      user_id: row.user_id,
      partner_id: row.partner_id,
      partner_name: partner?.name ?? "—",
      partner_code: partner?.code ?? "—",
      referral_code: row.referral_code,
      attributed_at: row.attributed_at,
      full_name: profileById.get(row.user_id)?.full_name ?? null,
      email: emailById.get(row.user_id) ?? null,
    }
  })

  const transactions: BillingLedgerRow[] = (ledgerRaw ?? []).map((row) => {
    const partner = row.referral_partners as { name: string; code: string } | null
    return {
      id: row.id,
      user_id: row.user_id,
      partner_id: row.partner_id,
      partner_name: partner?.name ?? null,
      partner_code: partner?.code ?? null,
      entry_type: row.entry_type,
      amount_cents: row.amount_cents,
      currency: row.currency,
      description: row.description,
      stripe_reference_id: row.stripe_reference_id,
      occurred_at: row.occurred_at,
      user_email: emailById.get(row.user_id) ?? null,
      user_name: profileById.get(row.user_id)?.full_name ?? null,
    }
  })

  return { partners, signups, transactions, revenueByDay }
}
