import type { CaseMetrics } from "@/types/credit-report"
import { OPPOSITION_NOT_FOUND, type OppositionIdentityEntry } from "@/types/opposition-report"
import {
  deriveOppositionReport,
  formatOppositionMetric,
  formatSourceLine,
  hasCompletenessWarning,
} from "@/lib/metrics/opposition-display"
import { cn } from "@/lib/utils"

type MetricCardProps = {
  code: string
  title: string
  value: string
  detail: string
  footnote?: string
  warning?: boolean
  highlight?: boolean
}

function MetricCard({
  code,
  title,
  value,
  detail,
  footnote,
  warning,
  highlight,
}: MetricCardProps) {
  const notFound = value === OPPOSITION_NOT_FOUND
  return (
    <div
      className={cn(
        "flex flex-col rounded-lg border bg-card p-4",
        highlight ? "border-accent/40 ring-1 ring-accent/20" : "border-border",
        warning && "border-status-warning/40"
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {code}
      </p>
      <p className="mt-0.5 text-xs font-medium text-foreground/90">{title}</p>
      <p
        className={cn(
          "mt-2 font-semibold tabular-nums tracking-tight",
          notFound ? "text-sm leading-snug text-muted-foreground" : "text-2xl text-foreground"
        )}
      >
        {value}
      </p>
      <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{detail}</p>
      {footnote ? (
        <p className="mt-2 text-[10px] leading-snug text-muted-foreground/80">{footnote}</p>
      ) : null}
    </div>
  )
}

function IdentitySection({
  title,
  entries,
}: {
  title: string
  entries: OppositionIdentityEntry[]
}) {
  if (!entries || entries.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        {OPPOSITION_NOT_FOUND} for {title.toLowerCase()}.
      </p>
    )
  }

  return (
    <ul className="space-y-2">
      {entries.map((entry) => (
        <li key={entry.normalizedValue} className="text-xs leading-relaxed">
          <div className="flex gap-2">
            {entry.requiresReview ? (
              <span className="shrink-0 font-semibold text-destructive" aria-hidden>
                *
              </span>
            ) : (
              <span className="shrink-0 text-muted-foreground/50" aria-hidden>
                ·
              </span>
            )}
            <div>
              <p className={entry.requiresReview ? "text-foreground/90" : "text-muted-foreground"}>
                {entry.originalValues
                  .map((v) => v.replace(/\s*\[(current|former)\]\s*/gi, "").trim())
                  .join(" · ")}
              </p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                {entry.bureauSources.join(", ")}
              </p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}

export function CaseMetricsGrid({ metrics }: { metrics: CaseMetrics }) {
  const report = deriveOppositionReport(metrics)

  if (!report) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-8 text-center">
        <p className="text-sm text-muted-foreground">
          Process bureau reports to generate Opposition Report™ metrics.
        </p>
      </div>
    )
  }

  const { metrics: m, sourceBreakdown, riskExposure, completenessWarnings } = report
  const addresses = report.identityReview?.addresses ?? []
  const employers = report.identityReview?.employers ?? []
  const reviewCount =
    addresses.filter((a) => a.requiresReview).length +
    employers.filter((e) => e.requiresReview).length
  const baselineMessage = report.baselineValidation?.message ?? ""
  const ocuFootnote =
    report.ocuCalculationNote ??
    (report.ocuCalculationMethod === "Derived Active Revolving Utilization"
      ? "Derived from active open revolving balances and limits"
      : "Bureau-reported revolving utilization")

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-border bg-gradient-to-br from-card to-muted/30 px-4 py-3 sm:px-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
          {report.reportName}
        </p>
        <h3 className="mt-1 text-sm font-semibold text-foreground sm:text-base">
          Credit Resistance, Risk Exposure &amp; Approval Readiness
        </h3>
        <p className="mt-1 max-w-3xl text-xs leading-relaxed text-muted-foreground">
          Calculated from verified extracted bureau fields only.{" "}
          <span className="text-foreground/70">{baselineMessage}</span>
        </p>
        {hasCompletenessWarning(report) && (
          <p className="mt-2 rounded-md border border-status-warning/30 bg-status-warning/10 px-2.5 py-1.5 text-[11px] text-status-warning">
            Incomplete tri-bureau data — metrics use available bureaus only.
            {completenessWarnings.oasCompletenessWarning && " OAS"}
            {completenessWarnings.ocuCompletenessWarning && " OCU"}
            {completenessWarnings.ospCompletenessWarning && " OSP"}
            {completenessWarnings.oipCompletenessWarning && " OIP"}
            {report.baselineValidation?.baselineWarning && " · Baseline dates"}
          </p>
        )}
      </div>

      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Core opposition metrics
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            code="OAS"
            title="Opposition Average Score™"
            value={formatOppositionMetric(m.oas)}
            detail={formatSourceLine(sourceBreakdown.oasSources)}
            footnote={
              completenessWarnings.oasCompletenessWarning
                ? "Fewer than 3 bureau scores — averaged across available scores only"
                : "All three bureau scores available — sum ÷ 3"
            }
            warning={completenessWarnings.oasCompletenessWarning}
          />
          <MetricCard
            code="OCU"
            title="Opposition Credit Usage™"
            value={formatOppositionMetric(m.ocu, { suffix: "%", decimals: 1 })}
            detail={formatSourceLine(sourceBreakdown.ocuSources, (n) => `${n}%`)}
            footnote={`${report.ocuCalculationMethod}. ${ocuFootnote}`}
            warning={completenessWarnings.ocuCompletenessWarning}
          />
          <MetricCard
            code="OSP"
            title="Opposition Spending Power™"
            value={formatOppositionMetric(m.osp, { currency: true })}
            detail={formatSourceLine(sourceBreakdown.ospSources, (n) =>
              new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 0,
              }).format(n)
            )}
            footnote="Active open revolving limits only (÷ available bureaus with data)"
            warning={completenessWarnings.ospCompletenessWarning}
          />
          <MetricCard
            code="OIP"
            title="Opposition Inquiry Pressure™"
            value={formatOppositionMetric(m.oip, { decimals: 2 })}
            detail={formatSourceLine(sourceBreakdown.inquirySources)}
            footnote="Sum of bureau inquiry counts ÷ 12"
            warning={completenessWarnings.oipCompletenessWarning}
          />
        </div>
      </div>

      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Risk exposure &amp; success rating
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            code="ORE"
            title="Opposition Risk Exposure™"
            value={riskExposure.hasNegativeActivity ? `−${m.riskDeduction}%` : "Clear"}
            detail={
              riskExposure.hasNegativeActivity
                ? `${riskExposure.negativeAccountCount} negative account(s) — collections ${riskExposure.collectionAccountCount}, charge-offs ${riskExposure.chargeOffAccountCount}, late ${riskExposure.latePaymentAccountCount}`
                : "No deduplicated negative accounts in extracted tradelines"
            }
            footnote="Fixed −15% deduction when any negative activity exists (does not stack)"
            highlight={riskExposure.hasNegativeActivity}
          />
          <MetricCard
            code="OSR"
            title="Opposition Success Rating™"
            value={`${m.successRating}%`}
            detail={`${m.successClassification} — 100% minus risk deduction`}
            footnote="Always calculated: 100 − risk deduction"
            highlight={m.successRating >= 85}
          />
          <MetricCard
            code="Prime"
            title="Prime Band Qualification"
            value={report.primeBandQualification.status}
            detail={`OAS ${formatOppositionMetric(report.primeBandQualification.currentOAS)} · required ${report.primeBandQualification.requiredOAS}+`}
            footnote="Separate from Success Rating — multi-bureau prime band gate"
            highlight={report.primeBandQualification.status === "Prime Qualified"}
          />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Opposition Identity Review™
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Normalized comparison across bureaus —{" "}
              <span className="font-semibold text-destructive">*</span> requires review
            </p>
          </div>
          {reviewCount > 0 && (
            <span className="rounded-full border border-destructive/30 bg-destructive/10 px-2.5 py-0.5 text-[10px] font-medium text-destructive">
              {reviewCount} review{reviewCount === 1 ? "" : "s"}
            </span>
          )}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-[11px] font-medium text-foreground/80">Addresses</p>
            <IdentitySection title="Addresses" entries={addresses} />
          </div>
          <div>
            <p className="mb-2 text-[11px] font-medium text-foreground/80">Employers</p>
            <IdentitySection title="Employers" entries={employers} />
          </div>
        </div>
      </div>

      {report.calculationAudit && (
        <div className="rounded-lg border border-border bg-muted/20 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Calculation audit
          </p>
          <ul className="mt-2 space-y-1.5 text-[11px] leading-relaxed text-muted-foreground">
            <li>{report.calculationAudit.oasMethod}</li>
            <li>{report.calculationAudit.ocuMethod}</li>
            <li>{report.calculationAudit.ospMethod}</li>
            <li>{report.calculationAudit.oipMethod}</li>
          </ul>
        </div>
      )}
    </div>
  )
}
