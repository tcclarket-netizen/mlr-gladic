import type { BillingProduct } from "@/lib/billing/products"
import { BILLING_PRODUCT_LABELS } from "@/lib/billing/products"
import { formatProductQuotaLabel } from "@/lib/billing/display"
import type { ProductUsage } from "@/lib/billing/usage-summary"
import { cn } from "@/lib/utils"

type ProductQuotaBadgeProps = {
  product: BillingProduct
  usage: ProductUsage
  unlocked?: boolean
  className?: string
}

export function ProductQuotaBadge({
  product,
  usage,
  unlocked = false,
  className,
}: ProductQuotaBadgeProps) {
  if (unlocked) {
    return (
      <p className={cn("text-xs text-status-success", className)}>
        {BILLING_PRODUCT_LABELS[product]} unlocked for this case
      </p>
    )
  }

  return (
    <p className={cn("text-xs text-muted-foreground", className)}>
      {formatProductQuotaLabel(product, usage)}
    </p>
  )
}
