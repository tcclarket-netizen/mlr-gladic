import "server-only"
import type { LegalReportContent } from "@/types/legal-report"

export type SelfReportFillInput = {
  replacements: Record<string, string>
}

/** Format stored county for the self-report caption, e.g. "Broward" → "BROWARD COUNTY". */
export function formatCountyForSelfReport(county: string) {
  const name = county.trim().replace(/\s+county\s*$/i, "").trim()
  if (!name) return ""
  return `${name.toUpperCase()} COUNTY`
}

export function buildSelfReportFillInput(args: {
  content: LegalReportContent
  caseCounty?: string | null
}): SelfReportFillInput {
  const { content, caseCounty } = args
  const county = caseCounty?.trim() ? formatCountyForSelfReport(caseCounty) : ""

  return {
    replacements: {
      "{CLIENT FULL NAME}": content.client_name.toUpperCase(),
      "{COUNTY}": county,
    },
  }
}
