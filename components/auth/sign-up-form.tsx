"use client"

import { useActionState, useState } from "react"
import { Eye, EyeOff, Loader2, Lock, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button"
import { signUp, type AuthActionState } from "@/lib/supabase/actions"
import { cn } from "@/lib/utils"

const accountTypes = [
  { value: "consumer", label: "Consumer", desc: "Managing my own credit" },
  { value: "consultant", label: "Credit Consultant", desc: "Working with multiple clients" },
  { value: "legal", label: "Law Office / Legal Support", desc: "Legal support or attorney practice" },
]

function getPasswordStrength(password: string) {
  if (password.length === 0) return 0
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  return score
}

const strengthLabels = ["", "Weak", "Fair", "Good", "Strong", "Very strong"]
const strengthColors = [
  "",
  "bg-destructive",
  "bg-status-warning",
  "bg-status-warning",
  "bg-status-success",
  "bg-status-success",
]

const initialState: AuthActionState = {}

export function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState("")
  const [accountType, setAccountType] = useState("consumer")
  const [agreed, setAgreed] = useState(false)
  const [state, formAction, pending] = useActionState(signUp, initialState)

  const strength = getPasswordStrength(password)

  if (state.success) {
    return (
      <div className="rounded-md border border-status-success/30 bg-status-success/8 px-4 py-4 text-sm text-foreground">
        <p className="font-medium">Confirm your email</p>
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
          <Label htmlFor="fullName" className="text-xs font-medium">
            Full name
          </Label>
          <Input id="fullName" name="fullName" placeholder="Jane Doe" required />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-medium">
            Email address
          </Label>
          <Input id="email" name="email" type="email" placeholder="you@example.com" required />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-xs font-medium">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {password.length > 0 && (
            <div className="space-y-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-colors",
                      i <= strength ? strengthColors[strength] : "bg-border"
                    )}
                  />
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground">{strengthLabels[strength]}</p>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirm" className="text-xs font-medium">
            Confirm password
          </Label>
          <Input
            id="confirm"
            name="confirm"
            type="password"
            placeholder="Re-enter password"
            required
            minLength={8}
          />
        </div>

        <input type="hidden" name="accountType" value={accountType} />

        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Account type</Label>
          <div className="space-y-2">
            {accountTypes.map(({ value, label, desc }) => (
              <button
                key={value}
                type="button"
                onClick={() => setAccountType(value)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-md border px-3 py-2.5 text-left transition-colors",
                  accountType === value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40"
                )}
              >
                <div
                  className={cn(
                    "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                    accountType === value ? "border-primary bg-primary" : "border-muted-foreground"
                  )}
                >
                  {accountType === value && (
                    <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground">{label}</p>
                  <p className="text-[11px] text-muted-foreground">{desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <label className="flex cursor-pointer items-start gap-2.5">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="sr-only"
          />
          <div
            onClick={() => setAgreed(!agreed)}
            className={cn(
              "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
              agreed ? "border-primary bg-primary" : "border-input"
            )}
          >
            {agreed && <CheckCircle2 className="h-3 w-3 text-primary-foreground" />}
          </div>
          <span className="text-[11px] leading-relaxed text-muted-foreground">
            I understand this platform provides educational and self-help document tools, not
            legal representation.
          </span>
        </label>

        <Button type="submit" className="w-full" disabled={pending || !agreed}>
          {pending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account…
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">or</span>
        <Separator className="flex-1" />
      </div>

      <GoogleSignInButton />

      <div className="mt-5 flex items-start gap-2 rounded-md bg-secondary/60 px-3 py-2.5">
        <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Your reports are encrypted, access-controlled, and never shared without your permission.
        </p>
      </div>
    </>
  )
}
