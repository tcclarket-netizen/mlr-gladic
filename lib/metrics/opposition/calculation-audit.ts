import type { OppositionBureauName, OppositionReportMetrics } from "@/types/opposition-report"
import type { OcuCalculationMethod } from "@/types/opposition-report"

function formatBureauList(names: OppositionBureauName[]): string {
  return names.length > 0 ? names.join(", ") : "none"
}

function exclusionNote(
  uploaded: OppositionBureauName[],
  used: OppositionBureauName[],
  metric: string,
  reason: string
): string {
  const excluded = uploaded.filter((b) => !used.includes(b))
  if (excluded.length === 0) return ""
  return `${excluded.join(", ")} excluded from ${metric}: ${reason}.`
}

export function buildCalculationAudit(input: {
  uploadedBureaus: OppositionBureauName[]
  oasUsed: OppositionBureauName[]
  ocuUsed: OppositionBureauName[]
  ospUsed: OppositionBureauName[]
  oipUsed: OppositionBureauName[]
  ocuCalculationMethod: OcuCalculationMethod
  oasDivisor: number
}): OppositionReportMetrics["calculationAudit"] {
  const { uploadedBureaus, oasUsed, ocuUsed, ospUsed, oipUsed, ocuCalculationMethod, oasDivisor } =
    input

  const oasMethod = `Opposition Average Score: sum of bureau scores ÷ ${oasDivisor} (${formatBureauList(oasUsed)}).`
  const ocuMethod =
    ocuCalculationMethod === "Bureau Reported Utilization"
      ? `Opposition Credit Usage: mean of bureau-reported revolving utilization (${formatBureauList(ocuUsed)}).`
      : `Opposition Credit Usage: mean of derived active open revolving utilization (${formatBureauList(ocuUsed)}).`

  const ospMethod = `Opposition Spending Power: mean of active open revolving limit totals (${formatBureauList(ospUsed)}). Zero included when bureau has no open revolving capacity.`

  const oipMethod = `Opposition Inquiry Pressure: sum of bureau inquiry counts ÷ 12 (${formatBureauList(oipUsed)}).`

  const ospExclusion = exclusionNote(
    uploadedBureaus,
    ospUsed,
    "OSP",
    "no active revolving limit data found in uploaded documents"
  )
  const ocuExclusion = exclusionNote(
    uploadedBureaus,
    ocuUsed,
    "OCU",
    "no bureau-reported or derived active revolving utilization available"
  )

  return {
    oasMethod: [oasMethod, exclusionNote(uploadedBureaus, oasUsed, "OAS", "no credit score in uploaded documents")]
      .filter(Boolean)
      .join(" "),
    ocuMethod: [ocuMethod, ocuExclusion].filter(Boolean).join(" "),
    ospMethod: [ospMethod, ospExclusion].filter(Boolean).join(" "),
    oipMethod: [oipMethod, exclusionNote(uploadedBureaus, oipUsed, "OIP", "no inquiry count in uploaded documents")]
      .filter(Boolean)
      .join(" "),
    bureausUsed: {
      oas: oasUsed,
      ocu: ocuUsed,
      osp: ospUsed,
      oip: oipUsed,
    },
  }
}
