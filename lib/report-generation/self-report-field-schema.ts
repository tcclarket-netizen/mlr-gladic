/**
 * MY SELF REPORT™ official template placeholders.
 * Template: `templates/self-report-official.docx`
 *
 * Each token appears in the DOCX as `{TOKEN}` and is replaced from MY LEGAL REPORT™
 * case data at download time. Phrase-level Florida defaults are replaced with the case state.
 */
export const SELF_REPORT_TEMPLATE_TOKENS = {
  /** Plaintiff / consumer legal name (appears 3× in complaint + verification) */
  CLIENT_FULL_NAME: "{CLIENT FULL NAME}",
  /** Case state of residence (cover page + jurisdiction references) */
  STATE: "{STATE}",
  /** Legacy token — court caption uses fill-in blanks; kept for compatibility */
  COUNTY: "{COUNTY}",
} as const

export type SelfReportTemplateToken =
  (typeof SELF_REPORT_TEMPLATE_TOKENS)[keyof typeof SELF_REPORT_TEMPLATE_TOKENS]

export type SelfReportFieldDefinition = {
  token: SelfReportTemplateToken
  source: "legal_report.client_name" | "legal_report.case_state" | "case.county"
  description: string
}

export const SELF_REPORT_FIELDS: SelfReportFieldDefinition[] = [
  {
    token: SELF_REPORT_TEMPLATE_TOKENS.CLIENT_FULL_NAME,
    source: "legal_report.client_name",
    description: "Consumer full legal name from the generated MY LEGAL REPORT™",
  },
  {
    token: SELF_REPORT_TEMPLATE_TOKENS.STATE,
    source: "legal_report.case_state",
    description: "State of residence selected on the case — drives state-specific form language",
  },
  {
    token: SELF_REPORT_TEMPLATE_TOKENS.COUNTY,
    source: "case.county",
    description: "Legacy caption token; complaint header uses print-and-fill blanks in the template",
  },
]
