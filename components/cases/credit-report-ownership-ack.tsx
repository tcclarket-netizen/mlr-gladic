"use client"

import { useState } from "react"
import { ChevronDown, Shield } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { GLADIC_BRAND } from "@/lib/brand"
import { cn } from "@/lib/utils"

export const CREDIT_REPORT_OWNERSHIP_FIELD = "creditReportOwnershipAck"

type CreditReportOwnershipAckProps = {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  invalid?: boolean
}

export function CreditReportOwnershipAck({
  checked,
  onCheckedChange,
  invalid = false,
}: CreditReportOwnershipAckProps) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border bg-muted/20",
        invalid ? "border-destructive/50" : "border-border"
      )}
    >
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex w-full items-start gap-3 px-3.5 py-3 text-left transition-colors hover:bg-muted/40"
          >
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10">
              <Shield className="h-3.5 w-3.5 text-primary" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-semibold leading-snug text-foreground">
                  Credit Report Ownership &amp; Authorization
                </p>
                <span className="rounded border border-destructive/30 bg-destructive/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-destructive">
                  Required
                </span>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                Required before uploading any credit report or using{" "}
                {GLADIC_BRAND.full} services.
                <span className="ml-1 font-medium text-foreground/75">
                  {open ? "Hide details" : "Read full acknowledgment"}
                </span>
              </p>
            </div>
            <ChevronDown
              className={cn(
                "mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 ease-out",
                open && "rotate-180"
              )}
              aria-hidden
            />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent className="duration-200">
          <div className="space-y-2 border-t border-border/70 px-3.5 py-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Ownership or Lawful Authority
            </p>
            <div className="space-y-2 rounded-md border border-border/60 bg-background px-3 py-2.5 text-[11px] leading-relaxed text-muted-foreground">
              <p>
                I lawfully obtained the report and have the legal right to provide
                it to {GLADIC_BRAND.full} for the services I requested. I will not
                upload, access, submit, alter, or use another person&apos;s credit
                report, identity information, financial information, or consumer
                records without that person&apos;s express authorization or other
                lawful authority.
              </p>
              <p>
                I understand that federal law restricts access to and use of
                consumer reports to authorized or otherwise permissible purposes.
                Nothing in this acknowledgment creates authority that I do not
                otherwise possess.
              </p>
              <p className="text-[10px] text-muted-foreground/80">
                See 15 U.S.C. § 1681b
              </p>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <div className="border-t border-border/70 px-3.5 py-3">
        <label
          htmlFor="credit-report-ownership-ack"
          className={cn(
            "flex cursor-pointer items-start gap-2.5 rounded-md border px-3 py-2.5 transition-colors",
            checked
              ? "border-primary/30 bg-primary/5"
              : "border-border bg-background hover:bg-muted/40",
            invalid && !checked && "border-destructive/40"
          )}
        >
          <Checkbox
            id="credit-report-ownership-ack"
            checked={checked}
            onCheckedChange={(value) => onCheckedChange(value === true)}
            className="mt-0.5"
            aria-invalid={invalid && !checked}
          />
          <input
            type="hidden"
            name={CREDIT_REPORT_OWNERSHIP_FIELD}
            value={checked ? "true" : "false"}
          />
          <span className="text-[11px] leading-relaxed text-foreground">
            <span className="font-medium">I acknowledge, certify, and agree</span>{" "}
            to the ownership and lawful authority terms
            {open ? " above" : ""}.
            {!open ? (
              <span className="text-muted-foreground">
                {" "}
                Expand above to read the full acknowledgment.
              </span>
            ) : null}
          </span>
        </label>
      </div>
    </div>
  )
}
