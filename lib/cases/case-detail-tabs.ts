export const CASE_DETAIL_TABS = [
  "overview",
  "tradelines",
  "inquiries",
  "legal-report",
  "self-report",
] as const

export type CaseDetailTab = (typeof CASE_DETAIL_TABS)[number]

export function resolveCaseDetailTab(
  tab: string | null,
  hasExtraction: boolean,
  hasLegalReport: boolean
): CaseDetailTab {
  if (!tab || !CASE_DETAIL_TABS.includes(tab as CaseDetailTab)) {
    return "overview"
  }

  if ((tab === "tradelines" || tab === "inquiries") && !hasExtraction) {
    return "overview"
  }

  if ((tab === "legal-report" || tab === "self-report") && !hasLegalReport) {
    return "overview"
  }

  return tab as CaseDetailTab
}
