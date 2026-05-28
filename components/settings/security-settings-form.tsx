"use client"

import { useActionState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { sendPasswordResetEmail, type SettingsActionState } from "@/lib/settings/actions"

const initialState: SettingsActionState = {}

export function SecuritySettingsForm() {
  const [state, formAction, pending] = useActionState(sendPasswordResetEmail, initialState)

  return (
    <form action={formAction} className="space-y-3">
      {state.error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/8 px-3 py-2 text-xs text-destructive">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="rounded-md border border-status-success/30 bg-status-success/8 px-3 py-2 text-xs text-status-success">
          {state.success}
        </p>
      ) : null}
      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            Sending...
          </>
        ) : (
          "Send password reset email"
        )}
      </Button>
    </form>
  )
}
