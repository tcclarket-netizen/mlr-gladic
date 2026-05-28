import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { caseReferenceCode } from "@/lib/cases/constants"
import { generateLegalReportDocx } from "@/lib/report-generation/legal-report-docx"
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
  const docxBuffer = await generateLegalReportDocx(content, reference)
  const filename = `MY-LEGAL-REPORT-${reference}.docx`

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
