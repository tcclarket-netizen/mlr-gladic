"use client"

import { useCallback, useRef, useState } from "react"
import { Upload, CheckCircle, AlertCircle, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { BUREAUS, CREDIT_REPORTS_BUCKET, storagePathForReport } from "@/lib/cases/constants"
import { BureauLogo } from "@/components/cases/bureau-logo"
import { recordReportUpload, removeReportUpload } from "@/lib/cases/actions"
import type { Bureau, UploadedReport } from "@/types/case"

type BureauKey = Bureau

type BureauSlotState = {
  fileName: string | null
  status: "idle" | "uploading" | "ready" | "error"
  error: string
}

type BureauUploadPanelProps = {
  caseId: string
  userId: string
  existingReports?: UploadedReport[]
  compact?: boolean
  onUploadComplete?: () => void
  disabledReason?: string | null
}

function initialSlots(existingReports?: UploadedReport[]) {
  const slots: Record<BureauKey, BureauSlotState> = {
    experian: { fileName: null, status: "idle", error: "" },
    equifax: { fileName: null, status: "idle", error: "" },
    transunion: { fileName: null, status: "idle", error: "" },
  }

  for (const report of existingReports ?? []) {
    slots[report.bureau] = {
      fileName: report.file_name,
      status: "ready",
      error: "",
    }
  }

  return slots
}

export function BureauUploadPanel({
  caseId,
  userId,
  existingReports,
  compact = false,
  onUploadComplete,
  disabledReason,
}: BureauUploadPanelProps) {
  const [slots, setSlots] = useState(() => initialSlots(existingReports))
  const fileInputRefs = useRef<Record<BureauKey, HTMLInputElement | null>>({
    experian: null,
    equifax: null,
    transunion: null,
  })

  const uploadFile = useCallback(
    async (bureau: BureauKey, file: File) => {
      if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
        setSlots((prev) => ({
          ...prev,
          [bureau]: { fileName: null, status: "error", error: "Only PDF files are accepted." },
        }))
        return
      }

      if (file.size > 50 * 1024 * 1024) {
        setSlots((prev) => ({
          ...prev,
          [bureau]: {
            fileName: null,
            status: "error",
            error: "File must be under 50 MB.",
          },
        }))
        return
      }

      setSlots((prev) => ({
        ...prev,
        [bureau]: { fileName: file.name, status: "uploading", error: "" },
      }))

      const path = storagePathForReport(userId, caseId, bureau, file.name)
      const supabase = createClient()

      const { error: uploadError } = await supabase.storage
        .from(CREDIT_REPORTS_BUCKET)
        .upload(path, file, { upsert: true, contentType: "application/pdf" })

      if (uploadError) {
        setSlots((prev) => ({
          ...prev,
          [bureau]: {
            fileName: null,
            status: "error",
            error: uploadError.message,
          },
        }))
        return
      }

      const result = await recordReportUpload({
        caseId,
        bureau,
        filePath: path,
        fileName: file.name,
        fileSize: file.size,
      })

      if (result.error) {
        setSlots((prev) => ({
          ...prev,
          [bureau]: { fileName: null, status: "error", error: result.error! },
        }))
        return
      }

      setSlots((prev) => ({
        ...prev,
        [bureau]: { fileName: file.name, status: "ready", error: "" },
      }))
      onUploadComplete?.()
    },
    [caseId, userId, onUploadComplete]
  )

  const handleRemove = async (bureau: BureauKey) => {
    setSlots((prev) => ({
      ...prev,
      [bureau]: { fileName: null, status: "uploading", error: "" },
    }))

    const result = await removeReportUpload(caseId, bureau)

    if (result.error) {
      setSlots((prev) => ({
        ...prev,
        [bureau]: { fileName: null, status: "error", error: result.error! },
      }))
      return
    }

    setSlots((prev) => ({
      ...prev,
      [bureau]: { fileName: null, status: "idle", error: "" },
    }))
    onUploadComplete?.()
  }

  const readyCount = Object.values(slots).filter((s) => s.status === "ready").length

  return (
    <div className="space-y-4">
      {BUREAUS.map(({ key, name, color }) => {
        const state = slots[key]
        return (
          <div key={key}>
            <input
              ref={(el) => {
                fileInputRefs.current[key] = el
              }}
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) uploadFile(key, file)
                e.target.value = ""
              }}
            />
            <div
              className={cn(
                "rounded-lg border-2 border-dashed transition-colors",
                state.status === "ready"
                  ? "border-status-success/40 bg-status-success/5"
                  : state.status === "error"
                    ? "border-destructive/40 bg-destructive/5"
                    : "border-border hover:border-primary/40 bg-card",
                compact ? "px-4 py-3" : "px-5 py-5"
              )}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                if (disabledReason) return
                e.preventDefault()
                const file = e.dataTransfer.files[0]
                if (file) uploadFile(key, file)
              }}
            >
              <div className="flex items-center gap-4">
                <BureauLogo bureau={key} />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={cn("text-sm font-semibold", color)}>{name}</span>
                    {state.status === "ready" && (
                      <CheckCircle className="h-3.5 w-3.5 text-status-success" />
                    )}
                  </div>
                  {state.status === "idle" && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Drag & drop a PDF, or click Upload
                    </p>
                  )}
                  {state.status === "uploading" && (
                    <div className="mt-1.5 flex items-center gap-2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        Uploading {state.fileName}…
                      </span>
                    </div>
                  )}
                  {state.status === "ready" && (
                    <p className="mt-0.5 truncate text-xs text-status-success">
                      {state.fileName}
                    </p>
                  )}
                  {state.status === "error" && (
                    <div className="mt-0.5 flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0 text-destructive" />
                      <span className="text-xs text-destructive">{state.error}</span>
                    </div>
                  )}
                </div>

                <div className="shrink-0">
                  {state.status === "ready" ? (
                    <button
                      type="button"
                      onClick={() => handleRemove(key)}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      type="button"
                      disabled={state.status === "uploading" || Boolean(disabledReason)}
                      onClick={() => fileInputRefs.current[key]?.click()}
                    >
                      {state.status === "uploading" ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <>
                          <Upload className="mr-1.5 h-3.5 w-3.5" /> Upload
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}

      <p className="text-xs text-muted-foreground">
        {readyCount}/3 bureau reports uploaded
        {readyCount < 3 && " — 3-bureau uploads produce the strongest analysis."}
      </p>
      {disabledReason ? (
        <p className="text-xs text-muted-foreground">{disabledReason}</p>
      ) : null}
    </div>
  )
}
