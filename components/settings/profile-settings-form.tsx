"use client"

import { useActionState, useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateProfileSettings, type SettingsActionState } from "@/lib/settings/actions"
import type { AccountType } from "@/types/profile"

const initialState: SettingsActionState = {}

type ProfileSettingsFormProps = {
  fullName: string
  accountType: AccountType
  email: string
}

export function ProfileSettingsForm({ fullName, accountType, email }: ProfileSettingsFormProps) {
  const router = useRouter()
  const [state, formAction, pending] = useActionState(updateProfileSettings, initialState)
  const [fullNameValue, setFullNameValue] = useState(fullName)
  const [accountTypeValue, setAccountTypeValue] = useState<AccountType>(accountType)

  useEffect(() => {
    if (state.success) {
      router.refresh()
    }
  }, [router, state.success])

  useEffect(() => {
    if (state.fullName) {
      setFullNameValue(state.fullName)
    }
    if (state.accountType) {
      setAccountTypeValue(state.accountType)
    }
  }, [state.accountType, state.fullName])

  return (
    <form action={formAction} className="space-y-4">
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

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="fullName" className="text-xs font-medium">
            Full name
          </Label>
          <Input
            id="fullName"
            name="fullName"
            value={fullNameValue}
            onChange={(e) => setFullNameValue(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-medium">
            Email
          </Label>
          <Input id="email" value={email} disabled />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="accountType" className="text-xs font-medium">
            Account type
          </Label>
          <select
            id="accountType"
            name="accountType"
            value={accountTypeValue}
            onChange={(e) => setAccountTypeValue(e.target.value as AccountType)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="consumer">Consumer</option>
            <option value="consultant">Credit Consultant</option>
            <option value="legal">Law Office / Legal Support</option>
          </select>
        </div>
      </div>

      <Button type="submit" size="sm" disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            Saving...
          </>
        ) : (
          "Save profile"
        )}
      </Button>
    </form>
  )
}
