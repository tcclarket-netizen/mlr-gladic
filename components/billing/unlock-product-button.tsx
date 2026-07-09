"use client"

import { useState } from "react"
import Link from "next/link"
import { Loader2, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { BillingProduct } from "@/lib/billing/products"
import {
  BILLING_PRODUCT_LABELS,
  BILLING_PRODUCT_UNLOCK_VERBS,
} from "@/lib/billing/products"
import { formatUnlockConfirmMessage } from "@/lib/billing/display"
import { isUnlimitedQuota } from "@/lib/billing/plans"
import type { ProductUsage } from "@/lib/billing/usage-summary"
import { ProductQuotaBadge } from "@/components/billing/product-quota-badge"

type UnlockProductButtonProps = {
  caseId: string
  product: BillingProduct
  usage: ProductUsage
  unlocked: boolean
  onUnlocked?: () => void
  returnTab?: string
  size?: "sm" | "default"
  className?: string
}

export function UnlockProductButton({
  caseId,
  product,
  usage,
  unlocked,
  onUnlocked,
  returnTab,
  size = "default",
  className,
}: UnlockProductButtonProps) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const confirm = formatUnlockConfirmMessage(product, usage)
  const unlimited = isUnlimitedQuota(usage.limit)
  const canUnlock = unlimited || (usage.limit > 0 && usage.remaining > 0)

  const handleUnlock = async () => {
    setError(null)
    setPending(true)
    try {
      const res = await fetch(`/api/cases/${caseId}/unlock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product }),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        setError(data.error ?? "Unable to unlock.")
        return
      }
      onUnlocked?.()
      if (returnTab !== undefined) {
        const url = new URL(window.location.href)
        if (returnTab === "overview") {
          url.searchParams.delete("tab")
        } else {
          url.searchParams.set("tab", returnTab)
        }
        window.location.href = url.toString()
      } else {
        window.location.reload()
      }
    } catch {
      setError("Unable to connect. Please try again.")
    } finally {
      setPending(false)
    }
  }

  if (unlocked) {
    return <ProductQuotaBadge product={product} usage={usage} unlocked className={className} />
  }

  if (usage.limit <= 0) {
    return (
      <div className={className}>
        <p className="text-xs text-muted-foreground">
          {BILLING_PRODUCT_LABELS[product]} is not included on your plan.
        </p>
        <Button variant="outline" size={size} className="mt-2" asChild>
          <Link href="/billing">View membership plans</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className={className}>
      <ProductQuotaBadge product={product} usage={usage} />
      {!unlimited && usage.remaining <= 0 ? (
        <div className="mt-3 space-y-2">
          <p className="text-xs text-muted-foreground">
            No unlocks left this billing period. Upgrade or wait for your next renewal.
          </p>
          <Button variant="outline" size={size} asChild>
            <Link href="/billing">Upgrade plan</Link>
          </Button>
        </div>
      ) : (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size={size} className="mt-3" disabled={!canUnlock || pending}>
              {pending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Lock className="mr-2 h-4 w-4" />
              )}
              {BILLING_PRODUCT_UNLOCK_VERBS[product]}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{confirm.title}</AlertDialogTitle>
              <AlertDialogDescription>{confirm.body}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleUnlock} disabled={pending}>
                {pending ? "Unlocking…" : "Confirm unlock"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}
    </div>
  )
}
