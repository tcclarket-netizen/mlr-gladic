import type { CaseMetrics } from "@/types/credit-report"
import {
  formatScoresLine,
  formatUtilizationLine,
} from "@/lib/metrics/metrics-display"

function formatMetric(value: number | null, suffix = "") {
  if (value == null) return "—"
  return `${value}${suffix}`
}

export function CaseMetricsGrid({ metrics }: { metrics: CaseMetrics }) {
  const snap = metrics.executive_snapshot

  const cards = [
    {
      label: "Avg. Score",
      value: formatMetric(metrics.average_score),
      sub:
        metrics.bureaus_analyzed.length > 0
          ? snap
            ? formatScoresLine(snap)
            : `Across ${metrics.bureaus_analyzed.length} bureau(s)`
          : "No scores extracted",
    },
    {
      label: "Avg. Utilization",
      value: formatMetric(metrics.average_utilization, "%"),
      sub: snap ? formatUtilizationLine(snap) : "Revolving utilization",
    },
    {
      label: "Credit Tier",
      value: snap?.credit_tier ?? "—",
      sub: snap?.risk_profile ?? "Run processing for snapshot",
    },
    {
      label: "Funding Readiness",
      value: snap?.funding_readiness?.split("(")[0].trim() ?? "—",
      sub: snap?.primary_limiters[0] ?? "Executive snapshot",
    },
    {
      label: "Negative Items",
      value: String(metrics.negative_item_count),
      sub: `${metrics.hard_inquiries_12mo} hard inquiries (12 mo)`,
    },
  ]

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {cards.map(({ label, value, sub }) => (
          <div key={label} className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 text-xl font-semibold tracking-tight text-foreground">{value}</p>
            <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{sub}</p>
          </div>
        ))}
      </div>
      {snap && snap.primary_limiters.length > 0 && (
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground/80">Primary limiters:</span>{" "}
          {snap.primary_limiters.join(" · ")}
        </p>
      )}
    </div>
  )
}
