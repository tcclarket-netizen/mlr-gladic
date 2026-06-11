import "server-only"

export {
  REPORT_SECTION_DEFINITIONS,
  sectionHeading,
} from "@/lib/report-generation/report-format"

export const REPORT_COVER = {
  title: "MY LEGAL REPORT™",
  subtitle:
    "Credit Rights, Deterrence, Rebuttal & Jurisdiction Preservation Report",
  prepared_by: "GLADIC AI™",
  classification: "Educational & Self-Help Legal Interpretation",
  client_capacity: "Self-Represented Consumer (28 U.S.C. § 1654)",
  scope: "Federal & State (as applicable)",
  delivery_format: "AI-Fillable DOCX",
  record_type: "Administrative & Procedural Enforcement File",
} as const

export const NOTICE_OF_LIMITATION = `NOTICE OF LIMITATION & NON-REPRESENTATION

This report is not legal advice.
This report is not legal representation.
GLADIC AI™ is not a law firm.
This report is an educational, procedural, and self-help legal interpretation designed to inform consumers of their rights, remedies, and lawful enforcement mechanisms regarding credit reporting activity.
All actions discussed herein are performed solely by the consumer, acting in their own name, under lawful self-representation authority.`

export const FINAL_DISCLAIMER_BLOCK = `No guarantees are made. No outcomes are promised. This report is educational and procedural only.
This report is not legal advice. This report is not legal representation. GLADIC AI™ is not a law firm.
Operator prompts must never claim guaranteed deletion/approval. Use procedural deficiency language unless fraud is evidenced.`

export const SUPPORTING_AUTHORITY_BLOCK = `Supporting Authority:
• Primary Statutes:
• 15 U.S.C. § 1681e(b)
• 15 U.S.C. § 1681i
• 15 U.S.C. § 1681i(a)(6)
• 15 U.S.C. § 1681s-2(b)
• 15 U.S.C. § 1681b
• 15 U.S.C. §§ 6801-6809 (GLBA)
• Primary Cases:
• Roberts v. Carter-Young, Inc., No. 23-1911 (4th Cir. 2025)
• Johnson v. MBNA, 357 F.3d 426 (4th Cir. 2004)
• Hinkle v. Midland Credit Mgmt., 827 F.3d 1295 (11th Cir. 2016)
• Pinson v. JPMorgan Chase Bank, N.A., 916 F.3d 1306 (11th Cir. 2019)
• TransUnion LLC v. Ramirez, 594 U.S. ___ (2021)`

export const AFFIRMATIVE_POSTURE_BLOCK = `Affirmative Cause-to-Action Posture:
Right to demand documentary verification, method-of-verification disclosure, correction/suppression pending compliance, and record preservation — without allegation of fraud by default.
Preserved Rights: Verification - Correction - State Enforcement - Record-Building`

export function getStateLawBlock(state: string): string {
  return `State Law (Auto-Injected: ${state})
• State consumer protection and fair credit reporting principles may apply where personal consumer transactions are involved.
• Consult applicable state unfair trade practices, debt collection, and credit reporting statutes for ${state}.
• Pennsylvania-style references in template libraries are replaced at generation time for the consumer's state of residence.`
}
