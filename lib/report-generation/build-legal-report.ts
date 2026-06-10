import "server-only"
import type { Bureau } from "@/types/case"
import type { CaseMetrics } from "@/types/credit-report"
import type { LegalReportContent, LegalReportSection } from "@/types/legal-report"
import type { BureauExtraction } from "@/lib/extraction/schema"
import type { NormalizedTradelineInput } from "@/lib/normalization/normalize-tradelines"
import {
  FINAL_DISCLAIMER_BLOCK,
  NOTICE_OF_LIMITATION,
  REPORT_COVER,
  REPORT_SECTION_DEFINITIONS,
  getStateLawBlock,
} from "@/lib/report-generation/report-template"
import { sectionDisplayNumber } from "@/lib/report-generation/report-format"
import { buildAllTradelineFindings } from "@/lib/report-generation/build-tradeline-finding"
import { buildSection3ABody } from "@/lib/report-generation/build-section-3a"
import {
  formatBureauCheckboxes,
  formatScoresLine,
  formatUtilizationLine,
} from "@/lib/metrics/executive-snapshot"
import { legalReportToMarkdown } from "@/lib/report-generation/legal-report-markdown"

export type BuildLegalReportInput = {
  clientName: string
  caseState: string
  caseReference: string
  metrics: CaseMetrics
  tradelines: NormalizedTradelineInput[]
  extractions: BureauExtraction[]
  uploadedFiles: { bureau: Bureau; file_name: string; report_date?: string | null }[]
}

function buildSectionBodies(input: BuildLegalReportInput): Record<string, string> {
  const { clientName, caseState, metrics, tradelines, extractions, uploadedFiles } = input
  const snap = metrics.executive_snapshot
  const upperName = clientName.toUpperCase()
  const stateAbbr = caseState.length === 2 ? caseState.toUpperCase() : caseState

  const avgScoreLabel =
    metrics.bureaus_analyzed.length === 3
      ? String(metrics.average_score ?? "N/A")
      : `N/A${snap?.missing_bureaus_note ?? ""}`

  const avgUtilLabel =
    metrics.average_utilization != null
      ? `${metrics.average_utilization}%${snap?.missing_bureaus_note ?? ""}`
      : `N/A${snap?.missing_bureaus_note ?? ""}`

  const section4 = [
    snap ? formatScoresLine(snap) : "Scores: N/A",
    `TurnKey Credit Average Score (3-bureau): ${avgScoreLabel}`,
    snap ? `Available-bureau average (current): ${metrics.average_score ?? "N/A"}` : "",
    snap ? formatUtilizationLine(snap) : "",
    `TurnKey Credit Average Usage (3-bureau): ${avgUtilLabel}`,
    `TurnKey AIR (Annual Inquiry Rate proxy): ${metrics.inquiry_rate ?? "N/A"}`,
    "Executive View:",
    `• Credit Tier: ${snap?.credit_tier ?? "N/A"}`,
    `• Risk Profile: ${snap?.risk_profile ?? "N/A"}`,
    `• Funding Readiness: ${snap?.funding_readiness ?? "N/A"}`,
    ...(snap?.primary_limiters ?? []).map((l) => `• Primary Limiter(s): ${l}`),
  ]
    .filter(Boolean)
    .join("\n")

  const allInquiries = extractions.flatMap((e) =>
    e.inquiries.map((inq) => ({ ...inq, bureau: e.bureau }))
  )

  const inquiryExhibit = allInquiries
    .map(
      (inq) =>
        `• ${inq.bureau.charAt(0).toUpperCase() + inq.bureau.slice(1)}: ${inq.creditor_name} — ${inq.inquiry_type} — ${inq.inquiry_date ?? "date N/A"} — Status: Purpose Proof Required unless consumer-initiated documentation is retained.`
    )
    .join("\n")

  const evidenceLines = [
    "experian",
    "equifax",
    "transunion",
  ].map((bureau) => {
    const upload = uploadedFiles.find((u) => u.bureau === bureau)
    const label = bureau.charAt(0).toUpperCase() + bureau.slice(1)
    if (upload) {
      return `• ${label} printable report (PDF) — File: ${upload.file_name}${upload.report_date ? ` — Date generated: ${upload.report_date}` : ""}`
    }
    return `• ${label} PDF — Not available in current upload set (expired or not uploaded)`
  })

  const hasNegative = metrics.negative_item_count > 0 || metrics.collections_count > 0

  const section19 = [
    `${hasNegative ? "[X]" : "[ ]"} Reporting accuracy generally strong`,
    `${hasNegative ? "[X]" : "[ ]"} Proof required for specific tradelines (negative items / collection / charge-off notation)`,
    "[ ] Investigation deficient (method-of-verification failure) — pending bureau response",
    "[X] Identity contamination flags present (review addresses/aliases in bureau PDFs)",
    "[X] Agency escalation recommended (state safe harbor then federal oversight if needed)",
    "[X] Rights preserved under state law, FCRA, and § 1981",
  ].join("\n")

  const tradelineTable = tradelines
    .map((tl) => {
      const bal = tl.balance != null ? `$${tl.balance}` : "—"
      const lim = tl.credit_limit != null ? `Limit $${tl.credit_limit}` : "Orig N/A"
      return `${tl.creditor_name} | ${tl.account_type ?? "—"} | ${tl.date_opened ?? "—"} | ${tl.account_status ?? "—"} | ${bal} | ${lim}`
    })
    .join("\n")

  return {
    "1": [
      `Consumer Name: ${upperName}`,
      `State of Residence: ${stateAbbr}`,
      `Credit Bureaus Reviewed: ${formatBureauCheckboxes(metrics.bureaus_analyzed)}`,
      "The consumer is a natural person asserting statutory rights and protections under federal and state law. No implied consent, blanket authorization, or waiver of rights is granted to any credit reporting agency, furnisher, or third party.",
    ].join("\n"),
    "2": [
      "This report exists to:",
      "• Examine whether CRAs and furnishers possess lawful authority to access, report, reinvestigate, and render 'verified' findings",
      "• Identify procedural deficiencies involving accuracy standards, objective verifiability, and investigation duties",
      "• Equip the consumer with lawful self-help enforcement directives and record-building methods",
    ].join("\n"),
    "3": [
      "Federal Statutes",
      "• FCRA: 15 U.S.C. §§ 1681e(b), 1681i, 1681i(a)(6), 1681s-2(b), 1681b, 1681t",
      "• GLBA: 15 U.S.C. §§ 6801-6809",
      "Federal Case Law (Baseline Library)",
      "• Pinson v. JPMorgan Chase Bank, N.A., 916 F.3d 1306 (11th Cir. 2019)",
      "• Hinkle v. Midland Credit Mgmt., 827 F.3d 1295 (11th Cir. 2016)",
      "• Johnson v. MBNA, 357 F.3d 426 (4th Cir. 2004)",
      "• Roberts v. Carter-Young, Inc., No. 23-1911 (4th Cir. 2025)",
      "• TransUnion LLC v. Ramirez, 594 U.S. ___ (2021)",
      getStateLawBlock(caseState),
      "Federal/Administrative Guidance (Auto-Injected)",
      "• Permissible purpose and access review under 15 U.S.C. § 1681b",
      "• CFPB supervisory/enforcement themes (reasonable investigation, dispute handling)",
    ].join("\n"),
    "3A": buildSection3ABody({
      clientName,
      caseState,
      extractions,
      hasCollectionActivity:
        metrics.collections_count > 0 || metrics.negative_item_count > 0,
    }),
    "4": section4,
    "5": [
      "Each inquiry and tradeline must be supported by documented permissible purpose under 15 U.S.C. § 1681b.",
      "All inquiries are logged in Appendix: Inquiry Index, and any inquiry lacking a clear consumer-initiated basis is flagged 'Purpose Proof Required.'",
    ].join("\n"),
    "6": [
      "Each account is classified as:",
      "• [X] Personal Obligation",
      "• [ ] Personal Guaranty",
      "• [ ] Authorized User",
      "• [ ] Business Signer Only",
      "• [ ] Business Owner (No Guaranty)",
      "Legal Interpretation:",
      "Reporting is lawful where personal contractual liability exists. Ownership or affiliation alone does not establish reportable liability.",
    ].join("\n"),
    "7": "Per Roberts v. Carter-Young (2025), disputed information must be factually accurate, complete, and objectively and readily verifiable. Automated confirmation alone may be deficient where documentary proof is requested.",
    "8": [
      "CRAs must conduct reasonable reinvestigation under 15 U.S.C. § 1681i.",
      "Furnishers must investigate upon CRA notice under 15 U.S.C. § 1681s-2(b).",
      "The consumer has the right to a verification description under 15 U.S.C. § 1681i(a)(6).",
    ].join("\n"),
    "9": [
      "Potential identity discrepancies implicate GLBA data integrity principles and state consumer protection duties.",
      "Flags:",
      "• Addresses: Review all reported addresses in bureau PDFs; confirm current residency and validate address timelines.",
      "• Employer: Confirm employer field(s) in each bureau PDF; treat as 'not reported' if absent.",
      "• Mixed file risk: Review 'also known as' and name variants; rule out mis-OCR or mixed-file contamination.",
    ].join("\n"),
    "10": buildAllTradelineFindings(tradelines),
    "11": [
      "If a bureau responds 'verified' without disclosed methodology or primary documentation, the consumer may issue:",
      "• Notice of Deficient Investigation",
      "• Findings Rejection",
      "• Demand deletion/suppression pending compliance",
    ].join("\n"),
    "12": [
      "Primary:",
      "• Experian dispute and method-of-verification request",
      "• Equifax dispute and method-of-verification request (if uploaded)",
      "• TransUnion dispute and method-of-verification request (if uploaded)",
      "• Furnisher disputes as applicable (original creditor / collector / account owner)",
      `State-Level Safe Harbor (${caseState}):`,
      `• ${caseState} Office of Attorney General — Bureau of Consumer Protection (consumer complaint portal)`,
      `• ${caseState} financial regulator / banking department — where applicable to financial entities`,
      "Federal Oversight:",
      "• CFPB — Submit a complaint (credit reporting / debt collection / credit cards)",
      "• FTC — ReportFraud.ftc.gov (bad business practices / fraud reporting)",
    ].join("\n"),
    "13": "Safe harbor is established through sequence, proof of service, and record discipline, preserving state posture and defeating 'failure to exhaust' defenses.",
    "14": "Recommended filing order:\n• CRA → Furnisher → State AG → State regulator → CFPB → FTC → (optional litigation after exhaustion)",
    "15": "CRAs are not immune from willful noncompliance, reckless investigation failures, or procedural violations. Immunity defenses strengthen when consumers fail to preserve procedural rights — therefore this report focuses on preservation and record-building.",
    "16": [
      "Authority: 42 U.S.C. § 1981 (Civil Rights Act of 1866) protects the equal right of all persons to make and enforce contracts, including the enjoyment of all benefits and conditions of contractual relationships.",
      "Notice: This section does not claim automatic contract formation against any creditor. It preserves equal-contracting rights and creates a variance record if outcomes deviate from objective criteria without lawful explanation.",
      "Civil Rights Variance Record (Auto-Generate On Adverse Action):",
      "• Issuer - Product - Date - Stated reason - Objective metrics at time of application - Outcome type - Variance marker - Rights reserved under § 1981(b)",
    ].join("\n"),
    "17": "Escalation is administrative, not adversarial. Objective: lawful compliance, correction, and properly documented reporting.",
    "18": [
      "Maintain:",
      "• Credit reports used (with timestamps)",
      "• Dispute letters",
      "• Proof of mailing/service",
      "• CRA responses",
      "• Method-of-verification requests/responses",
      "• Agency confirmation numbers",
      "Evidence Index (Current Upload Set):",
      ...evidenceLines,
    ].join("\n"),
    "19": section19,
    "20": FINAL_DISCLAIMER_BLOCK,
    "21": [
      "Exhibit A: Unified Tradeline Table",
      tradelineTable || "(no tradelines in current upload set)",
      "",
      "Exhibit B: Inquiry Index + Permissible Purpose Flags",
      inquiryExhibit || "• No inquiries extracted.",
      "",
      "Exhibit C: Account-Level Legal Findings (One per Tradeline)",
      "See Section 10 - Account-Level Legal Findings (Mandatory).",
      "",
      "Exhibit D: Dispute Letter Pack (CRA + Furnisher) — Templates",
      "Template 1 — CRA Dispute + Method-of-Verification Request (15 U.S.C. § 1681i(a)(6)): Use standard TurnKey dispute pack.",
      "",
      "Exhibit E: Agency Filing Pack (State AG + CFPB + FTC) — Templates",
      "Use state safe harbor filing templates included in TurnKey agency filing center.",
      "",
      "Exhibit F: Civil Rights Variance Record Log (§ 1981)",
      "Issuer | Product | Date | Stated reason | Objective metrics | Outcome | Variance marker | Rights reserved",
    ].join("\n"),
  }
}

export function buildLegalReport(input: BuildLegalReportInput): LegalReportContent {
  const bodies = buildSectionBodies(input)
  const generatedAt = new Date().toISOString()

  const sections: LegalReportSection[] = REPORT_SECTION_DEFINITIONS.map((def) => ({
    id: def.id,
    number: sectionDisplayNumber(def),
    title: def.title,
    body: bodies[def.id] ?? "",
  }))

  const content: LegalReportContent = {
    cover: { ...REPORT_COVER },
    notice_of_limitation: NOTICE_OF_LIMITATION,
    table_of_contents: REPORT_SECTION_DEFINITIONS.map((s) => s.title),
    sections,
    disclaimer: NOTICE_OF_LIMITATION,
    non_representation:
      "This report is generated for educational and self-help purposes only. The user is responsible for all filings, disputes, and communications with credit reporting agencies and furnishers.",
    metrics: input.metrics,
    client_name: input.clientName,
    case_state: input.caseState,
    case_reference: input.caseReference,
    generated_at: generatedAt,
  }

  return content
}

export function buildLegalReportWithMarkdown(input: BuildLegalReportInput) {
  const content = buildLegalReport(input)
  return {
    content,
    markdown: legalReportToMarkdown(content),
  }
}
