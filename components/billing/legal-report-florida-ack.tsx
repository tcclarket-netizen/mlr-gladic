"use client"

import { MapPin } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

type LegalReportFloridaAckProps = {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

export function LegalReportFloridaAck({
  checked,
  onCheckedChange,
}: LegalReportFloridaAckProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-muted/20 text-left">
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
              Required
            </span>
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            Confirm this report applies to Florida before unlocking.
          </p>
        </div>
      </div>

      <div className="space-y-2.5 px-3.5 py-3">
        <div className="max-h-32 space-y-2 overflow-y-auto rounded-md border border-border/60 bg-background px-3 py-2.5 text-[11px] leading-relaxed text-muted-foreground">
          <p>
            MY LEGAL REPORT™ is currently configured for Florida-based consumer
            credit reporting matters only at this current moment. If you are not
            located in Florida, or your credit reporting issue does not involve
            Florida, do not generate this report at this time.
          </p>
          <p>
            Reports for other states are currently in beta and are not yet
            available for use.
          </p>
        </div>

        <label
          htmlFor="legal-report-florida-ack"
          className={cn(
            "flex cursor-pointer items-start gap-2.5 rounded-md border px-3 py-2.5 transition-colors",
            checked
              ? "border-primary/30 bg-primary/5"
              : "border-border bg-background hover:bg-muted/40"
          )}
        >
          <Checkbox
            id="legal-report-florida-ack"
            checked={checked}
            onCheckedChange={(value) => onCheckedChange(value === true)}
            className="mt-0.5"
          />
          <span className="text-[11px] leading-relaxed text-foreground">
            <span className="font-medium">I acknowledge and agree</span> that MY
            LEGAL REPORT™ is currently available for Florida-based matters only.
          </span>
        </label>
      </div>
    </div>
  )
}
