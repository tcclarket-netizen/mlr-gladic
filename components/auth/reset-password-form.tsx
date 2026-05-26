"use client"

import { useActionState } from "react"
import { Mail, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { resetPassword, type AuthActionState } from "@/lib/supabase/actions"

const initialState: AuthActionState = {}

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(resetPassword, initialState)

  if (state.success) {
    return (
      <div className="rounded-md border border-status-success/30 bg-status-success/8 px-4 py-4 text-sm">
        <p className="font-medium text-foreground">Check your email</p>
        <p className="mt-1.5 text-muted-foreground">{state.success}</p>
      </div>
    )
  }

  return (
    <>
      {state.error && (
        <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/8 px-3 py-2.5 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-medium">
            Email address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              className="pl-9"
            />
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending…
            </>
          ) : (
            "Send Reset Link"
          )}
        </Button>
      </form>
    </>
  )
}
