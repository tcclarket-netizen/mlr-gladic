import "server-only"
import type { LegalReportContent } from "@/types/legal-report"
import {
  getStateRightsProfile,
  normalizeConsumerState,
} from "@/lib/report-generation/state-rights-data"

export type SelfReportFillInput = {
  replacements: Record<string, string>
  stateName: string
}

/** Format stored county for the self-report caption, e.g. "Broward" → "BROWARD COUNTY". */
export function formatCountyForSelfReport(county: string) {
  const name = county.trim().replace(/\s+county\s*$/i, "").trim()
  if (!name) return ""
  return `${name.toUpperCase()} COUNTY`
}

/** Build token and phrase replacements for the official self-report DOCX template. */
export function buildSelfReportReplacements(args: {
  clientName: string
  caseState: string
}): Record<string, string> {
  const { stateName } = normalizeConsumerState(args.caseState)
  const profile = getStateRightsProfile(args.caseState)
  const agOffice = profile.attorneyGeneral.office.includes("Attorney General")
    ? profile.attorneyGeneral.office
    : `${stateName} Attorney General`

  const regulatorAgency = `[${stateName} Office of Financial Regulation / Other Appropriate Regulator]`

  const replacements: Record<string, string> = {
    "{CLIENT FULL NAME}": args.clientName.toUpperCase(),
    "{STATE}": stateName,
    "{COUNTY}": "",
  }

  const phrasePairs: [string, string][] = [
    [
      "Verification • Documentary Support • Reasonable Investigation • Objective Verifiability • Florida Consumer-Protection Record-Building",
      `Verification • Documentary Support • Reasonable Investigation • Objective Verifiability • ${stateName} Consumer-Protection Record-Building`,
    ],
    ["Phase 6: Florida Consumer-Protection Complaint Package", `Phase 6: ${stateName} Consumer-Protection Complaint Package`],
    ["Phase 9: Strongest Florida Complaint Template", `Phase 9: Strongest ${stateName} Complaint Template`],
    [
      "[  ] For Florida state-law posture, frame the dispute as a demand for objective documentary support, disclosure of verification methodology, correction of incomplete or unsupported information, and Florida consumer-protection record-building.",
      `[  ] For ${stateName} state-law posture, frame the dispute as a demand for objective documentary support, disclosure of verification methodology, correction of incomplete or unsupported information, and ${stateName} consumer-protection record-building.`,
    ],
    [
      "Current Florida Address: ____________________________________________",
      `Current ${stateName} Address: ____________________________________________`,
    ],
    [
      "PHASE 6 — FLORIDA CONSUMER-PROTECTION COMPLAINT PACKAGE",
      `PHASE 6 — ${stateName.toUpperCase()} CONSUMER-PROTECTION COMPLAINT PACKAGE`,
    ],
    [
      "Purpose: If the reporting remains unresolved, file an administrative complaint with the Florida Attorney General and, where appropriate, a Florida financial regulator. The uploaded report identifies Florida consumer-protection pathways including FDUTPA, FCCPA, security freeze/data safeguards, Florida Information Protection Act themes, and Florida AG intake.",
      `Purpose: If the reporting remains unresolved, file an administrative complaint with the ${stateName} Attorney General and, where appropriate, a ${stateName} financial regulator. The uploaded report identifies ${stateName} consumer-protection pathways including FDUTPA, FCCPA, security freeze/data safeguards, ${stateName} Information Protection Act themes, and ${stateName} AG intake.`,
    ],
    [
      "Form 6A — Florida Attorney General Consumer Complaint Draft",
      `Form 6A — ${stateName} Attorney General Consumer Complaint Draft`,
    ],
    [
      "Agency: Florida Attorney General — Consumer Protection Division",
      `Agency: ${agOffice} — Consumer Protection Division`,
    ],
    [
      "I am a Florida consumer seeking assistance regarding disputed consumer reporting information. I disputed specific tradelines and requested objective documentary support, including contracts, ledgers, date-of-first-delinquency support, charge-off basis, ownership records, and method-of-verification disclosure. The disputed information was reported or verified without adequate documentary support being provided to me. I request review, intervention, and preservation of the administrative record under applicable Florida consumer-protection principles.",
      `I am a ${stateName} consumer seeking assistance regarding disputed consumer reporting information. I disputed specific tradelines and requested objective documentary support, including contracts, ledgers, date-of-first-delinquency support, charge-off basis, ownership records, and method-of-verification disclosure. The disputed information was reported or verified without adequate documentary support being provided to me. I request review, intervention, and preservation of the administrative record under applicable ${stateName} consumer-protection principles.`,
    ],
    [
      "Form 6B — Florida Regulator Complaint Draft",
      `Form 6B — ${stateName} Regulator Complaint Draft`,
    ],
    [
      "Agency: [Florida Office of Financial Regulation / Other Appropriate Regulator]",
      `Agency: ${regulatorAgency}`,
    ],
    [
      "Statement: I request regulatory review of the attached documentation because the entity continued furnishing or verifying disputed consumer information without producing objective account-level records. The unresolved issue concerns data integrity, documentation, consumer finance practices, and harm to a Florida resident.",
      `Statement: I request regulatory review of the attached documentation because the entity continued furnishing or verifying disputed consumer information without producing objective account-level records. The unresolved issue concerns data integrity, documentation, consumer finance practices, and harm to a ${stateName} resident.`,
    ],
    ["[  ] Florida AG complaint filed and confirmation saved", `[  ] ${stateName} AG complaint filed and confirmation saved`],
    [
      "[  ] Florida regulator complaint filed if applicable",
      `[  ] ${stateName} regulator complaint filed if applicable`,
    ],
    [
      "PHASE 9 — STRONGEST FLORIDA COMPLAINT TEMPLATE",
      `PHASE 9 — STRONGEST ${stateName.toUpperCase()} COMPLAINT TEMPLATE`,
    ],
    [
      "Use only after the above record-building steps are completed. This complaint focuses on verification, documentary support, reasonable investigation, objective verifiability, Florida consumer-protection principles, damages, declaratory relief, and accounting. It does not allege that credit reporting itself is unlawful.",
      `Use only after the above record-building steps are completed. This complaint focuses on verification, documentary support, reasonable investigation, objective verifiability, ${stateName} consumer-protection principles, damages, declaratory relief, and accounting. It does not allege that credit reporting itself is unlawful.`,
    ],
    [
      "IN THE CIRCUIT COURT OF THE SEVENTEENTH JUDICIAL CIRCUITIN AND FOR {COUNTY}, FLORIDA",
      `IN THE __________ COURT OF THE _______________ JUDICIAL CIRCUIT IN AND FOR __________ COUNTY, ${stateName}`,
    ],
    [
      "COMPLAINT FOR DECLARATORY RELIEF, ACCOUNTING, INJUNCTIVE RELIEF, NEGLIGENCE, NEGLIGENT MISREPRESENTATION, TORTIOUS INTERFERENCE, AND VIOLATION OF FLORIDA CONSUMER-PROTECTION PRINCIPLES",
      `COMPLAINT FOR DECLARATORY RELIEF, ACCOUNTING, INJUNCTIVE RELIEF, NEGLIGENCE, NEGLIGENT MISREPRESENTATION, TORTIOUS INTERFERENCE, AND VIOLATION OF ${stateName.toUpperCase()} CONSUMER-PROTECTION PRINCIPLES`,
    ],
    ["1. Plaintiff is a natural person and resident of Florida.", `1. Plaintiff is a natural person and resident of ${stateName}.`],
    [
      "2. Defendants are consumer reporting agencies that collect, maintain, process, evaluate, publish, sell, license, and disseminate consumer information concerning Florida residents.",
      `2. Defendants are consumer reporting agencies that collect, maintain, process, evaluate, publish, sell, license, and disseminate consumer information concerning ${stateName} residents.`,
    ],
    [
      "3. Venue is proper in Broward County because Plaintiff resides in Florida, the injuries occurred in Florida, and Defendants conduct business affecting Florida consumers.",
      `3. Venue is proper in _________ County because Plaintiff resides in ${stateName}, the injuries occurred in ${stateName}, and Defendants conduct business affecting ${stateName} consumers.`,
    ],
    [
      "COUNT VI - FLORIDA DECEPTIVE AND UNFAIR TRADE PRACTICES ACT / FLORIDA CONSUMER-PROTECTION PRINCIPLES",
      `COUNT VI - ${stateName.toUpperCase()} DECEPTIVE AND UNFAIR TRADE PRACTICES ACT / ${stateName.toUpperCase()} CONSUMER-PROTECTION PRINCIPLES`,
    ],
  ]

  for (const [from, to] of phrasePairs) {
    replacements[from] = to
  }

  return replacements
}

export function buildSelfReportFillInput(args: {
  content: LegalReportContent
}): SelfReportFillInput {
  const { content } = args

  return {
    replacements: buildSelfReportReplacements({
      clientName: content.client_name,
      caseState: content.case_state,
    }),
    stateName: normalizeConsumerState(content.case_state).stateName,
  }
}
