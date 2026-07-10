import "server-only"
import type { LegalReportContent } from "@/types/legal-report"
import { convertDocxBufferToPdf } from "@/lib/report-generation/docx-to-pdf"
import { generateLegalReportDocx } from "@/lib/report-generation/legal-report-docx"

/** PDF matches the Word export — LibreOffice headless converts the DOCX (full layout). */
export async function generateLegalReportPdf(
  content: LegalReportContent,
  referenceCode: string
): Promise<Buffer> {
  const docx = await generateLegalReportDocx(content, referenceCode)
  return convertDocxBufferToPdf(docx)
}
