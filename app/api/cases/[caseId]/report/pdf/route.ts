import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { caseReferenceCode } from "@/lib/cases/constants"
import { generateLegalReportPdf } from "@/lib/report-generation/legal-report-pdf"
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

  const unlocked = await isCaseProductUnlocked(supabase, user.id, caseId, "legal", billing)
  if (!unlocked) {
    return NextResponse.json(
      { error: "Unlock MY LEGAL REPORT™ for this case before downloading." },
      { status: 402 }
    )
  }

  const { data: report, error } = await supabase
    .from("generated_reports")
    .select("content, status")
    .eq("case_id", caseId)
    .eq("user_id", user.id)
    .eq("report_type", "legal_report")
    .maybeSingle()

  if (error || !report || report.status !== "ready") {
    return NextResponse.json({ error: "Report not found or not ready." }, { status: 404 })
  }

  const content = report.content as LegalReportContent
  const reference = caseReferenceCode(caseId)
  const pdfBuffer = await generateLegalReportPdf(content, reference)
  const filename = `MY-LEGAL-REPORT-${reference}.pdf`

  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-cache",
    },
  })
}
