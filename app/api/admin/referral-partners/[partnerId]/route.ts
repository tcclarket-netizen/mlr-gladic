import { NextResponse } from "next/server"
import { requireAdminUser } from "@/lib/admin/require-admin"
import { createAdminClient } from "@/lib/supabase/admin"
import { normalizeReferralCode } from "@/lib/referrals/codes"
import { parseCommissionPercent } from "@/lib/referrals/commission"

export const runtime = "nodejs"

type RouteContext = { params: Promise<{ partnerId: string }> }

export async function PATCH(request: Request, context: RouteContext) {
  const { error } = await requireAdminUser()
  if (error) return error

  const { partnerId } = await context.params

  let body: {
    name?: string
    code?: string
    contactEmail?: string | null
    notes?: string | null
    isActive?: boolean
    commissionPercent?: number | string
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (body.name !== undefined) {
    const name = String(body.name).trim()
    if (!name) return NextResponse.json({ error: "Name cannot be empty." }, { status: 400 })
    updates.name = name
  }

  if (body.code !== undefined) {
    const code = normalizeReferralCode(String(body.code))
    if (!code) return NextResponse.json({ error: "Invalid referral code." }, { status: 400 })
    updates.code = code
  }

  if (body.contactEmail !== undefined) {
    updates.contact_email = body.contactEmail?.trim() || null
  }

  if (body.notes !== undefined) {
    updates.notes = body.notes?.trim() || null
  }

  if (body.isActive !== undefined) {
    updates.is_active = Boolean(body.isActive)
  }

  if (body.commissionPercent !== undefined) {
    const commissionPercent = parseCommissionPercent(body.commissionPercent)
    if (commissionPercent === null) {
      return NextResponse.json(
        { error: "Commission percent must be a number between 0 and 100." },
        { status: 400 }
      )
    }
    updates.commission_percent = commissionPercent
  }

  const admin = createAdminClient()
  const { data, error: dbError } = await admin
    .from("referral_partners")
    .update(updates)
    .eq("id", partnerId)
    .select("*")
    .single()

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json({ partner: data })
}
