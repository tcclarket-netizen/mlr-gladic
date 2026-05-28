import "server-only"

/** @deprecated Use buildLegalReport from ./build-legal-report — deterministic template, no OpenAI. */
export {
  buildLegalReport as generateLegalReport,
  buildLegalReportWithMarkdown,
} from "@/lib/report-generation/build-legal-report"
export { legalReportToMarkdown } from "@/lib/report-generation/legal-report-markdown"
