import "server-only"
import type { BureauExtraction } from "@/lib/extraction/schema"
import { getStateRightsProfile } from "@/lib/report-generation/state-rights-data"
import {
  resolveControllingState,
  type ResolvedJurisdiction,
} from "@/lib/report-generation/resolve-controlling-state"

const REQUIRED_DISCLAIMER = `Nothing contained within this section should be interpreted as legal advice, legal representation, or a guarantee of outcome. Consumers remain responsible for their own decisions and actions. Applicable laws, regulations, and judicial interpretations may change over time. This section is provided solely for educational, informational, and procedural self-help purposes.`

const AUTHORITY_LIBRARY_STATEMENT = `This section was generated using a continuously updated authority library designed to identify relevant federal and state consumer-protection authorities. Statutes, regulations, agency guidance, and judicial decisions may change over time. This section is educational and informational only and does not constitute legal advice or legal representation.`

function formatDateUtc() {
  return new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  })
}

function formatAuthorityTable(
  rows: ReturnType<typeof getStateRightsProfile>["authorityRows"]
) {
  const header =
    "Type | Citation | What it Covers | Remedies/Relief | How it Supports Record-Building"
  const lines = rows.map(
    (r) =>
      `${r.type} | ${r.citation} | ${r.covers} | ${r.remedies} | ${r.recordBuilding}`
  )
  return [header, ...lines].join("\n")
}

function formatCaseTable(cases: ReturnType<typeof getStateRightsProfile>["caseLaw"]) {
  if (cases.length === 0) {
    return [
      "Case Name | Court | Year | Citation | Holding Summary | Practical Use",
      "Verification Required | — | — | — | Limited published state appellate authority identified in the current library for this jurisdiction. | Expand research using official court reporters before citing in filings.",
    ].join("\n")
  }

  const header =
    "Case Name | Court | Year | Citation | Holding Summary | Practical Use"
  const lines = cases.map(
    (c) =>
      `${c.name} | ${c.court} | ${c.year} | ${c.citation} | ${c.holding} | ${c.practicalUse}`
  )
  return [header, ...lines].join("\n")
}

function partA(
  profile: ReturnType<typeof getStateRightsProfile>,
  jurisdiction: ResolvedJurisdiction,
  hasCollectionActivity: boolean
) {
  const cp = profile.consumerProtection
  const lines = [
    "PART A — STATE RIGHTS MAP (STATUTES/ACTS/REGULATIONS/POLICIES/ORDINANCES)",
    "",
    `Controlling state: ${jurisdiction.primary.stateName} (${jurisdiction.primary.stateAbbr})`,
    jurisdiction.selectionNote,
    jurisdiction.secondary.length
      ? `Secondary states (identity profile): ${jurisdiction.secondary.map((s) => `${s.stateName} (${s.stateAbbr})`).join(", ")}`
      : "Secondary states: none extracted from uploaded reports (review bureau PDF identity sections).",
    "",
    "State UDAP / Consumer Protection Act(s)",
    `• Name: ${cp.name}`,
    `• Citation: ${cp.citation}`,
    `• Scope: ${cp.scope}`,
    `• Remedies: ${cp.remedies}`,
    `• Private right of action: ${cp.privateAction}`,
    `• AG enforcement: ${cp.agEnforcement}`,
    "",
    "State Debt Collection Law(s)",
    hasCollectionActivity
      ? `• Applicability: Collection/tradeline derogatory activity present — review ${profile.stateName} collection statutes.`
      : "• Applicability: No collection accounts extracted; debt-collection statutes listed for educational reference only.",
    `• Overview: ${profile.debtCollection.summary}`,
    `• Citation anchor: ${profile.debtCollection.enforcement}`,
    "",
    "State Credit Reporting / Mini-FCRA Laws",
    `• Security freeze: ${profile.creditReporting.freeze}`,
    `• Disclosures: ${profile.creditReporting.disclosure}`,
    `• Corrections: ${profile.creditReporting.correction}`,
    `• Fraud alerts: ${profile.creditReporting.fraudAlert}`,
    `• Remedies: ${profile.creditReporting.remedies}`,
    "",
    "Security Freeze / Fraud Alert / Identity Restoration",
    `• ${profile.identityTheft.statutes}`,
    `• Restoration: ${profile.identityTheft.restoration}`,
    `• Reporting: ${profile.identityTheft.reporting}`,
    "",
    "Privacy + Data Security + Breach Notification",
    `• Breach notice: ${profile.privacy.breach}`,
    `• Privacy rights: ${profile.privacy.privacy}`,
    `• Security duties: ${profile.privacy.security}`,
    "",
    "State AG / Regulator Authority + Policies",
    `• ${profile.attorneyGeneral.office}`,
    `• Complaint pathway: ${profile.attorneyGeneral.complaint}`,
    `• ${profile.regulatorNote}`,
    "",
    "Local Ordinances",
    profile.ordinancesNote,
    "",
    "State Authority Table",
    formatAuthorityTable(profile.authorityRows),
  ]
  return lines.join("\n")
}

function partB(profile: ReturnType<typeof getStateRightsProfile>) {
  const byTopic = new Map<string, typeof profile.caseLaw>()
  for (const c of profile.caseLaw) {
    const list = byTopic.get(c.topic) ?? []
    list.push(c)
    byTopic.set(c.topic, list)
  }

  const lines = [
    "PART B — STATE CASE LAW LIBRARY (REQUIRED)",
    "",
    `Jurisdiction: ${profile.stateName} (${profile.stateAbbr})`,
    "Educational module — no liability conclusions. No invented citations.",
    "",
  ]

  if (byTopic.size === 0) {
    lines.push(
      "Published state appellate authority in the current library is limited for this jurisdiction.",
      "Expand with official reporter or court docket research before relying on additional cases.",
      ""
    )
  } else {
    for (const [topic, cases] of byTopic) {
      lines.push(`Topic: ${topic}`, formatCaseTable(cases), "")
    }
  }

  lines.push(formatCaseTable(profile.caseLaw))
  return lines.join("\n").trimEnd()
}

function partC() {
  return [
    "PART C — FCRA PREEMPTION + STATE-LAW SAFE ZONES (WITH CITATIONS)",
    "",
    "Federal preemption provisions (educational):",
    "• 15 U.S.C. § 1681t(b) — preemption of state law relating to subject matter of subchapter",
    "• 15 U.S.C. § 1681h(e) — limitations on certain state causes of action",
    "",
    "Educational summary: federal law generally governs CRA/furnisher accuracy, reinvestigation, and reporting procedures. State claims that duplicate or conflict with these duties may be preemption-sensitive.",
    "",
    "Preemption Risk Map",
    "Claim/Topic | State authority | FCRA overlap | Preemption risk | Procedural framing",
    "CRA accuracy/reinvestigation | State mini-FCRA (if any) | High | High | Use FCRA dispute + MOFV; avoid parallel state reporting duties",
    "Furnisher reporting duties | State consumer reporting act | High | High | Federal furnisher rules (15 U.S.C. § 1681s-2)",
    "Identity theft blocking | State ID theft statutes | Medium | Low–Med | Document theft reports; federal blocking procedures",
    "Deceptive collection conduct | FCCPA/Rosenthal/DTPA equivalents | Low–Med | Low–Med | State AG complaint; collection communication log",
    "Security freeze violations | State freeze statutes | Medium | Low | Freeze confirmations; regulator complaints",
    "Data breach/privacy | State breach/SHIELD-type acts | Low | Low | Privacy/breach complaints distinct from furnishing",
    "UDAP deceptive practices | State UDAP | Low | Low | Commercial deception record-building",
    "",
    "Safer zones (generally): identity theft conduct, deceptive collection, freeze violations, breach/privacy, UDAP-style commercial deception.",
    "Risky zones (generally): state claims imposing CRA/furnisher reporting duties parallel to FCRA.",
    "No legal conclusions or outcome predictions are provided.",
  ].join("\n")
}

function partD(stateName: string, stateAbbr: string) {
  return [
    "PART D — STATE-FIRST FACT-FINDING STRATEGY (IMPLEMENTATION PLAYBOOK)",
    "",
    "Step 1 — Review credit reports for inaccuracies (line-by-line against bureau PDFs).",
    "Step 2 — Submit written CRA/furnisher disputes + proof of service (certified mail or verifiable electronic proof).",
    "Step 3 — Document demand list: contract, ledger, DOFD support, ownership chain, inquiry logs.",
    "Step 4 — Method-of-verification / verification-description request (15 U.S.C. § 1681i(a)(6)).",
    `Step 5 — File ${stateName} complaint (${stateAbbr} AG / applicable regulator) — retain confirmation numbers.`,
    "Step 6 — Preserve agency responses and index chronologically.",
    "Step 7 — Escalate unresolved items to CFPB/FTC after state intake.",
    "Step 8 — Maintain evidence index with exhibit labels (A-1, A-2, …).",
    "",
    "State Record → FCRA Element Mapping (educational)",
    "Administrative record item | FCRA element supported",
    "Dated dispute + proof of service | Notice / dispute initiation",
    "CRA response + MOFV disclosure | Reasonableness / procedure transparency",
    "Furnisher silence or generic verification | Potential deficiency (no liability conclusion)",
    "State AG complaint + agency ID | Chronology / exhaustion themes",
    "Identity theft affidavit + police report | Blocking / fraud procedures",
    "Ledger/DOFD documentation gaps | Accuracy / completeness questions",
  ].join("\n")
}

function partE() {
  return [
    "PART E — PROCEDURAL ENFORCEMENT TOOLS (NON-ACCUSATORY)",
    "",
    "• Method-of-verification / verification-description request",
    "• Permissible-purpose request (inquiries and file access)",
    "• Ledger/balance validation and date-of-first-delinquency support",
    "• Liability classification review (personal vs authorized user vs business signer)",
    "• Identity integrity review (addresses, aliases, mixed-file indicators)",
    "• Findings rejection protocol if marked 'verified' without disclosed methodology",
    "",
    "Emphasize objective evidence. Avoid accusatory language and assumptions of wrongdoing.",
  ].join("\n")
}

function partF(profile: ReturnType<typeof getStateRightsProfile>) {
  const lines = [
    "PART F — STATE-SPECIFIC MODULE (AUTO-INJECT, REQUIRED)",
    "",
    `Jurisdiction: ${profile.stateName} (${profile.stateAbbr})`,
    "",
    "Statutes/Acts:",
  ]

  for (const s of profile.specificStatutes) {
    lines.push(
      `• ${s.name} | ${s.citation} | Remedies: ${s.remedies} | Authority: ${s.authority}`
    )
  }

  lines.push("", "Regulations:", "• Verification Required — consult current state administrative code for credit, collection, and privacy titles.", "", "Policies/Guidance:", `• ${profile.attorneyGeneral.complaint}`, `• ${profile.regulatorNote}`, "", "Ordinances:", profile.ordinancesNote, "", "Case law (curated):", formatCaseTable(profile.caseLaw))

  return lines.join("\n")
}

function partG(jurisdiction: ResolvedJurisdiction) {
  const secondary =
    jurisdiction.secondary.length > 0
      ? jurisdiction.secondary.map((s) => s.stateAbbr).join(", ")
      : "none"
  const version = `TK-Authority-${new Date().toISOString().slice(0, 7)}`

  return [
    "PART G — ADAPTIVE AI AUTHORITY LIBRARY (CONSTANT UPDATES)",
    "",
    `Authority Library Version ID: ${version}`,
    `Last Updated Date: ${formatDateUtc()}`,
    `Jurisdiction Filters Applied: Federal + ${jurisdiction.primary.stateAbbr}${secondary !== "none" ? ` + ${secondary}` : ""}`,
    "Update Discipline: Citations must be validated against official sources before inclusion.",
    "",
    "Confidence Flags:",
    "• State-Specific Authority",
    "• Preemption-Sensitive Authority",
    "• Subject to Legislative Updates",
    "• Subject to New Judicial Decisions",
    "• Verification Required (when applicable)",
    "",
    AUTHORITY_LIBRARY_STATEMENT,
  ].join("\n")
}

function partH() {
  return [
    "PART H — CITATION RULES (MANDATORY)",
    "",
    "• Statutes/Acts: official code citation (title/chapter/section).",
    "• Regulations: state administrative code citation (title/part/section).",
    "• Policies/Guidance: agency name + document title + publication date (if available) + official reference.",
    "• Cases: court + year + reporter preferred; otherwise docket + court + year + official/public source.",
    "• No Citation = No Claim: omit or mark 'Verification Required' and explain what must be verified.",
    "",
    "HARD RULES (NON-NEGOTIABLE)",
    "• Auto-State Selection: controlling state from current/most recent bureau report address when extracted; otherwise case file state.",
    "• No Fabrication: do not invent statutes, cases, ordinances, or policies.",
    "• Neutral Tone: no accusations; no guaranteed outcomes; no liability conclusions.",
    "• Procedural Focus: rights, documentation, complaints, verification standards.",
    "• Preemption Awareness: use state law for record-building without drafting preempted claims.",
    "• Citations Required for listed authorities; unverified items labeled Verification Required.",
  ].join("\n")
}

export function buildSection3ABody(input: {
  clientName: string
  caseState: string
  extractions: BureauExtraction[]
  hasCollectionActivity?: boolean
}) {
  const jurisdiction = resolveControllingState(input.extractions, input.caseState)
  const profile = getStateRightsProfile(jurisdiction.primaryStateInput)

  const hasCollectionActivity =
    input.hasCollectionActivity ??
    input.extractions.some(
      (e) => e.collections.length > 0 || e.tradelines.some((t) => t.is_negative)
    )

  return [
    "AI GENERATION INSTRUCTIONS (STATE-AUTO-RENDER + CITED AUTHORITIES)",
    "",
    "Purpose: Educational, procedural self-help module complementing federal FCRA rights.",
    `Consumer: ${input.clientName}`,
    "",
    partA(profile, jurisdiction, hasCollectionActivity),
    "",
    partB(profile),
    "",
    partC(),
    "",
    partD(jurisdiction.primary.stateName, jurisdiction.primary.stateAbbr),
    "",
    partE(),
    "",
    partF(profile),
    "",
    partG(jurisdiction),
    "",
    partH(),
    "",
    "REQUIRED SECTION DISCLAIMER (END)",
    REQUIRED_DISCLAIMER,
  ].join("\n")
}

export const SECTION_3A_DEFINITION = {
  id: "3A",
  title: "Know Your Rights and Protection Under Your Residing State",
  label: "3A",
} as const
