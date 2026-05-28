import Link from "next/link"
import { notFound } from "next/navigation"
import { FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getCaseExtractionData } from "@/lib/cases/queries"
import { LegalReportViewer } from "@/components/cases/legal-report-viewer"

export default async function CaseReportPage({
  params,
}: {
  params: Promise<{ caseId: string }>
}) {
  const { caseId } = await params
  const data = await getCaseExtractionData(caseId)

  if (!data) {
    notFound()
  }

  if (!data.legalReport || data.legalReport.status !== "ready") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <FileText className="mb-4 h-10 w-10 text-muted-foreground/40" />
        <h1 className="text-lg font-semibold text-foreground">Report not ready</h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Upload bureau PDFs and run Process Reports to generate MY LEGAL REPORT™.
        </p>
        <Button className="mt-6" asChild>
          <Link href={`/cases/${caseId}/upload`}>Go to Upload</Link>
        </Button>
      </div>
    )
  }

  return (
    <LegalReportViewer
      caseId={caseId}
      clientName={data.case.client_name}
      caseState={data.case.state}
      report={data.legalReport}
    />
  )
}
