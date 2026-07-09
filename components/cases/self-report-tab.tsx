"use client"

import { useState, useTransition } from "react"
import { Download, FileText, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { caseReferenceCode } from "@/lib/cases/constants"
import { UnlockProductButton } from "@/components/billing/unlock-product-button"
import { ProductQuotaBadge } from "@/components/billing/product-quota-badge"
import type { ProductUsage } from "@/lib/billing/usage-summary"
import type { LegalReportContent } from "@/types/legal-report"

const SELF_REPORT_DELIVERABLES = [
  "Evidence-Preservation List",
  "Pre-Filled Agency Complaint Templates",
  "Correction Roadmap",
  "Evidence Gap Mapping",
  "Procedural Risk Forecast",
  "Verification Requests",
  "Documentary Support Requests",
  "Method-of-Verification Requests",
  "Findings Rejection Notices",
  "Investigation Deficiency Notices",
  "Agency Complaint Preparation",
  "Evidence Index",
  "Follow-Up and Escalation Roadmap",
  "Litigation-Readiness Organization",
] as const

type SelfReportTabProps = {
  caseId: string
  legalReportContent: LegalReportContent
  caseCounty?: string | null
  selfUsage: ProductUsage
  selfUnlocked: boolean
}

export function SelfReportTab({
  caseId,
  legalReportContent,
  caseCounty,
  selfUsage,
  selfUnlocked,
}: SelfReportTabProps) {
  const reference =
    legalReportContent.case_reference || caseReferenceCode(caseId)
  const [docError, setDocError] = useState<string | null>(null)
  const [docPending, startDocTransition] = useTransition()

  const handleDownloadDocx = () => {
    setDocError(null)
    startDocTransition(async () => {
      try {
        const res = await fetch(`/api/cases/${caseId}/self-report/docx`)
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { error?: string }
          setDocError(data.error ?? "Failed to generate self-report document.")
          return
        }
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `MY-SELF-REPORT-${reference}.docx`
        a.click()
        URL.revokeObjectURL(url)
      } catch {
        setDocError("Failed to download self-report. Please try again.")
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10">
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-foreground">
              My Self Report — What do I document, preserve, file, and do next?
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Official Florida pre-suit complaint package. Purchased self-help action documentation.
              Build your record and follow the process — structured instruments, evidence preservation,
              complaint templates, and a step-by-step roadmap.
            </p>

            <dl className="mt-4 grid gap-2 text-xs sm:grid-cols-2">
              <div>
                <dt className="font-medium text-foreground">Consumer Name:</dt>
                <dd className="text-muted-foreground">{legalReportContent.client_name}</dd>
              </div>
              <div>
                <dt className="font-medium text-foreground">Consumer County:</dt>
                <dd className="text-muted-foreground">
                  {caseCounty?.trim() ? caseCounty : "Not set on this case"}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-foreground">State of Residence:</dt>
                <dd className="text-muted-foreground">{legalReportContent.case_state}</dd>
              </div>
              <div>
                <dt className="font-medium text-foreground">Case:</dt>
                <dd className="font-mono text-muted-foreground">{reference}</dd>
              </div>
            </dl>

            {!caseCounty?.trim() && (
              <p className="mt-3 text-xs text-destructive">
                County is missing on this case. Create a new case with county filled in, or add
                county support for existing cases to complete the self-report caption.
              </p>
            )}

            <div className="mt-5 border-t border-border pt-4">
              <h4 className="text-xs font-semibold text-foreground">What you receive</h4>
              <p className="mt-1 text-xs text-muted-foreground">
                Everything you need to act, packaged for results.
              </p>
              <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
                {SELF_REPORT_DELIVERABLES.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <span className="mt-0.5 text-foreground/60">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-3 border-t border-border pt-4">
          {selfUnlocked ? (
            <>
              <ProductQuotaBadge product="self" usage={selfUsage} unlocked />
              <Button onClick={handleDownloadDocx} disabled={docPending}>
                {docPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Download Self-Report (.docx)
              </Button>
            </>
          ) : (
            <UnlockProductButton
              caseId={caseId}
              product="self"
              usage={selfUsage}
              unlocked={selfUnlocked}
              returnTab="self-report"
              size="sm"
            />
          )}
        </div>
        {docError && <p className="mt-3 text-xs text-destructive">{docError}</p>}
      </div>

      <p className="text-[11px] leading-relaxed text-muted-foreground">
        This package is an educational, self-help form set. Review every form, verify all facts,
        attach evidence, and consult a licensed attorney before filing. GLADIC AI™ is not a law
        firm.
      </p>
    </div>
  )
}
