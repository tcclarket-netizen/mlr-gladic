/** Client-safe report formatting helpers (no server-only). */

export const REPORT_SECTION_DEFINITIONS = [
  { id: "1", title: "Consumer Status & Standing" },
  { id: "2", title: "Purpose & Scope of Report" },
  { id: "3", title: "Applicable Legal Authorities" },
  { id: "4", title: "TurnKey Credit Metrics & Executive Snapshot" },
  { id: "5", title: "Permissible Purpose & Access Review" },
  { id: "6", title: "Liability Classification (Personal vs Business)" },
  { id: "7", title: "Objective Verifiability Standard" },
  { id: "8", title: "Reasonable Investigation Enforcement" },
  { id: "9", title: "Data Integrity & Identity Contamination" },
  { id: "10", title: "Account-Level Legal Findings (Mandatory)" },
  { id: "11", title: "Formal Rebuttal & Findings Rejection" },
  { id: "12", title: "Agency Filing Directives" },
  { id: "13", title: "Safe Harbor & Administrative Exhaustion" },
  { id: "14", title: "Jurisdiction Preservation Strategy" },
  { id: "15", title: "Credit Bureau Immunity Limitations" },
  { id: "16", title: "§ 1981 Equal Contracting & Execution Addendum" },
  { id: "17", title: "Escalation & Regulatory Oversight" },
  { id: "18", title: "Record-Building & Evidence Index" },
  { id: "19", title: "Conclusions & Directives" },
  { id: "20", title: "Final Disclaimers & Reservations" },
  { id: "21", title: "Appendices & Exhibits" },
] as const

export function sectionHeading(number: number, title: string) {
  return `SECTION ${number} - ${title.toUpperCase()}`
}
