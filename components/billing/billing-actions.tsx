"use client"

import { useState } from "react"
import { CreditCard, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { BillingInterval, BillingPlanKey } from "@/lib/billing/plans"

type Props = {
  hasCustomerPortal: boolean
}

export function BillingActions({ hasCustomerPortal }: Props) {
  const [pendingAction, setPendingAction] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const openPortal = async () => {
    setError(null)
    setPendingAction(true)
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })

      const data = (await res.json()) as { url?: string; error?: string }
      if (!res.ok || !data.url) {
        setError(data.error ?? "Unable to open billing portal.")
        return
      }

      window.location.href = data.url
    } catch {
      setError("Unable to connect to billing. Please try again.")
    } finally {
      setPendingAction(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={openPortal}
        disabled={!hasCustomerPortal || pendingAction}
      >
        {pendingAction ? (
          <>
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Opening…
          </>
        ) : (
          <>
            <CreditCard className="mr-1.5 h-3.5 w-3.5" /> Manage Payment
          </>
        )}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

export function PlanCheckoutButton({
  planKey,
  interval = "month",
  disabled,
  label,
}: {
  planKey: BillingPlanKey
  interval?: BillingInterval
  disabled?: boolean
  label: string
}) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCheckout = async () => {
    setError(null)
    setPending(true)
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planKey, interval }),
      })
      const data = (await res.json()) as { url?: string; error?: string }
      if (!res.ok || !data.url) {
        setError(data.error ?? "Unable to start checkout.")
        return
      }
      window.location.href = data.url
    } catch {
      setError("Unable to connect to billing.")
    } finally {
      setPending(false)
    }
  }

  return (
    <div>
      <Button className="w-full" size="sm" disabled={disabled || pending} onClick={handleCheckout}>
        {pending ? (
          <>
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            Redirecting…
          </>
        ) : (
          label
        )}
      </Button>
      {error ? <p className="mt-1 text-[11px] text-destructive">{error}</p> : null}
    </div>
  )
}

export function ActivateAdminPlanButton({
  disabled,
  label = "Activate admin access",
}: {
  disabled?: boolean
  label?: string
}) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleActivate = async () => {
    setError(null)
    setPending(true)
    try {
      const res = await fetch("/api/billing/activate-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
      const data = (await res.json()) as { success?: boolean; error?: string }
      if (!res.ok || !data.success) {
        setError(data.error ?? "Unable to activate admin plan.")
        return
      }
      window.location.href = "/billing?plan=admin"
    } catch {
      setError("Unable to activate admin plan.")
    } finally {
      setPending(false)
    }
  }

  return (
    <div>
      <Button className="w-full" size="sm" disabled={disabled || pending} onClick={handleActivate}>
        {pending ? (
          <>
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            Activating…
          </>
        ) : (
          label
        )}
      </Button>
      {error ? <p className="mt-1 text-[11px] text-destructive">{error}</p> : null}
    </div>
  )
}
