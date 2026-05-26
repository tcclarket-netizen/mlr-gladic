"use client"

import { useState, useTransition } from "react"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { startCaseProcessing } from "@/lib/cases/actions"

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
      {error && <p className="text-xs text-destructive">{error}</p>}
      <Button
        disabled={disabled || uploadCount === 0 || pending}
        onClick={() => {
          setError(null)
          startTransition(async () => {
            const result = await startCaseProcessing(caseId)
            if (result.error) {
              setError(result.error)
              return
            }
            router.refresh()
            router.push(`/cases/${caseId}`)
          })
        }}
      >
        {pending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing…
          </>
        ) : (
          "Process Reports"
        )}
      </Button>
    </div>
  )
}
