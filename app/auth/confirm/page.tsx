"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import type { EmailOtpType } from "@supabase/supabase-js"
import { MarketingAuthShell } from "@/components/marketing/marketing-auth-shell"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

function ConfirmInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"working" | "done" | "needs-signin">("working")
  const [message, setMessage] = useState("Confirming your email…")

  useEffect(() => {
    let cancelled = false

    async function run() {
      const tokenHash = searchParams.get("token_hash")
      const type = searchParams.get("type") as EmailOtpType | null
      const code = searchParams.get("code")
      const nextRaw = searchParams.get("next") ?? "/onboarding"
      const next = nextRaw.startsWith("/") ? nextRaw : "/onboarding"

      const supabase = createClient()

      try {
        if (tokenHash && type) {
          const { error } = await supabase.auth.verifyOtp({
            type,
            token_hash: tokenHash,
          })
          if (error) throw error
        } else if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) throw error
        } else {
          const {
            data: { user },
          } = await supabase.auth.getUser()
          if (!user) {
            if (!cancelled) {
              setStatus("needs-signin")
              setMessage("Your email may already be confirmed. Sign in to continue.")
            }
            return
          }
        }

        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          if (!cancelled) {
            setStatus("needs-signin")
            setMessage("Your email is confirmed. Sign in to continue.")
          }
          return
        }

        if (!cancelled) {
          setStatus("done")
          setMessage("Email confirmed. Redirecting…")
          router.replace(next)
        }
      } catch {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user) {
          if (!cancelled) {
            setStatus("done")
            router.replace(next)
          }
          return
        }
        if (!cancelled) {
          setStatus("needs-signin")
          setMessage(
            "This confirmation link was already used or expired. If your email is confirmed, sign in below."
          )
        }
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [router, searchParams])

  return (
    <div className="text-center">
      {status === "working" || status === "done" ? (
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-[#2454FF]" />
          <p className="text-sm text-[#526174]">{message}</p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-[#526174]">{message}</p>
          <Button asChild className="w-full">
            <Link href={`/sign-in?confirmed=1&next=${encodeURIComponent("/onboarding")}`}>
              Sign in
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}

export default function AuthConfirmPage() {
  return (
    <MarketingAuthShell title="Confirming email">
      <Suspense
        fallback={
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-[#2454FF]" />
            <p className="text-sm text-[#526174]">Confirming your email…</p>
          </div>
        }
      >
        <ConfirmInner />
      </Suspense>
    </MarketingAuthShell>
  )
}
