import Link from "next/link"
import { notFound } from "next/navigation"
import { FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getCaseExtractionData } from "@/lib/cases/queries"
import { getCaseBillingContext } from "@/lib/billing/queries"
import { LegalReportViewer } from "@/components/cases/legal-report-viewer"
import { UnlockProductButton } from "@/components/billing/unlock-product-button"

export default async function CaseReportPage({
  params,
}: {
  params: Promise<{ caseId: string }>
}) {
  const { caseId } = await params
  const [data, billingContext] = await Promise.all([
    getCaseExtractionData(caseId),
    getCaseBillingContext(caseId),
  ])

  if (!data || !billingContext) {
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

  const legalUnlocked = billingContext.entitlements.legal

  if (!legalUnlocked) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 text-center">
        <FileText className="mb-4 h-10 w-10 text-muted-foreground/40" />
        <h1 className="text-lg font-semibold text-foreground">Unlock MY LEGAL REPORT™</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your legal report has been generated. Unlock it to view the full report and download
          documents for this case.
        </p>
        <div className="mt-6 w-full rounded-lg border border-border bg-card p-5 text-left">
          <UnlockProductButton
            caseId={caseId}
            product="legal"
            usage={billingContext.usage.legal}
            unlocked={false}
          />
        </div>
        <Button variant="outline" className="mt-6" asChild>
          <Link href={`/cases/${caseId}`}>Back to case</Link>
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
      legalUsage={billingContext.usage.legal}
      legalUnlocked={legalUnlocked}
    />
  )
}
