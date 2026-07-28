import { NextResponse } from "next/server"
import { requireAdminUser } from "@/lib/admin/require-admin"
import { createAdminClient } from "@/lib/supabase/admin"
import { normalizeReferralCode, referralCodeFromPartnerName } from "@/lib/referrals/codes"
import { parseCommissionPercent } from "@/lib/referrals/commission"

export const runtime = "nodejs"

export async function GET() {
  const { error } = await requireAdminUser()
  if (error) return error

  const admin = createAdminClient()
  const { data, error: dbError } = await admin
    .from("referral_partners")
    .select("*")
    .order("name")

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json({ partners: data ?? [] })
}

export async function POST(request: Request) {
  const { error } = await requireAdminUser()
  if (error) return error

  let body: {
    name?: string
    code?: string
    contactEmail?: string
    notes?: string
    commissionPercent?: number | string
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const name = String(body.name ?? "").trim()
  if (!name) {
    return NextResponse.json({ error: "Partner name is required." }, { status: 400 })
  }

  const requestedCode = body.code?.trim()
  let code = normalizeReferralCode(requestedCode) ?? referralCodeFromPartnerName(name)
  if (!code) {
    return NextResponse.json({ error: "Invalid referral code." }, { status: 400 })
  }

  const commissionPercent =
    body.commissionPercent === undefined || body.commissionPercent === ""
      ? 0
      : parseCommissionPercent(body.commissionPercent)
  if (commissionPercent === null) {
    return NextResponse.json(
      { error: "Commission percent must be a number between 0 and 100." },
      { status: 400 }
    )
  }

  const admin = createAdminClient()
  const now = new Date().toISOString()

  for (let attempt = 0; attempt < 5; attempt++) {
    const { data, error: insertError } = await admin
      .from("referral_partners")
      .insert({
        name,
        code,
        contact_email: body.contactEmail?.trim() || null,
        notes: body.notes?.trim() || null,
        commission_percent: commissionPercent,
        is_active: true,
        updated_at: now,
      })
      .select("*")
      .single()

    if (!insertError) {
      return NextResponse.json({ partner: data })
    }

    if (insertError.code === "23505" && !requestedCode) {
      code = `${code}-${Math.random().toString(36).slice(2, 6)}`
      continue
    }

    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  return NextResponse.json({ error: "Could not create a unique partner code." }, { status: 500 })
}
