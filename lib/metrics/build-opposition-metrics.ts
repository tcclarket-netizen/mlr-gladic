import "server-only"
import type { BureauExtraction } from "@/lib/extraction/schema"
import type { OppositionReportMetrics } from "@/types/opposition-report"
import { calculateOppositionReport } from "@/lib/metrics/opposition/calculate-opposition-report"

export function buildOppositionMetrics(
  extractions: BureauExtraction[]
): OppositionReportMetrics | null {
  return calculateOppositionReport(extractions)
}
