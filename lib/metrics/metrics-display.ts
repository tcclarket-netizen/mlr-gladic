import type { Bureau } from "@/types/case"
import type { ExecutiveSnapshot } from "@/types/credit-report"

const ALL_BUREAUS: Bureau[] = ["experian", "equifax", "transunion"]

export function formatScoresLine(snapshot: ExecutiveSnapshot) {
  const parts = ALL_BUREAUS.map((b) => {
    const abbr = snapshot.bureau_abbreviations[b]
    const score = snapshot.scores_by_bureau[b]
    return `${abbr} ${score ?? "N/A"}`
  })
  return `Scores: ${parts.join(" | ")}`
}

export function formatUtilizationLine(snapshot: ExecutiveSnapshot) {
  const parts = ALL_BUREAUS.map((b) => {
    const abbr = snapshot.bureau_abbreviations[b]
    return `${abbr} ${snapshot.utilization_by_bureau[b]}`
  })
  return `Usage: ${parts.join(" | ")}`
}

export function formatBureauCheckboxes(analyzed: Bureau[]) {
  const set = new Set(analyzed)
  return ALL_BUREAUS.map((b) => {
    const label = b.charAt(0).toUpperCase() + b.slice(1)
    return set.has(b) ? `[X] ${label}` : `[ ] ${label}`
  }).join(" ")
}
