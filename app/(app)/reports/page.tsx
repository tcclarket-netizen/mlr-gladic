"use client"

import { useState } from "react"
import { Download, FileText, ChevronRight, AlertCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const sections = [
  "1. Case Summary",
  "2. Bureau Comparison",
  "3. Tradeline Analysis",
  "4. Negative Item Review",
  "5. Collection Accounts",
  "6. Inquiry Analysis",
  "7. Verification Assessment",
  "8. Procedural Recommendations",
  "9. Applicable Statutes",
  "10. Dispute Basis Index",
]

const reportContent: Record<string, { title: string; body: string }> = {
  "1. Case Summary": {
    title: "Case Summary",
    body: `Client: Jane Doe
Case ID: CAS-1042
State: California
Report Date: May 24, 2026
Bureaus Analyzed: Experian, Equifax, TransUnion

OVERVIEW
This report provides a structured procedural review of the credit profile associated with the above client. The analysis is based on data extracted from three bureau reports obtained directly from Experian, Equifax, and TransUnion.

FINDINGS SUMMARY
— Average credit score: 581 (subprime range)
— Total tradelines: 12
— Negative tradelines: 5
— Collection accounts: 2 (combined balance: $3,240)
— Hard inquiries (last 12 months): 3
— Average utilization: 74%

This report is educational and procedural in nature. It does not constitute legal advice.`,
  },
  "3. Tradeline Analysis": {
    title: "Tradeline Analysis",
    body: `TRADELINE CROSS-BUREAU REVIEW

12 tradelines identified across all three bureaus.

DISCREPANCIES NOTED
— Capital One (ending 4821): Balance reported as $2,100 on Experian but $2,050 on Equifax. Minor inconsistency.
— Portfolio Recovery (ending 7742): Reported on all three bureaus as open collection. No payment history after charge-off.

FLAGGED FOR VERIFICATION
5 tradelines have been flagged for procedural verification review based on accuracy, completeness, and timeliness under the FCRA.

NEXT STEPS
Proceed to the Verification Assessment section for recommended procedural steps for each flagged account.`,
  },
  "8. Procedural Recommendations": {
    title: "Procedural Recommendations",
    body: `Based on the findings in this report, the following procedural steps are recommended for educational and self-help purposes:

1. DISPUTE INACCURATE INFORMATION
Submit written disputes to all three CRAs for any tradeline where the balance, status, or dates appear inconsistent or unverifiable.

2. REQUEST METHOD OF VERIFICATION
For tradelines marked "Method Needed," submit verification requests to both the CRA and the data furnisher under FCRA Section 611 and 623.

3. DOCUMENT ALL CORRESPONDENCE
Maintain a dated record of all dispute letters, certified mail receipts, and response letters.

4. MONITOR RESPONSE TIMELINES
CRAs are required to complete investigation within 30 days (45 days if supplemental information is submitted). Track dates carefully.

5. CONSIDER REGULATORY FILINGS
If CRAs fail to respond adequately, consider filing with the CFPB, FTC, and/or state AG office.

This report does not constitute legal advice. These steps are for informational and self-help purposes only.`,
  },
}

export default function LegalReportPage() {
  const [activeSection, setActiveSection] = useState(sections[0])
  const [status] = useState<"Draft" | "Generated" | "Needs Review">("Generated")

  const statusColor = {
    Draft: "text-muted-foreground bg-muted border-border",
    Generated: "text-status-success bg-status-success/10 border-status-success/20",
    "Needs Review": "text-status-warning bg-status-warning/10 border-status-warning/20",
  }

  const content = reportContent[activeSection] ?? {
    title: activeSection.replace(/^\d+\. /, ""),
    body: "This section is being generated. Please check back shortly.",
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-semibold tracking-tight text-foreground">MY LEGAL REPORT™</h1>
              <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium", statusColor[status])}>
                {status}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Jane Doe · CAS-1042 · Generated May 24, 2026</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="mr-1.5 h-3.5 w-3.5" /> Download DOCX
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-1.5 h-3.5 w-3.5" /> Download PDF
            </Button>
            <Button size="sm" onClick={() => window.location.href = "/letters"}>
              Generate Dispute Pack <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mb-5 flex items-start gap-2 rounded-md border border-status-warning/30 bg-status-warning/5 px-4 py-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-status-warning" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">Educational use only.</span> This report is procedural and informational in nature.
            TurnKey Credit is not a law firm and does not provide legal advice. No outcomes are guaranteed.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="flex gap-5">
          {/* Sidebar */}
          <div className="w-56 shrink-0">
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="border-b border-border px-4 py-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Report Sections</p>
              </div>
              <nav className="py-2">
                {sections.map((section) => (
                  <button
                    key={section}
                    onClick={() => setActiveSection(section)}
                    className={cn(
                      "flex w-full items-center gap-2 px-4 py-2 text-left text-xs transition-colors",
                      activeSection === section
                        ? "bg-primary/8 text-primary font-medium"
                        : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                    )}
                  >
                    {reportContent[section] ? (
                      <div className="h-1.5 w-1.5 rounded-full bg-status-success shrink-0" />
                    ) : (
                      <div className="h-1.5 w-1.5 rounded-full bg-border shrink-0" />
                    )}
                    <span className="text-left leading-tight">{section}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Document panel */}
          <div className="flex-1 min-w-0">
            <div className="rounded-lg border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <h2 className="text-sm font-semibold text-foreground">{content.title}</h2>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="px-6 py-6">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
                  {content.body}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
