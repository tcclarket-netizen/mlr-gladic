"use client"

import type { CaseMetrics } from "@/types/credit-report"
import { CaseMetricsGrid } from "@/components/cases/case-metrics-grid"
import { GatedContentOverlay } from "@/components/cases/gated-content-overlay"
import { UnlockProductButton } from "@/components/billing/unlock-product-button"
import type { ProductUsage } from "@/lib/billing/usage-summary"

type OppositionMetricsSectionProps = {
  caseId: string
  metrics: CaseMetrics
  unlocked: boolean
  oppositionUsage: ProductUsage
}

export function OppositionMetricsSection({
  caseId,
  metrics,
  unlocked,
  oppositionUsage,
}: OppositionMetricsSectionProps) {
  return (
    <GatedContentOverlay
      locked={!unlocked}
      footer={
        <UnlockProductButton
          caseId={caseId}
          product="opposition"
          usage={oppositionUsage}
          unlocked={unlocked}
          size="sm"
        />
      }
    >
      <CaseMetricsGrid metrics={metrics} />
    </GatedContentOverlay>
  )
}
