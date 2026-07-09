import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { caseReferenceCode } from "@/lib/cases/constants"
import { buildSelfReportFillInput } from "@/lib/report-generation/build-self-report-data"
import { generateSelfReportDocx } from "@/lib/report-generation/self-report-docx"
import { getMembershipEntitlement } from "@/lib/billing/entitlements"
import { isCaseProductUnlocked } from "@/lib/billing/case-entitlements"
import type { LegalReportContent } from "@/types/legal-report"

export const runtime = "nodejs"

export async function GET(
  _request: Request,
  context: { params: Promise<{ caseId: string }> }
) {
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
    .select("plan_key, billing_status, current_period_start, current_period_end")
    .eq("user_id", user.id)
    .maybeSingle()

  const membership = getMembershipEntitlement(billing)
  if (!membership.allowed) {
    return NextResponse.json(
      { error: membership.reason ?? "Your membership is not active." },
      { status: 402 }
    )
  }

  const unlocked = await isCaseProductUnlocked(supabase, user.id, caseId, "self", billing)
  if (!unlocked) {
    return NextResponse.json(
      { error: "Unlock MY SELF REPORT™ for this case before downloading." },
      { status: 402 }
    )
  }

  const [reportRes, caseRes] = await Promise.all([
    supabase
      .from("generated_reports")
      .select("content, status")
      .eq("case_id", caseId)
      .eq("user_id", user.id)
      .eq("report_type", "legal_report")
      .maybeSingle(),
    supabase.from("cases").select("county").eq("id", caseId).eq("user_id", user.id).maybeSingle(),
  ])

  if (reportRes.error || !reportRes.data || reportRes.data.status !== "ready") {
    return NextResponse.json({ error: "Legal report not found or not ready." }, { status: 404 })
  }

  const content = reportRes.data.content as LegalReportContent
  const reference = content.case_reference || caseReferenceCode(caseId)
  const fillInput = buildSelfReportFillInput({
    content,
    caseCounty: caseRes.data?.county,
  })

  const docxBuffer = await generateSelfReportDocx(fillInput)
  const filename = `MY-SELF-REPORT-${reference}.docx`

  return new NextResponse(new Uint8Array(docxBuffer), {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-cache",
    },
  })
}
