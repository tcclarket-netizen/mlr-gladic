import "server-only"
import fs from "fs"
import path from "path"
import JSZip from "jszip"
import type { SelfReportFillInput } from "@/lib/report-generation/build-self-report-data"

const TEMPLATE_PATH = path.join(
  process.cwd(),
  "lib/report-generation/templates/self-report-official.docx"
)

const IMPORTANT_NOTICE_TEXT =
  "Important Notice: This package is an educational, self-help form set. It is not legal advice, not legal representation, and not a guarantee of outcome. The consumer must review every form, verify all facts, attach evidence, comply with all court and agency rules, and may consult a licensed attorney before filing. The package is designed to build an administrative record before litigation is considered."

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

function decodeXmlEntities(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
}

function applyReplacementsToPlainText(
  text: string,
  replacements: Record<string, string>,
  stateName: string
) {
  const ordered = Object.entries(replacements).sort((a, b) => b[0].length - a[0].length)
  let combined = text
  for (const [from, to] of ordered) {
    if (!combined.includes(from)) continue
    combined = combined.split(from).join(to)
  }
  combined = combined.replace(/\bFlorida\b/g, stateName)
  combined = combined.replace(/\bFLORIDA\b/g, stateName.toUpperCase())
  return combined
}

/**
 * Word often splits one visible line across multiple <w:t> runs. Merge per paragraph,
 * apply replacements on full text, then write back into the first run.
 */
function applyParagraphMergedReplacements(
  documentXml: string,
  replacements: Record<string, string>,
  stateName: string
) {
  return documentXml.replace(/<w:p\b[\s\S]*?<\/w:p>/g, (paragraph) => {
    const runs: { attrs: string; content: string }[] = []
    const re = /<w:t([^>]*)>([^<]*)<\/w:t>/g
    let match: RegExpExecArray | null
    while ((match = re.exec(paragraph))) {
      runs.push({
        attrs: match[1],
        content: decodeXmlEntities(match[2]),
      })
    }
    if (runs.length === 0) {
      return paragraph
    }

    const original = runs.map((r) => r.content).join("")
    const combined = applyReplacementsToPlainText(original, replacements, stateName)
    if (combined === original) {
      return paragraph
    }

    let runIndex = 0
    return paragraph.replace(/<w:t([^>]*)>([^<]*)<\/w:t>/g, (_full, attrs: string) => {
      if (runIndex === 0) {
        runIndex += 1
        return `<w:t${attrs}>${escapeXml(combined)}</w:t>`
      }
      runIndex += 1
      return `<w:t${attrs}></w:t>`
    })
  })
}

function applyReplacements(xml: string, replacements: Record<string, string>) {
  const ordered = Object.entries(replacements).sort((a, b) => b[0].length - a[0].length)
  let next = xml
  for (const [token, value] of ordered) {
    next = next.split(token).join(escapeXml(value))
  }
  return next
}

function applyImportantNoticeRed(documentXml: string) {
  const noticeIndex = documentXml.indexOf(IMPORTANT_NOTICE_TEXT)
  if (noticeIndex === -1) {
    return documentXml
  }

  const paragraphStart = documentXml.lastIndexOf("<w:p ", noticeIndex)
  const paragraphEnd = documentXml.indexOf("</w:p>", noticeIndex)
  if (paragraphStart === -1 || paragraphEnd === -1) {
    return documentXml
  }

  const paragraphEndInclusive = paragraphEnd + "</w:p>".length
  let paragraph = documentXml.slice(paragraphStart, paragraphEndInclusive)

  paragraph = paragraph.replace(/<w:rPr([^>]*)>/g, `<w:rPr$1><w:color w:val="FF0000"/>`)

  return (
    documentXml.slice(0, paragraphStart) +
    paragraph +
    documentXml.slice(paragraphEndInclusive)
  )
}

export async function generateSelfReportDocx(
  input: SelfReportFillInput
): Promise<Buffer> {
  const template = fs.readFileSync(TEMPLATE_PATH)
  const zip = await JSZip.loadAsync(template)
  const stateName = input.stateName

  const xmlParts = Object.keys(zip.files).filter((name) => name.endsWith(".xml"))

  for (const part of xmlParts) {
    const file = zip.file(part)
    if (!file) continue
    let xml = await file.async("string")
    if (part === "word/document.xml") {
      xml = applyParagraphMergedReplacements(xml, input.replacements, stateName)
      xml = applyImportantNoticeRed(xml)
    } else {
      xml = applyReplacements(xml, input.replacements)
    }
    zip.file(part, xml)
  }

  return Buffer.from(
    await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
    })
  )
}
