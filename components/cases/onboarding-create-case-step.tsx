"use client"

import Link from "next/link"
import { useActionState, useEffect } from "react"
import { ArrowLeft, ArrowRight, FolderPlus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { US_STATES } from "@/lib/cases/constants"
import { createCase, type CaseActionState } from "@/lib/cases/actions"

const initialState: CaseActionState = {}

type OnboardingCreateCaseStepProps = {
  onBack: () => void
  onCreated: (caseId: string) => void
}

export function OnboardingCreateCaseStep({ onBack, onCreated }: OnboardingCreateCaseStepProps) {
  const [state, formAction, pending] = useActionState(createCase, initialState)
  const showUpgradeLink = state.error?.includes("Monthly case limit reached")

  useEffect(() => {
    if (state.caseId) {
      onCreated(state.caseId)
    }
    // Only advance when createCase returns a new case id
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.caseId])

  return (
    <div>
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
          <FolderPlus className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground">Create your first case</h2>
          <p className="text-xs text-muted-foreground">Cases organize reports, letters, and filings.</p>
        </div>
      </div>

      {state.error && (
        <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/8 px-3 py-2.5 text-sm text-destructive">
          <div className="flex items-center justify-between gap-3">
            <span>{state.error}</span>
            {showUpgradeLink ? (
              <Link
                href="/billing"
                className="shrink-0 rounded-sm underline underline-offset-2 transition-colors hover:text-foreground"
              >
                Upgrade plan
              </Link>
            ) : null}
          </div>
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="redirectTo" value="onboarding" />

        <div className="space-y-1.5">
          <Label htmlFor="clientName" className="text-xs font-medium">
            Client name
          </Label>
          <Input id="clientName" name="clientName" placeholder="e.g. Jane Doe" required />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="state" className="text-xs font-medium">
            State of residence
          </Label>
          <select
            id="state"
            name="state"
            required
            defaultValue=""
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
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

        <div className="mt-6 flex gap-3">
          <Button type="button" variant="outline" onClick={onBack} className="flex-1">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
          </Button>
          <Button type="submit" className="flex-1" disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Creating…
              </>
            ) : (
              <>
                Create Case <ArrowRight className="ml-1.5 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
