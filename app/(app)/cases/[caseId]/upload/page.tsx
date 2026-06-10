import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, AlertCircle, Lock } from "lucide-react"
import { getCaseById } from "@/lib/cases/queries"
import { getCurrentUser } from "@/lib/supabase/profile"
import { caseReferenceCode } from "@/lib/cases/constants"
import { BureauUploadPanel } from "@/components/cases/bureau-upload-panel"
import { ProcessReportsButton } from "@/components/cases/process-reports-button"
import { getUserBilling } from "@/lib/billing/queries"
import { getProcessingEntitlement, getUploadEntitlement } from "@/lib/billing/entitlements"

export default async function CaseUploadPage({
  params,
}: {
  params: Promise<{ caseId: string }>
}) {
  const { caseId } = await params
  const [caseData, user, billing] = await Promise.all([
    getCaseById(caseId),
    getCurrentUser(),
    getUserBilling(),
  ])

  if (!caseData || !user) {
    notFound()
  }

  const uploadCount = caseData.uploaded_reports.length
  const reference = caseReferenceCode(caseData.id)
  const entitlement = getProcessingEntitlement(billing)
  const uploadEntitlement = getUploadEntitlement(billing)

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-8">
        <Link
          href={`/cases/${caseId}`}
          className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to {caseData.client_name}
        </Link>

        <div className="mb-7">
          <p className="font-mono text-xs text-muted-foreground">{reference}</p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Upload Bureau Reports
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload PDF reports for {caseData.client_name}. 3-bureau uploads produce the strongest
            analysis.
          </p>
        </div>

        <BureauUploadPanel
          caseId={caseId}
          userId={user.id}
          existingReports={caseData.uploaded_reports}
          disabledReason={uploadEntitlement.allowed ? null : uploadEntitlement.reason ?? null}
        />

        <div className="mt-4 flex items-start gap-2 rounded-md border border-status-warning/30 bg-status-warning/5 px-4 py-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-status-warning" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">Scanned or image-only PDFs</span>&nbsp;may
            require manual review. For best results, use the digital PDF from each bureau&apos;s
            website.
          </p>
        </div>

        <div className="mt-3 flex items-start gap-2 rounded-md bg-secondary/60 px-4 py-3">
          <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            Files are stored under your account with encryption and access controls. Only you can
            access this case&apos;s documents.
          </p>
        </div>

        <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">
              {uploadCount}/3 reports uploaded
            </p>
            <p className="text-xs text-muted-foreground">
              {uploadCount === 0
                ? "Upload at least one report to continue."
                : uploadCount < 3
                  ? "You can process now or add more reports."
                  : "All three bureaus uploaded."}
            </p>
          </div>
          <ProcessReportsButton
            caseId={caseId}
            uploadCount={uploadCount}
            disabledReason={entitlement.allowed ? null : entitlement.reason ?? null}
          />
        </div>

        <p className="mt-8 text-[11px] leading-relaxed text-muted-foreground">
          TurnKey Credit is not a law firm. Documents generated from these reports are for
          educational and procedural self-help purposes only.
        </p>
      </div>
    </div>
  )
}
