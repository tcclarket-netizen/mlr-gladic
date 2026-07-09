import Link from "next/link"
import { CheckCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { FREE_TRIAL_OFFERING } from "@/lib/billing/plans"

type FreeTrialPlanCardProps = {
  isCurrent: boolean
  oppositionRemaining?: number
}

export function FreeTrialPlanCard({
  isCurrent,
  oppositionRemaining,
}: FreeTrialPlanCardProps) {
  const freeUnlockUsed =
    oppositionRemaining != null && oppositionRemaining <= 0 && isCurrent

  return (
    <div
      className={cn(
        "flex flex-col rounded-lg border bg-card md:col-span-2 xl:col-span-3",
        isCurrent ? "border-primary ring-1 ring-primary/20" : "border-border"
      )}
    >
      <div className="border-b border-border p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-foreground">{FREE_TRIAL_OFFERING.name}</h3>
          {isCurrent ? (
            <Badge
              variant="outline"
              className="border-accent/30 bg-accent/5 text-[10px] text-accent"
            >
              Current
            </Badge>
          ) : null}
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {FREE_TRIAL_OFFERING.headline}
            </p>
            <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="text-2xl font-semibold tracking-tight text-foreground">
                {FREE_TRIAL_OFFERING.priceLabel}
              </span>
              <span className="text-sm font-medium text-accent">
                {FREE_TRIAL_OFFERING.priceDetail}
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {FREE_TRIAL_OFFERING.description}
            </p>
            {isCurrent && oppositionRemaining != null ? (
              <p className="mt-3 text-xs text-muted-foreground">
                {oppositionRemaining > 0
                  ? `${oppositionRemaining} free Opposition Report™ unlock available`
                  : "Free Opposition Report™ unlock used"}
              </p>
            ) : null}
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {FREE_TRIAL_OFFERING.dashboardTitle}
            </p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {FREE_TRIAL_OFFERING.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-xs text-foreground">
                  <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-status-success" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground">Recommended for:</span>{" "}
          {FREE_TRIAL_OFFERING.recommendedFor}
        </p>
        {isCurrent && freeUnlockUsed ? (
          <Button variant="outline" size="sm" className="shrink-0" asChild>
            <Link href="/billing">Upgrade for more unlocks</Link>
          </Button>
        ) : (
          <Button size="sm" className="shrink-0" asChild>
            <Link href={FREE_TRIAL_OFFERING.ctaHref}>{FREE_TRIAL_OFFERING.ctaLabel}</Link>
          </Button>
        )}
      </div>
    </div>
  )
}
