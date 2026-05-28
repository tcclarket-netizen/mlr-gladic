import "server-only"
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib"
import type { LegalReportContent } from "@/types/legal-report"
import { sectionHeading } from "@/lib/report-generation/report-template"
import {
  formatBureauCheckboxes,
  formatScoresLine,
  formatUtilizationLine,
} from "@/lib/metrics/executive-snapshot"

const PAGE_WIDTH = 612
const PAGE_HEIGHT = 792
const MARGIN = 54
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2
// Match reference DOCX typewriter rhythm (Normal: 11pt with ~1.25 spacing).
const LINE_HEIGHT = 1.25

/** Standard Helvetica in pdf-lib only supports WinAnsi; normalize Unicode before measuring/drawing. */
const PDF_UNICODE_REPLACEMENTS: [string, string][] = [
  ["\u2192", "->"],
  ["\u2190", "<-"],
  ["\u2194", "<->"],
  ["\u2022", "-"],
  ["\u2013", "-"],
  ["\u2014", "-"],
  ["\u2122", "(TM)"],
  ["\u2018", "'"],
  ["\u2019", "'"],
  ["\u201C", '"'],
  ["\u201D", '"'],
  ["\u2026", "..."],
  ["\u00A0", " "],
]

export function sanitizeTextForPdf(text: string): string {
  let out = text
  for (const [from, to] of PDF_UNICODE_REPLACEMENTS) {
    out = out.split(from).join(to)
  }
  // Drop any remaining code points outside WinAnsi (roughly Windows-1252)
  return out.replace(/[^\t\n\r\u0020-\u007E\u00A0-\u00FF]/g, "?")
}

function formatGeneratedDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

function wrapText(text: string, font: PDFFont, fontSize: number, maxWidth: number): string[] {
  const lines: string[] = []
  const safeText = sanitizeTextForPdf(text)

  for (const paragraph of safeText.split("\n")) {
    if (!paragraph.trim()) {
      lines.push("")
      continue
    }

    const words = paragraph.split(/\s+/)
    let current = ""

    for (const word of words) {
      const test = current ? `${current} ${word}` : word
      if (font.widthOfTextAtSize(test, fontSize) <= maxWidth) {
        current = test
      } else {
        if (current) lines.push(current)
        current = word
      }
    }
    if (current) lines.push(current)
  }

  return lines
}

class PdfWriter {
  private pdfDoc: PDFDocument
  private page: PDFPage
  private y: number
  private readonly fonts: {
    regular: PDFFont
    bold: PDFFont
    italic: PDFFont
  }

  private constructor(
    pdfDoc: PDFDocument,
    page: PDFPage,
    fonts: { regular: PDFFont; bold: PDFFont; italic: PDFFont }
  ) {
    this.pdfDoc = pdfDoc
    this.page = page
    this.fonts = fonts
    this.y = PAGE_HEIGHT - MARGIN
  }

  static async create() {
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
    const [regular, bold, italic] = await Promise.all([
      pdfDoc.embedFont(StandardFonts.Courier),
      pdfDoc.embedFont(StandardFonts.CourierBold),
      pdfDoc.embedFont(StandardFonts.CourierOblique),
    ])
    return new PdfWriter(pdfDoc, page, { regular, bold, italic })
  }

  private ensureSpace(minHeight: number) {
    if (this.y - minHeight < MARGIN + 24) {
      this.addPage()
    }
  }

  addPage() {
    this.page = this.pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
    this.y = PAGE_HEIGHT - MARGIN
  }

  addVerticalSpace(px: number) {
    this.y -= px
  }

  writeCentered(text: string, font: PDFFont, fontSize: number, color = rgb(0.06, 0.09, 0.16)) {
    const safe = sanitizeTextForPdf(text)
    this.ensureSpace(fontSize * LINE_HEIGHT)
    const textWidth = font.widthOfTextAtSize(safe, fontSize)
    this.page.drawText(safe, {
      x: (PAGE_WIDTH - textWidth) / 2,
      y: this.y,
      size: fontSize,
      font,
      color,
    })
    this.y -= fontSize * LINE_HEIGHT * 1.2
  }

  writeHeading(text: string, fontSize = 13) {
    const safe = sanitizeTextForPdf(text)
    this.ensureSpace(20)
    this.page.drawText(safe, {
      x: MARGIN,
      y: this.y,
      size: fontSize,
      font: this.fonts.bold,
      color: rgb(0.06, 0.09, 0.16),
    })
    this.y -= fontSize * LINE_HEIGHT * 1.4
  }

  writeBlock(
    text: string,
    options?: { fontSize?: number; bold?: boolean; italic?: boolean; gap?: number }
  ) {
    const fontSize = options?.fontSize ?? 10
    const font = options?.bold
      ? this.fonts.bold
      : options?.italic
        ? this.fonts.italic
        : this.fonts.regular
    const lineHeight = fontSize * LINE_HEIGHT
    const lines = wrapText(text, font, fontSize, CONTENT_WIDTH)

    for (const line of lines) {
      this.ensureSpace(lineHeight)
      if (line) {
        this.page.drawText(line, {
          x: MARGIN,
          y: this.y,
          size: fontSize,
          font,
          color: rgb(0.06, 0.06, 0.06),
        })
      }
      this.y -= lineHeight
    }

    this.y -= options?.gap ?? 8
  }

  get boldFont() {
    return this.fonts.bold
  }

  get regularFont() {
    return this.fonts.regular
  }

  async finish(): Promise<Buffer> {
    const pages = this.pdfDoc.getPages()
    const footerFont = this.fonts.regular
    const footerSize = 7

    pages.forEach((page, index) => {
      const footer = sanitizeTextForPdf(`TurnKey Credit - Page ${index + 1} of ${pages.length}`)
      const footerWidth = footerFont.widthOfTextAtSize(footer, footerSize)
      page.drawText(footer, {
        x: (PAGE_WIDTH - footerWidth) / 2,
        y: MARGIN - 18,
        size: footerSize,
        font: footerFont,
        color: rgb(0.58, 0.64, 0.72),
      })
    })

    const bytes = await this.pdfDoc.save()
    return Buffer.from(bytes)
  }
}

export async function generateLegalReportPdf(
  content: LegalReportContent,
  referenceCode: string
): Promise<Buffer> {
  const writer = await PdfWriter.create()
  const muted = rgb(0.28, 0.33, 0.41)
  const cover = content.cover
  const snap = content.metrics.executive_snapshot

  // DOCX title uses 32 half-points (16pt)
  writer.writeCentered(cover.title, writer.boldFont, 16)
  writer.addVerticalSpace(4)
  writer.writeCentered(cover.subtitle, writer.regularFont, 11, muted)
  writer.addVerticalSpace(16)

  const metaLines = [
    `Prepared By: ${cover.prepared_by}`,
    `Report Classification: ${cover.classification}`,
    `Client Capacity: ${cover.client_capacity}`,
    `Scope: ${cover.scope}`,
    `Delivery Format: ${cover.delivery_format}`,
    `Record Type: ${cover.record_type}`,
    "",
    `Client: ${content.client_name}`,
    `State: ${content.case_state}`,
    `Case: ${content.case_reference || referenceCode}`,
    `Generated: ${formatGeneratedDate(content.generated_at)}`,
  ]
  writer.writeBlock(metaLines.join("\n"), { fontSize: 11, gap: 12 })

  writer.writeHeading("NOTICE OF LIMITATION & NON-REPRESENTATION", 13)
  writer.writeBlock(content.notice_of_limitation, { fontSize: 11, italic: true, gap: 16 })

  writer.addPage()
  writer.writeHeading("TABLE OF CONTENTS", 13)
  writer.addVerticalSpace(4)
  content.table_of_contents.forEach((title, i) => {
    writer.writeBlock(`${i + 1}. ${title}`, { fontSize: 11, gap: 2 })
  })

  writer.addPage()
  writer.writeHeading(sectionHeading(4, "TurnKey Credit Metrics & Executive Snapshot"), 13)

  const m = content.metrics
  const metricsBlock = [
    snap ? formatScoresLine(snap) : "Scores: N/A",
    `TurnKey Credit Average Score (3-bureau): ${m.average_score ?? "N/A"}`,
    snap ? formatUtilizationLine(snap) : "",
    `TurnKey Credit Average Usage (3-bureau): ${m.average_utilization != null ? `${m.average_utilization}%` : "N/A"}`,
    `TurnKey AIR (Annual Inquiry Rate proxy): ${m.inquiry_rate ?? "N/A"}`,
    "Executive View:",
    snap ? `Credit Tier: ${snap.credit_tier}` : "",
    snap ? `Risk Profile: ${snap.risk_profile}` : "",
    snap ? `Funding Readiness: ${snap.funding_readiness}` : "",
    ...(snap?.primary_limiters ?? []).map((l) => `Primary Limiter: ${l}`),
    `Bureaus Reviewed: ${formatBureauCheckboxes(m.bureaus_analyzed)}`,
  ]
    .filter(Boolean)
    .join("\n")

  writer.writeBlock(metricsBlock, { fontSize: 11, gap: 16 })

  for (const section of content.sections) {
    writer.addPage()
    writer.writeHeading(sectionHeading(section.number, section.title), 13)
    writer.writeBlock(section.body, { fontSize: 11, gap: 12 })
  }

  return writer.finish()
}
