"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { ArrowLeft, Download, FileText, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { caseReferenceCode } from "@/lib/cases/constants"
import { formatCaseDate } from "@/lib/cases/display"
import { sectionHeading } from "@/lib/report-generation/report-format"
import type { GeneratedReport, LegalReportContent } from "@/types/legal-report"

type LegalReportViewerProps = {
  caseId: string
  clientName: string
  caseState: string
  report: GeneratedReport
}

function normalizeContent(content: LegalReportContent): LegalReportContent {
  if (content.cover && content.table_of_contents?.length) {
    return content
  }

  const sections = (content.sections ?? []).map((s, i) => ({
    ...s,
    number: s.number ?? i + 1,
  }))

  return {
    ...content,
    cover: content.cover ?? {
      title: "MY LEGAL REPORT™",
      subtitle:
        "Credit Rights, Deterrence, Rebuttal & Jurisdiction Preservation Report",
      prepared_by: "GLADIC AI™",
      classification: "Educational & Self-Help Legal Interpretation",
      client_capacity: "Self-Represented Consumer (28 U.S.C. § 1654)",
      scope: "Federal & State (as applicable)",
      delivery_format: "AI-Fillable DOCX",
      record_type: "Administrative & Procedural Enforcement File",
    },
    notice_of_limitation: content.notice_of_limitation ?? content.disclaimer,
    table_of_contents: content.table_of_contents ?? sections.map((s) => s.title),
    case_reference: content.case_reference ?? "",
    sections,
  }
}

export function LegalReportViewer({
  caseId,
  clientName,
  caseState,
  report,
}: LegalReportViewerProps) {
  const content = normalizeContent(report.content)
  const [activeSection, setActiveSection] = useState(content.sections[0]?.id ?? "1")
  const reference = content.case_reference || caseReferenceCode(caseId)
  const section = content.sections.find((s) => s.id === activeSection)
  const [showToc, setShowToc] = useState(false)

  const [docError, setDocError] = useState<string | null>(null)
  const [docPending, startDocTransition] = useTransition()

  const handleDownloadMarkdown = () => {
    const blob = new Blob([report.markdown ?? ""], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `MY-LEGAL-REPORT-${reference}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDownloadDocx = () => {
    setDocError(null)
    startDocTransition(async () => {
      try {
        const res = await fetch(`/api/cases/${caseId}/report/docx`)
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { error?: string }
          setDocError(data.error ?? "Failed to generate Word document.")
          return
        }
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `MY-LEGAL-REPORT-${reference}.docx`
        a.click()
        URL.revokeObjectURL(url)
      } catch {
        setDocError("Failed to download Word document. Please try again.")
      }
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-6xl gap-6 px-6 py-8">
        <aside className="hidden w-60 shrink-0 lg:block">
          <Link
            href={`/cases/${caseId}`}
            className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to case
          </Link>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Table of Contents
          </p>
          <nav className="max-h-[calc(100vh-12rem)] space-y-0.5 overflow-y-auto pr-1">
            {content.sections.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setActiveSection(s.id)
                  setShowToc(false)
                }}
                className={`block w-full rounded-md px-2 py-1.5 text-left text-[11px] leading-snug transition-colors ${
                  activeSection === s.id
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                <span className="font-mono text-[10px] opacity-70">{s.number}.</span> {s.title}
              </button>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h1 className="text-xl font-semibold tracking-tight">{content.cover.title}</h1>
              </div>
              <p className="text-sm text-muted-foreground">{content.cover.subtitle}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {clientName} · {caseState} · <span className="font-mono">{reference}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Generated {formatCaseDate(report.generated_at)}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex flex-wrap items-center justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setShowToc((v) => !v)}
                >
                  Contents
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadMarkdown}
                  disabled={!report.markdown}
                >
                  <Download className="mr-1.5 h-3.5 w-3.5" /> Markdown
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadDocx}
                  disabled={docPending}
                >
                  {docPending ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Word…
                    </>
                  ) : (
                    <>
                      <Download className="mr-1.5 h-3.5 w-3.5" /> Word (.docx)
                    </>
                  )}
                </Button>
              </div>
              {docError && <p className="text-xs text-destructive">{docError}</p>}
            </div>
          </div>

          {showToc && (
            <div className="mb-4 rounded-lg border border-border bg-card p-4 lg:hidden">
              <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                Sections
              </p>
              <div className="flex flex-wrap gap-1">
                {content.sections.map((s) => (
                  <Button
                    key={s.id}
                    size="sm"
                    variant={activeSection === s.id ? "default" : "outline"}
                    onClick={() => {
                      setActiveSection(s.id)
                      setShowToc(false)
                    }}
                  >
                    {s.number}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6 rounded-lg border border-border bg-secondary/40 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Notice of limitation
            </p>
            <p className="mt-2 whitespace-pre-wrap text-[11px] leading-relaxed text-muted-foreground">
              {content.notice_of_limitation}
            </p>
          </div>

          {section ? (
            <article className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                {sectionHeading(section.number, section.title)}
              </p>
              <div className="mt-4 whitespace-pre-wrap font-mono text-sm leading-relaxed text-foreground/90">
                {section.body}
              </div>
            </article>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-2 lg:hidden">
            {content.sections.map((s) => (
              <Button
                key={s.id}
                size="sm"
                variant={activeSection === s.id ? "default" : "outline"}
                onClick={() => setActiveSection(s.id)}
              >
                {s.number}
              </Button>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
