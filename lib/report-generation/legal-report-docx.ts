import "server-only"
import {
  AlignmentType,
  Document,
  Packer,
  PageBreak,
  Paragraph,
  TextRun,
} from "docx"
import type { LegalReportContent } from "@/types/legal-report"
import { sectionHeading } from "@/lib/report-generation/report-template"

/** Reference TYPEWRITER_FINAL.docx: Courier New, 11pt body, 13pt headings, 16pt title. */
const FONT = "Courier New"
const SIZE_BODY = 22
const SIZE_HEADING = 26
const SIZE_TITLE = 32
const HEADING_COLOR = "365F91"

function formatReportDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

function paragraph(
  text: string,
  opts?: { bold?: boolean; italics?: boolean; center?: boolean; size?: number; color?: string }
) {
  return new Paragraph({
    alignment: opts?.center ? AlignmentType.CENTER : undefined,
    spacing: { after: 160, line: 276 },
    children: [
      new TextRun({
        text: text || " ",
        font: FONT,
        size: opts?.size ?? SIZE_BODY,
        bold: opts?.bold,
        italics: opts?.italics,
        color: opts?.color,
      }),
    ],
  })
}

function paragraphsFromBlock(text: string, opts?: { italics?: boolean }) {
  return text.split("\n").map((line) => paragraph(line, { italics: opts?.italics }))
}

function sectionTitleParagraph(number: number | string, title: string) {
  return paragraph(sectionHeading(number, title), {
    bold: true,
    size: SIZE_HEADING,
    color: HEADING_COLOR,
  })
}

export async function generateLegalReportDocx(
  content: LegalReportContent,
  referenceCode: string
): Promise<Buffer> {
  const cover = content.cover
  const reference = content.case_reference || referenceCode
  const children: Paragraph[] = []

  children.push(
    paragraph(cover.title, { bold: true, center: true, size: SIZE_TITLE }),
    paragraph(cover.subtitle, { center: true }),
    paragraph(""),
    paragraph(`Prepared By: ${cover.prepared_by}`),
    paragraph(`Report Classification: ${cover.classification}`),
    paragraph(`Client Capacity: ${cover.client_capacity}`),
    paragraph(`Scope: ${cover.scope}`),
    paragraph(`Delivery Format: ${cover.delivery_format}`),
    paragraph(`Record Type: ${cover.record_type}`),
    paragraph(""),
    paragraph(`Client: ${content.client_name}`),
    paragraph(`State: ${content.case_state}`),
    paragraph(`Case: ${reference}`),
    paragraph(`Generated: ${formatReportDate(content.generated_at)}`),
    paragraph(""),
    paragraph("NOTICE OF LIMITATION & NON-REPRESENTATION", { bold: true, size: SIZE_HEADING }),
    ...paragraphsFromBlock(content.notice_of_limitation, { italics: true }),
    new Paragraph({ children: [new PageBreak()] }),
    paragraph("TABLE OF CONTENTS", { bold: true, size: SIZE_HEADING })
  )

  content.sections.forEach((section) => {
    children.push(paragraph(`${section.number}. ${section.title}`))
  })

  children.push(new Paragraph({ children: [new PageBreak()] }))

  content.sections.forEach((section, index) => {
    children.push(sectionTitleParagraph(section.number, section.title))
    children.push(...paragraphsFromBlock(section.body))
    if (index < content.sections.length - 1) {
      children.push(new Paragraph({ children: [new PageBreak()] }))
    }
  })

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: FONT,
            size: SIZE_BODY,
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertMarginInches(1),
              right: convertMarginInches(1),
              bottom: convertMarginInches(1),
              left: convertMarginInches(1),
            },
          },
        },
        children,
      },
    ],
  })

  return Buffer.from(await Packer.toBuffer(doc))
}

function convertMarginInches(inches: number) {
  return Math.round(inches * 1440)
}
