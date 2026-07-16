import { MapPin } from "lucide-react"

export function FloridaMembershipNotice() {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-muted/20">
      <div className="flex items-start gap-3 border-b border-border/70 px-3.5 py-3">
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10">
          <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold leading-snug text-foreground">
              Florida Availability Notice
            </p>
            <span className="rounded border border-destructive/30 bg-destructive/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-destructive">
              Important
            </span>
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            Read before purchasing a membership that includes MY LEGAL REPORT™ or MY SELF REPORT™.
          </p>
        </div>
      </div>

      <div className="space-y-2 px-3.5 py-3 text-[11px] leading-relaxed text-muted-foreground">
        <p>
          If you are not located in Florida, or your credit reporting matter does not involve
          Florida, do not purchase a subscription that includes MY LEGAL REPORT™ or MY SELF
          REPORT™ at this time.
        </p>
        <p>
          These reports are currently configured for Florida-based consumer credit reporting
          matters only. Reports for other states remain in beta and are not yet available for use.
        </p>
      </div>
    </div>
  )
}
