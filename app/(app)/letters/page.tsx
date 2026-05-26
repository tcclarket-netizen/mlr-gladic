"use client"

import { useState } from "react"
import { Download, Eye, Mail, Building2, FileText, ChevronRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type LetterCategory = "all" | "cra" | "furnisher" | "agency"

const letters = [
  {
    id: "LTR-001",
    type: "cra",
    bureau: "Experian",
    recipient: "Experian Information Solutions",
    subject: "Dispute — Capital One Account (FCRA § 611)",
    status: "Ready",
    date: "May 24, 2026",
    preview: `To Whom It May Concern,\n\nPursuant to the Fair Credit Reporting Act (FCRA) § 611, I am writing to dispute the accuracy of the following item(s) appearing on my credit report...\n\nAccount: Capital One (ending 4821)\nDispute Basis: Balance inconsistency between bureaus; requesting verification of reported balance.\n\nPlease investigate this matter and provide written notice of your findings within 30 days...\n\n[Signature block]`,
  },
  {
    id: "LTR-002",
    type: "cra",
    bureau: "All 3",
    recipient: "Experian, Equifax, TransUnion",
    subject: "Dispute — Portfolio Recovery Collection Account",
    status: "Ready",
    date: "May 24, 2026",
    preview: `To Whom It May Concern,\n\nPursuant to FCRA § 611, I dispute the following collection account appearing on my credit report as inaccurate and potentially time-barred...\n\nCreditor: Portfolio Recovery Associates\nAccount Type: Collection\nDispute Basis: Method of verification requested; potential statute of limitations issue under applicable state law.\n\n[Continues...]`,
  },
  {
    id: "LTR-003",
    type: "furnisher",
    bureau: "Experian",
    recipient: "Capital One, N.A.",
    subject: "Method of Verification Request (FCRA § 623)",
    status: "Draft",
    date: "May 24, 2026",
    preview: `To Whom It May Concern,\n\nPursuant to FCRA § 623(b), I am requesting that you provide the method of verification used to confirm the accuracy of information reported to the consumer reporting agencies regarding the following account...\n\n[Account details]\n\nThis request is being made in conjunction with a formal dispute submitted to the consumer reporting agencies.`,
  },
  {
    id: "LTR-004",
    type: "furnisher",
    bureau: "All 3",
    recipient: "Portfolio Recovery Associates",
    subject: "Cease Collection Activity & Debt Validation Request",
    status: "Needs Review",
    date: "May 24, 2026",
    preview: `To Whom It May Concern,\n\nPursuant to the Fair Debt Collection Practices Act (FDCPA) § 809, I am formally requesting validation of the alleged debt referenced above...\n\nPlease provide: the original creditor name, account number, amount claimed, and verification that collection activity is permitted under applicable state law.\n\n[Continues...]`,
  },
]

const statusColors: Record<string, string> = {
  Ready: "text-status-success bg-status-success/10 border-status-success/20",
  Draft: "text-muted-foreground bg-muted border-border",
  "Needs Review": "text-status-warning bg-status-warning/10 border-status-warning/20",
  Sent: "text-status-pending bg-status-pending/10 border-status-pending/20",
}

export default function LettersPage() {
  const [filter, setFilter] = useState<LetterCategory>("all")
  const [preview, setPreview] = useState<typeof letters[0] | null>(null)

  const filtered = filter === "all" ? letters : letters.filter((l) => l.type === filter)

  const categories: { key: LetterCategory; label: string; icon: typeof Mail }[] = [
    { key: "all", label: "All Letters", icon: Mail },
    { key: "cra", label: "CRA Letters", icon: FileText },
    { key: "furnisher", label: "Furnisher Letters", icon: Building2 },
    { key: "agency", label: "Agency Letters", icon: Building2 },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dispute Letter Center</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Generated letters for CRAs, furnishers, and agency filings.
            </p>
          </div>
          <Button size="sm">
            <Mail className="mr-1.5 h-3.5 w-3.5" /> Generate More Letters
          </Button>
        </div>

        <div className="flex gap-5">
          {/* Sidebar filter */}
          <div className="w-48 shrink-0">
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <nav className="py-2">
                {categories.map(({ key, label, icon: Icon }) => {
                  const count = key === "all" ? letters.length : letters.filter((l) => l.type === key).length
                  return (
                    <button
                      key={key}
                      onClick={() => setFilter(key)}
                      className={cn(
                        "flex w-full items-center justify-between px-4 py-2.5 text-sm transition-colors",
                        filter === key
                          ? "bg-primary/8 text-primary font-medium"
                          : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {label}
                      </div>
                      <span className="text-xs">{count}</span>
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Letter list */}
          <div className="flex-1 min-w-0 space-y-3">
            {filtered.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-card py-12 text-center">
                <Mail className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No letters in this category.</p>
              </div>
            ) : (
              filtered.map((letter) => (
                <div key={letter.id} className="rounded-lg border border-border bg-card">
                  <div className="flex items-start gap-4 px-5 py-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10">
                      <Mail className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-foreground truncate">{letter.subject}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            To: {letter.recipient} · {letter.date}
                          </p>
                        </div>
                        <span className={cn("shrink-0 inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium", statusColors[letter.status])}>
                          {letter.status}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => setPreview(letter)}>
                          <Eye className="mr-1.5 h-3.5 w-3.5" /> Preview
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="mr-1.5 h-3.5 w-3.5" /> Download
                        </Button>
                        <span className="font-mono text-[11px] text-muted-foreground ml-auto">{letter.id}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Preview drawer */}
      {preview && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setPreview(null)} />
          <div className="relative z-10 flex h-full w-full max-w-lg flex-col bg-card shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-foreground">{preview.id}</p>
                <p className="text-xs text-muted-foreground truncate max-w-64">{preview.subject}</p>
              </div>
              <button onClick={() => setPreview(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <div className="mb-4 flex items-center gap-2">
                <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium", statusColors[preview.status])}>
                  {preview.status}
                </span>
                <span className="text-xs text-muted-foreground">To: {preview.recipient}</span>
              </div>
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
                {preview.preview}
              </pre>
            </div>
            <div className="border-t border-border flex items-center gap-2 p-4">
              <Button className="flex-1" size="sm">
                <Download className="mr-1.5 h-3.5 w-3.5" /> Download PDF
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <Download className="mr-1.5 h-3.5 w-3.5" /> Download DOCX
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
