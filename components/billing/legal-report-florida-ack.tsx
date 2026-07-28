"use client"

import { MapPin } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

type LegalReportStateAckProps = {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

/** @deprecated Use LegalReportStateAck — kept for import path stability */
export const LegalReportFloridaAck = LegalReportStateAck

export function LegalReportStateAck({
  checked,
  onCheckedChange,
}: LegalReportStateAckProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-muted/20 text-left">
      <div className="flex items-start gap-3 border-b border-border/70 px-3.5 py-3">
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10">
          <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold leading-snug text-foreground">
              State Jurisdiction Notice
            </p>
            <span className="rounded border border-destructive/30 bg-destructive/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-destructive">
              Required
            </span>
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            Confirm the case state matches your matter before unlocking.
          </p>
        </div>
      </div>

      <div className="space-y-2.5 px-3.5 py-3">
        <div className="max-h-32 space-y-2 overflow-y-auto rounded-md border border-border/60 bg-background px-3 py-2.5 text-[11px] leading-relaxed text-muted-foreground">
          <p>
            MY LEGAL REPORT™ applies state-specific authority modules based on
            the state you selected for this case. Section 3A and related
            state-law references are generated for that jurisdiction.
          </p>
          <p>
            If the wrong state is on file, update the case before generating or
            unlocking this report. This tool is educational and self-help only;
            it is not legal advice or representation.
          </p>
        </div>

        <label
          htmlFor="legal-report-state-ack"
          className={cn(
            "flex cursor-pointer items-start gap-2.5 rounded-md border px-3 py-2.5 transition-colors",
            checked
              ? "border-primary/30 bg-primary/5"
              : "border-border bg-background hover:bg-muted/40"
          )}
        >
          <Checkbox
            id="legal-report-state-ack"
            checked={checked}
            onCheckedChange={(value) => onCheckedChange(value === true)}
            className="mt-0.5"
          />
          <span className="text-[11px] leading-relaxed text-foreground">
            <span className="font-medium">I acknowledge and agree</span> that
            this report will use the state jurisdiction recorded on my case.
          </span>
        </label>
      </div>
    </div>
  )
}
