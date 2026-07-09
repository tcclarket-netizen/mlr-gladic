"use client"

import { useActionState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { US_STATES } from "@/lib/cases/constants"
import { createCase, type CaseActionState } from "@/lib/cases/actions"

const initialState: CaseActionState = {}

type CaseFormProps = {
  redirectTo?: "case" | "upload" | "onboarding"
  submitLabel?: string
}

export function CaseForm({
  redirectTo = "case",
  submitLabel = "Create Case",
}: CaseFormProps) {
  const [state, formAction, pending] = useActionState(createCase, initialState)

  return (
    <>
      {state.error && (
        <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/8 px-3 py-2.5 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="redirectTo" value={redirectTo} />

        <div className="space-y-1.5">
          <Label htmlFor="clientName" className="text-xs font-medium">
            Client name
          </Label>
          <Input
            id="clientName"
            name="clientName"
            placeholder="e.g. Jane Doe"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="county" className="text-xs font-medium">
            County
          </Label>
          <Input
            id="county"
            name="county"
            placeholder="e.g. Broward"
            required
          />
          <p className="text-[11px] text-muted-foreground">
            Used for MY SELF REPORT™.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="state" className="text-xs font-medium">
            State of residence
          </Label>
          <select
            id="state"
            name="state"
            required
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
            defaultValue=""
          >
            <option value="" disabled>
              Select state…
            </option>
            {US_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="notes" className="text-xs font-medium">
            Notes <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Textarea
            id="notes"
            name="notes"
            placeholder="Any relevant background or context…"
            rows={3}
          />
        </div>

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating…
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </form>
    </>
  )
}
