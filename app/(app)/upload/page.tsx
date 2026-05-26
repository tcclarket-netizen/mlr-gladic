"use client"

import { useState } from "react"
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, X, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type BureauKey = "experian" | "equifax" | "transunion"

interface BureauState {
  file: string | null
  status: "idle" | "uploading" | "ready" | "error"
  error: string
}

const bureaus: { key: BureauKey; name: string; color: string; abbr: string }[] = [
  { key: "experian", name: "Experian", color: "text-red-600", abbr: "EXP" },
  { key: "equifax", name: "Equifax", color: "text-blue-600", abbr: "EFX" },
  { key: "transunion", name: "TransUnion", color: "text-blue-800", abbr: "TU" },
]

export default function UploadPage() {
  const [files, setFiles] = useState<Record<BureauKey, BureauState>>({
    experian: { file: null, status: "idle", error: "" },
    equifax: { file: null, status: "idle", error: "" },
    transunion: { file: null, status: "idle", error: "" },
  })
  const [processing, setProcessing] = useState(false)
  const [processed, setProcessed] = useState(false)

  const handleFileDrop = (key: BureauKey, fileName: string) => {
    if (!fileName.endsWith(".pdf")) {
      setFiles((prev) => ({ ...prev, [key]: { file: null, status: "error", error: "Only PDF files are accepted." } }))
      return
    }
    setFiles((prev) => ({ ...prev, [key]: { file: fileName, status: "uploading", error: "" } }))
    setTimeout(() => {
      setFiles((prev) => ({ ...prev, [key]: { ...prev[key], status: "ready" } }))
    }, 1200)
  }

  const handleRemove = (key: BureauKey) => {
    setFiles((prev) => ({ ...prev, [key]: { file: null, status: "idle", error: "" } }))
  }

  const handleMockUpload = (key: BureauKey) => {
    handleFileDrop(key, `${key}-report.pdf`)
  }

  const readyCount = Object.values(files).filter((f) => f.status === "ready").length

  const handleProcess = () => {
    setProcessing(true)
    setTimeout(() => {
      setProcessing(false)
      setProcessed(true)
    }, 2200)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-8">
        <div className="mb-7">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Upload Bureau Reports</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload PDF reports from Experian, Equifax, and TransUnion. 3-bureau uploads produce the strongest analysis.
          </p>
        </div>

        {processed ? (
          <div className="rounded-xl border border-status-success/30 bg-status-success/5 px-6 py-10 text-center">
            <CheckCircle className="mx-auto mb-3 h-10 w-10 text-status-success" />
            <h2 className="text-base font-semibold text-foreground">Reports are being processed</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Extraction and normalization is underway. Your MY LEGAL REPORT™ will be ready shortly.
            </p>
            <Button className="mt-5" onClick={() => window.location.href = "/dashboard"}>
              Go to Dashboard
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {bureaus.map(({ key, name, color, abbr }) => {
                const state = files[key]
                return (
                  <div
                    key={key}
                    className={cn(
                      "rounded-lg border-2 border-dashed transition-colors",
                      state.status === "ready" ? "border-status-success/40 bg-status-success/5" :
                      state.status === "error" ? "border-destructive/40 bg-destructive/5" :
                      "border-border hover:border-primary/40 bg-card"
                    )}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault()
                      const f = e.dataTransfer.files[0]
                      if (f) handleFileDrop(key, f.name)
                    }}
                  >
                    <div className="flex items-center gap-4 px-5 py-5">
                      {/* Bureau indicator */}
                      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-card font-semibold text-sm", color)}>
                        {abbr}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={cn("text-sm font-semibold", color)}>{name}</span>
                          {state.status === "ready" && (
                            <CheckCircle className="h-3.5 w-3.5 text-status-success" />
                          )}
                        </div>
                        {state.status === "idle" && (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            Drag &amp; drop a PDF here, or click Upload
                          </p>
                        )}
                        {state.status === "uploading" && (
                          <div className="mt-1.5 flex items-center gap-2">
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Uploading {state.file}…</span>
                          </div>
                        )}
                        {state.status === "ready" && (
                          <p className="mt-0.5 text-xs text-status-success">{state.file} — ready</p>
                        )}
                        {state.status === "error" && (
                          <div className="mt-0.5 flex items-center gap-1.5">
                            <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                            <span className="text-xs text-destructive">{state.error}</span>
                          </div>
                        )}
                      </div>

                      <div className="shrink-0">
                        {state.status === "ready" ? (
                          <button
                            onClick={() => handleRemove(key)}
                            className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={state.status === "uploading"}
                            onClick={() => handleMockUpload(key)}
                          >
                            {state.status === "uploading" ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <><Upload className="mr-1.5 h-3.5 w-3.5" /> Upload</>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Warning */}
            <div className="mt-4 flex items-start gap-2 rounded-md border border-status-warning/30 bg-status-warning/5 px-4 py-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-status-warning" />
              <p className="text-xs leading-relaxed text-muted-foreground">
                <span className="font-medium text-foreground">Scanned or image-only PDFs</span> may require manual review. For best results, use
                the digital PDF downloaded directly from each bureau&apos;s website.
              </p>
            </div>

            {/* Privacy note */}
            <div className="mt-3 flex items-start gap-2 rounded-md bg-secondary/60 px-4 py-3">
              <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <p className="text-xs leading-relaxed text-muted-foreground">
                Your reports are encrypted at upload, stored with access controls, and never shared with third parties.
              </p>
            </div>

            {/* Progress & CTA */}
            <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{readyCount}/3 reports uploaded</p>
                <p className="text-xs text-muted-foreground">
                  {readyCount === 0 ? "Upload at least one report to continue." :
                   readyCount < 3 ? "You can process now or add more reports." :
                   "All three bureaus uploaded. Ready to process."}
                </p>
              </div>
              <Button
                onClick={handleProcess}
                disabled={readyCount === 0 || processing}
              >
                {processing ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing…</>
                ) : (
                  <>Process Reports</>
                )}
              </Button>
            </div>
          </>
        )}

        <p className="mt-8 text-[11px] leading-relaxed text-muted-foreground">
          TurnKey Credit is not a law firm. Documents generated from these reports are for educational and
          procedural self-help purposes only.
        </p>
      </div>
    </div>
  )
}
