"use client"

import { useState, useTransition } from "react"
import { Download, FileText, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { caseReferenceCode } from "@/lib/cases/constants"
import { UnlockProductButton } from "@/components/billing/unlock-product-button"
import { ProductQuotaBadge } from "@/components/billing/product-quota-badge"
import type { ProductUsage } from "@/lib/billing/usage-summary"
import type { LegalReportContent } from "@/types/legal-report"

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
            <h3 className="text-sm font-semibold text-foreground">MY SELF REPORT™</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Official Florida pre-suit complaint package. The template fills{" "}
              <span className="font-medium text-foreground">{`{CLIENT FULL NAME}`}</span> and{" "}
              <span className="font-medium text-foreground">{`{COUNTY}`}</span> from your MY
              LEGAL REPORT™ case data. All other content stays exactly as in the template.
            </p>
            <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
              <li>
                {`{CLIENT FULL NAME}`}: {legalReportContent.client_name}
              </li>
              <li>
                {`{COUNTY}`}: {caseCounty?.trim() ? caseCounty : "Not set on this case"}
              </li>
              <li>Case: {reference}</li>
              <li>State: {legalReportContent.case_state}</li>
            </ul>
            {!caseCounty?.trim() && (
              <p className="mt-3 text-xs text-destructive">
                County is missing on this case. Create a new case with county filled in, or add
                county support for existing cases to complete the self-report caption.
              </p>
            )}
          </div>
        </div>
        <div className="mt-4 space-y-3">
          <ProductQuotaBadge product="self" usage={selfUsage} unlocked={selfUnlocked} />
          {selfUnlocked ? (
            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={handleDownloadDocx} disabled={docPending}>
                {docPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Download Self-Report (.docx)
              </Button>
            </div>
          ) : (
            <UnlockProductButton
              caseId={caseId}
              product="self"
              usage={selfUsage}
              unlocked={selfUnlocked}
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
