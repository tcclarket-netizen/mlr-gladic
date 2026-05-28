"use client"

import { useState, useTransition } from "react"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

type ProcessReportsButtonProps = {
  caseId: string
  uploadCount: number
  disabled?: boolean
}

export function ProcessReportsButton({
  caseId,
  uploadCount,
  disabled,
}: ProcessReportsButtonProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  return (
    <div className="flex flex-col items-end gap-2">
      {error && (
        <p className="max-w-xs text-right text-xs text-destructive">{error}</p>
      )}
      <Button
        disabled={disabled || uploadCount === 0 || pending}
        onClick={() => {
          setError(null)
          startTransition(async () => {
            try {
              const res = await fetch(`/api/cases/${caseId}/process`, {
                method: "POST",
              })
              const data = (await res.json()) as { error?: string; success?: boolean }

              if (!res.ok) {
                setError(data.error ?? "Processing failed.")
                return
              }

              router.refresh()
              router.push(`/cases/${caseId}`)
            } catch {
              setError("Network error. Please try again.")
            }
          })
        }}
      >
        {pending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Extracting & generating report…
          </>
        ) : (
          "Process Reports"
        )}
      </Button>
      {pending && (
        <p className="max-w-xs text-right text-[11px] text-muted-foreground">
          This may take 1–3 minutes per bureau. Do not close this tab.
        </p>
      )}
    </div>
  )
}
