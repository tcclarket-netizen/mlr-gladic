import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { caseReferenceCode } from "@/lib/cases/constants"
import { generateLegalReportPdf } from "@/lib/report-generation/legal-report-pdf"
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
