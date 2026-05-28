"use client"

import { useState } from "react"
import { CreditCard, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

type Props = {
  selectedPlanKey: string | null
  hasCustomerPortal: boolean
  showCheckout?: boolean
}

export function BillingActions({
  selectedPlanKey,
  hasCustomerPortal,
  showCheckout = true,
}: Props) {
  const [pendingAction, setPendingAction] = useState<"checkout" | "portal" | null>(null)
  const [error, setError] = useState<string | null>(null)

  const runAction = async (path: string, body: Record<string, unknown>, action: "checkout" | "portal") => {
    setError(null)
    setPendingAction(action)
    try {
      const res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data = (await res.json()) as { url?: string; error?: string }
      if (!res.ok || !data.url) {
        setError(data.error ?? "Unable to start billing flow.")
        return
      }

      window.location.href = data.url
    } catch {
      setError("Unable to connect to billing. Please try again.")
    } finally {
      setPendingAction(null)
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => runAction("/api/stripe/portal", {}, "portal")}
          disabled={!hasCustomerPortal || pendingAction !== null}
        >
          {pendingAction === "portal" ? (
            <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Opening…</>
          ) : (
            <><CreditCard className="mr-1.5 h-3.5 w-3.5" /> Manage Payment</>
          )}
        </Button>

        {showCheckout ? (
          <Button
            size="sm"
            onClick={() =>
              runAction(
                "/api/stripe/checkout",
                { planKey: selectedPlanKey ?? "consultant" },
                "checkout"
              )
            }
            disabled={!selectedPlanKey || pendingAction !== null}
          >
            {pendingAction === "checkout" ? "Starting checkout…" : "Upgrade / Change Plan"}
          </Button>
        ) : null}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

export function PlanCheckoutButton({
  planKey,
  disabled,
  label,
}: {
  planKey: string
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
        body: JSON.stringify({ planKey }),
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
