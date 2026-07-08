/**
 * MY SELF REPORT™ official template placeholders.
 * Template: `templates/self-report-official.docx`
 *
 * Each token appears in the DOCX as `{TOKEN}` and is replaced from MY LEGAL REPORT™
 * case data at download time. All other document content is left unchanged.
 */
export const SELF_REPORT_TEMPLATE_TOKENS = {
  /** Plaintiff / consumer legal name (appears 3× in complaint + verification) */
  CLIENT_FULL_NAME: "{CLIENT FULL NAME}",
  /** Florida circuit court county caption, e.g. BROWARD COUNTY */
  COUNTY: "{COUNTY}",
} as const

export type SelfReportTemplateToken =
  (typeof SELF_REPORT_TEMPLATE_TOKENS)[keyof typeof SELF_REPORT_TEMPLATE_TOKENS]

export type SelfReportFieldDefinition = {
  token: SelfReportTemplateToken
    source: "legal_report.client_name" | "case.county"
  description: string
}

export const SELF_REPORT_FIELDS: SelfReportFieldDefinition[] = [
  {
    token: SELF_REPORT_TEMPLATE_TOKENS.CLIENT_FULL_NAME,
    source: "legal_report.client_name",
    description: "Consumer full legal name from the generated MY LEGAL REPORT™",
  },
  {
    token: SELF_REPORT_TEMPLATE_TOKENS.COUNTY,
    source: "case.county",
    description:
      "County from the case file — formatted as e.g. Broward COUNTY when the self-report is generated",
  },
]
