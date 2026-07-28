import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"
import { normalizeReferralCode } from "@/lib/referrals/codes"

export async function attributeUserReferral(
  userId: string,
  rawCode: string | null | undefined
): Promise<{ ok: boolean; partnerId?: string }> {
  const code = normalizeReferralCode(rawCode)
  if (!code) return { ok: false }

  try {
    const admin = createAdminClient()

    const { data: existing } = await admin
      .from("user_referrals")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle()

    if (existing) return { ok: true }

    const { data: partner } = await admin
      .from("referral_partners")
      .select("id, code")
      .ilike("code", code)
      .eq("is_active", true)
      .maybeSingle()

    if (!partner) {
      console.error("[referral] no active partner for code", code)
      return { ok: false }
    }

    const { error } = await admin.from("user_referrals").insert({
      user_id: userId,
      partner_id: partner.id,
      referral_code: String(partner.code).toLowerCase(),
    })

    if (error) {
      if (error.code === "23505") return { ok: true }
      console.error("[referral] insert failed", error.message)
      return { ok: false }
    }

    return { ok: true, partnerId: partner.id }
  } catch (error) {
    console.error("[referral] attribution failed", error)
    return { ok: false }
  }
}
