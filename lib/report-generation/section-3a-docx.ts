import "server-only"
import fs from "fs"
import path from "path"
import JSZip from "jszip"
import { normalizeConsumerState } from "@/lib/report-generation/state-rights-data"

const SECTION_3A_DIR = path.join(process.cwd(), "public/all-state-laws")

/** Unique marker paragraph text used while packing the legal report DOCX.
 * Avoid `<`/`>` — those are XML-escaped in document.xml and break string lookup.
 */
export const SECTION_3A_DOCX_BODY_MARKER = "%%GLADIC_SECTION_3A_DOCX_BODY%%"

/** Offset applied to 3A numbering IDs so they do not collide with the host report. */
const NUMBERING_ID_OFFSET = 2000

const DOCX_NAME_RE =
  /^Section_3A_(.+)_Laws_FCRA_Personal_Information_Updated(?: \(\d+\))?\.docx$/i

const STYLE_IDS_TO_MERGE = [
  "TableNormal",
  "TableGrid",
  "ListBullet",
  "Heading1Char",
  "Heading2Char",
] as const

function decodeXmlEntities(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

function textFromXmlFragment(fragment: string) {
  const parts: string[] = []
  const re = /<w:t[^>]*>([^<]*)<\/w:t>/g
  let match: RegExpExecArray | null
  while ((match = re.exec(fragment))) {
    parts.push(decodeXmlEntities(match[1]))
  }
  return parts.join("")
}

export function extractPlainTextFromDocxXml(documentXml: string) {
  const lines: string[] = []
  const segments = documentXml.split(/(?=<w:(?:p|tbl)\b)/)

  for (const segment of segments) {
    if (segment.startsWith("<w:p")) {
      const text = textFromXmlFragment(segment).trim()
      if (text) lines.push(text)
      continue
    }

    if (segment.startsWith("<w:tbl")) {
      const rowRe = /<w:tr\b[^>]*>([\s\S]*?)<\/w:tr>/g
      let rowMatch: RegExpExecArray | null
      while ((rowMatch = rowRe.exec(segment))) {
        const cellRe = /<w:tc\b[^>]*>([\s\S]*?)<\/w:tc>/g
        const cells: string[] = []
        let cellMatch: RegExpExecArray | null
        while ((cellMatch = cellRe.exec(rowMatch[1]))) {
          cells.push(textFromXmlFragment(cellMatch[1]).trim())
        }
        if (cells.some((c) => c)) {
          lines.push(cells.join(" | "))
        }
      }
    }
  }

  return lines.join("\n")
}

function stateLabelFromDocxFilename(filename: string) {
  const match = filename.match(DOCX_NAME_RE)
  if (!match) return null
  return match[1].replace(/_/g, " ")
}

function buildSection3ADocxIndex() {
  const index = new Map<string, string>()

  if (!fs.existsSync(SECTION_3A_DIR)) {
    return index
  }

  for (const filename of fs.readdirSync(SECTION_3A_DIR)) {
    const stateLabel = stateLabelFromDocxFilename(filename)
    if (!stateLabel) continue

    const existing = index.get(stateLabel)
    if (!existing || filename.length < existing.length) {
      index.set(stateLabel, filename)
    }
  }

  return index
}

let cachedIndex: Map<string, string> | null = null

function section3ADocxIndex() {
  if (!cachedIndex) {
    cachedIndex = buildSection3ADocxIndex()
  }
  return cachedIndex
}

export function resolveSection3ADocxPath(stateInput: string): string | null {
  const { stateName } = normalizeConsumerState(stateInput)
  const index = section3ADocxIndex()

  const direct = index.get(stateName)
  if (direct) {
    return path.join(SECTION_3A_DIR, direct)
  }

  const normalizedTarget = stateName.toLowerCase()
  for (const [label, filename] of index.entries()) {
    if (label.toLowerCase() === normalizedTarget) {
      return path.join(SECTION_3A_DIR, filename)
    }
  }

  return null
}

function fillConsumerNameInXml(xml: string, clientName: string) {
  const escaped = escapeXml(clientName)
  // Contiguous: Consumer: ________________
  let next = xml.replace(/Consumer:\s*_{2,}/gi, `Consumer: ${escaped}`)
  // Split across Word runs: Consumer: </w:t> ... <w:t>________________</w:t>
  next = next.replace(
    /(Consumer:\s*<\/w:t><\/w:r>)([\s\S]*?)(<w:t[^>]*>)(_{2,})(<\/w:t>)/i,
    `$1$2$3${escaped}$5`
  )
  return next
}

function extractBodyChildren(documentXml: string) {
  const bodyMatch = documentXml.match(/<w:body[^>]*>([\s\S]*)<\/w:body>/i)
  if (!bodyMatch) {
    throw new Error("Section 3A DOCX is missing w:body")
  }
  return bodyMatch[1].replace(/<w:sectPr\b[\s\S]*$/i, "").trim()
}

function paragraphPlainText(paragraphXml: string) {
  return textFromXmlFragment(paragraphXml).replace(/\s+/g, " ").trim()
}

/**
 * Legal report already prints "3A. Know Your Rights…". Drop the duplicate
 * heading (and trailing blank lines) from the original Section 3A DOCX body.
 */
function stripDuplicateSection3ATitle(bodyXml: string) {
  const paragraphRe = /<w:p\b[\s\S]*?<\/w:p>/g
  let match: RegExpExecArray | null
  let cutIndex = 0
  let removedTitle = false

  while ((match = paragraphRe.exec(bodyXml))) {
    const text = paragraphPlainText(match[0])
    const isSectionTitle =
      /^SECTION\s*3A\b/i.test(text) &&
      /KNOW YOUR RIGHTS/i.test(text)

    if (!removedTitle) {
      if (!text) {
        cutIndex = match.index + match[0].length
        continue
      }
      if (isSectionTitle) {
        removedTitle = true
        cutIndex = match.index + match[0].length
        continue
      }
      break
    }

    // Drop blank paragraphs immediately after the title.
    if (!text) {
      cutIndex = match.index + match[0].length
      continue
    }
    break
  }

  return removedTitle ? bodyXml.slice(cutIndex).trim() : bodyXml
}

/** Usable page width for legal-report DOCX (US Letter, 1" margins) in twips/DXA. */
const LEGAL_REPORT_CONTENT_WIDTH_DXA = 9360 // 6.5 inches

function scaleDxaValue(value: number, factor: number) {
  return Math.max(1, Math.round(value * factor))
}

/**
 * Original Section 3A tables are often ~10" (14400 DXA) fixed width and get
 * clipped in the legal report. Scale grid/cell widths to the content area and
 * switch layout to autofit so LibreOffice/Word can reflow to the page.
 */
function fitTablesToPageWidth(
  bodyXml: string,
  targetWidthDxa = LEGAL_REPORT_CONTENT_WIDTH_DXA
) {
  return bodyXml.replace(/<w:tbl\b[\s\S]*?<\/w:tbl>/g, (tableXml) => {
    const gridMatch = tableXml.match(/<w:tblGrid\b[\s\S]*?<\/w:tblGrid>/)
    let factor = 1
    if (gridMatch) {
      const colWidths = [...gridMatch[0].matchAll(/<w:gridCol\b[^>]*\bw:w="(\d+)"/g)].map(
        (m) => Number(m[1])
      )
      const sum = colWidths.reduce((a, b) => a + b, 0)
      if (sum > targetWidthDxa) {
        factor = targetWidthDxa / sum
      }
    }

    let next = tableXml

    if (factor < 1) {
      next = next.replace(
        /(<w:gridCol\b[^>]*\bw:w=")(\d+)(")/g,
        (_f, a, w, c) => `${a}${scaleDxaValue(Number(w), factor)}${c}`
      )
      next = next.replace(
        /(<w:tcW\b[^>]*\bw:w=")(\d+)(")/g,
        (_f, a, w, c) => `${a}${scaleDxaValue(Number(w), factor)}${c}`
      )
    }

    if (/<w:tblW\b/.test(next)) {
      next = next.replace(
        /<w:tblW\b[^>]*\/>/,
        `<w:tblW w:w="${targetWidthDxa}" w:type="dxa"/>`
      )
      next = next.replace(
        /<w:tblW\b[^>]*>[\s\S]*?<\/w:tblW>/,
        `<w:tblW w:w="${targetWidthDxa}" w:type="dxa"/>`
      )
    } else if (/<w:tblPr\b[^>]*>/.test(next)) {
      next = next.replace(
        /<w:tblPr\b[^>]*>/,
        (open) => `${open}<w:tblW w:w="${targetWidthDxa}" w:type="dxa"/>`
      )
    }

    if (/<w:tblLayout\b/.test(next)) {
      next = next.replace(
        /<w:tblLayout\b[^>]*\/>/,
        `<w:tblLayout w:type="autofit"/>`
      )
    } else if (/<w:tblPr\b[^>]*>/.test(next)) {
      next = next.replace(
        /<w:tblPr\b[^>]*>/,
        (open) => `${open}<w:tblLayout w:type="autofit"/>`
      )
    }

    // Prefer left alignment so scaled tables sit in the content column.
    if (/<w:jc\b[^>]*w:val="center"/.test(next)) {
      next = next.replace(
        /<w:jc\b[^>]*w:val="center"[^>]*\/>/,
        `<w:jc w:val="left"/>`
      )
    }

    return next
  })
}

function extractStyleElements(stylesXml: string, styleIds: readonly string[]) {
  const found: string[] = []
  for (const styleId of styleIds) {
    const re = new RegExp(
      `<w:style\\b[^>]*w:styleId="${styleId}"[^>]*>[\\s\\S]*?<\\/w:style>`,
      "i"
    )
    const match = stylesXml.match(re)
    if (match) found.push(match[0])
  }
  return found
}

function extractNumberingBlocks(numberingXml: string) {
  const abstractNums: string[] = []
  const nums: string[] = []

  const abstractRe = /<w:abstractNum\b[\s\S]*?<\/w:abstractNum>/gi
  let match: RegExpExecArray | null
  while ((match = abstractRe.exec(numberingXml))) {
    abstractNums.push(match[0])
  }

  const numRe = /<w:num\b(?![A-Za-z])[\s\S]*?<\/w:num>/gi
  while ((match = numRe.exec(numberingXml))) {
    nums.push(match[0])
  }

  return { abstractNums, nums }
}

function applyNumberingOffset(xml: string, offset: number) {
  return xml
    .replace(
      /(<w:abstractNum\b[^>]*\bw:abstractNumId=")(\d+)(")/g,
      (_f, a, id, c) => `${a}${Number(id) + offset}${c}`
    )
    .replace(
      /(<w:abstractNumId\b[^>]*\bw:val=")(\d+)(")/g,
      (_f, a, id, c) => `${a}${Number(id) + offset}${c}`
    )
    .replace(
      /(<w:num\b[^>]*\bw:numId=")(\d+)(")/g,
      (_f, a, id, c) => `${a}${Number(id) + offset}${c}`
    )
    .replace(
      /(<w:numId\b[^>]*\bw:val=")(\d+)(")/g,
      (_f, a, id, c) => `${a}${Number(id) + offset}${c}`
    )
}

/**
 * Section 3A docs carry Office-extension attrs (w14/w15/w16cid/…).
 * The host legal-report package often lacks those xmlns declarations on
 * numbering.xml / styles.xml, which makes LibreOffice reject the file (503).
 * Strip non-w / non-xml prefixed attributes from fragments we splice in.
 */
function stripForeignNamespaceAttributes(xml: string) {
  return xml.replace(/\s+[A-Za-z_][\w.-]*:[A-Za-z_][\w.-]*="[^"]*"/g, (attr) => {
    if (/^\s+(?:w|xml):/.test(attr)) return attr
    if (/^\s+xmlns:/.test(attr)) return attr
    return ""
  })
}

function prepareInjectedFragment(xml: string) {
  return stripForeignNamespaceAttributes(xml)
}

function mergeStylesIntoHost(hostStylesXml: string, styleElements: string[]) {
  const toInsert = styleElements.filter((el) => {
    const idMatch = el.match(/w:styleId="([^"]+)"/i)
    if (!idMatch) return false
    return !hostStylesXml.includes(`w:styleId="${idMatch[1]}"`)
  })
  if (toInsert.length === 0) return hostStylesXml
  if (!hostStylesXml.includes("</w:styles>")) {
    throw new Error("Host legal report styles.xml is missing </w:styles>")
  }
  return hostStylesXml.replace("</w:styles>", `${toInsert.join("")}</w:styles>`)
}

function mergeNumberingIntoHost(
  hostNumberingXml: string | null,
  abstractNums: string[],
  nums: string[]
) {
  if (abstractNums.length === 0 && nums.length === 0) {
    return hostNumberingXml
  }

  const blocks = `${abstractNums.join("")}${nums.join("")}`

  if (!hostNumberingXml) {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">${blocks}</w:numbering>`
  }

  if (hostNumberingXml.includes("</w:numbering>")) {
    return hostNumberingXml.replace("</w:numbering>", `${blocks}</w:numbering>`)
  }

  return hostNumberingXml
}

function findParagraphStartBefore(documentXml: string, index: number) {
  let searchFrom = index
  while (searchFrom >= 0) {
    const idx = documentXml.lastIndexOf("<w:p", searchFrom)
    if (idx === -1) return -1
    const after = documentXml.slice(idx, idx + 8)
    if (/^<w:p[\s/>]/.test(after)) {
      return idx
    }
    searchFrom = idx - 1
  }
  return -1
}

function replaceMarkerParagraph(documentXml: string, bodyXml: string) {
  const marker = SECTION_3A_DOCX_BODY_MARKER
  const markerIndex = documentXml.indexOf(marker)
  if (markerIndex === -1) {
    return documentXml
  }

  const paragraphStart = findParagraphStartBefore(documentXml, markerIndex)
  const paragraphEnd = documentXml.indexOf("</w:p>", markerIndex)
  if (paragraphStart === -1 || paragraphEnd === -1) {
    throw new Error("Section 3A marker paragraph could not be located in legal report DOCX")
  }

  const paragraphEndInclusive = paragraphEnd + "</w:p>".length
  return (
    documentXml.slice(0, paragraphStart) +
    bodyXml +
    documentXml.slice(paragraphEndInclusive)
  )
}

export async function loadSection3ABodyFromDocx(
  stateInput: string,
  clientName: string
): Promise<string> {
  const { stateName } = normalizeConsumerState(stateInput)
  const docxPath = resolveSection3ADocxPath(stateInput)

  if (!docxPath || !fs.existsSync(docxPath)) {
    return [
      `SECTION 3A — KNOW YOUR RIGHTS AND PROTECTION UNDER YOUR RESIDING STATE`,
      "",
      `Jurisdiction: ${stateName}`,
      "",
      "A state-specific Section 3A authority module is not yet available for this jurisdiction in the current library.",
      "Verify that the case state is correct, or contact support if you believe this state should be supported.",
      "",
      "Federal FCRA dispute procedures and the remaining sections of this report remain available for educational self-help use.",
    ].join("\n")
  }

  const buffer = fs.readFileSync(docxPath)
  const zip = await JSZip.loadAsync(buffer)
  const documentXml = await zip.file("word/document.xml")?.async("string")
  if (!documentXml) {
    throw new Error(`Section 3A DOCX is missing document.xml: ${docxPath}`)
  }

  let body = extractPlainTextFromDocxXml(documentXml)
  body = body.replace(/Consumer:\s*_{2,}/i, `Consumer: ${clientName}`)
  return body.trim()
}

/**
 * Inject the original state Section 3A DOCX body (paragraphs + tables + styles)
 * into a packed legal-report DOCX, replacing the marker paragraph.
 */
export async function injectSection3ADocxIntoLegalReport(
  legalReportDocx: Buffer,
  stateInput: string,
  clientName: string
): Promise<Buffer> {
  const docxPath = resolveSection3ADocxPath(stateInput)
  if (!docxPath || !fs.existsSync(docxPath)) {
    return legalReportDocx
  }

  const sourceZip = await JSZip.loadAsync(fs.readFileSync(docxPath))
  const sourceDocument = await sourceZip.file("word/document.xml")?.async("string")
  if (!sourceDocument) {
    return legalReportDocx
  }

  let bodyXml = prepareInjectedFragment(
    fitTablesToPageWidth(
      stripDuplicateSection3ATitle(
        applyNumberingOffset(
          fillConsumerNameInXml(extractBodyChildren(sourceDocument), clientName),
          NUMBERING_ID_OFFSET
        )
      )
    )
  )

  const sourceStyles = await sourceZip.file("word/styles.xml")?.async("string")
  let styleElements: string[] = []
  if (sourceStyles) {
    styleElements = extractStyleElements(sourceStyles, STYLE_IDS_TO_MERGE).map((el) =>
      prepareInjectedFragment(applyNumberingOffset(el, NUMBERING_ID_OFFSET))
    )
  }

  const sourceNumbering = await sourceZip.file("word/numbering.xml")?.async("string")
  let abstractNums: string[] = []
  let nums: string[] = []
  if (sourceNumbering) {
    const blocks = extractNumberingBlocks(sourceNumbering)
    abstractNums = blocks.abstractNums.map((el) =>
      prepareInjectedFragment(applyNumberingOffset(el, NUMBERING_ID_OFFSET))
    )
    nums = blocks.nums.map((el) =>
      prepareInjectedFragment(applyNumberingOffset(el, NUMBERING_ID_OFFSET))
    )
  }

  const hostZip = await JSZip.loadAsync(legalReportDocx)
  const hostDocumentFile = hostZip.file("word/document.xml")
  if (!hostDocumentFile) {
    return legalReportDocx
  }

  let hostDocument = await hostDocumentFile.async("string")
  // Legacy marker used `<<<...>>>`, which Word stores as `&lt;` / `&gt;`.
  const legacyEscaped = "&lt;&lt;&lt;GLADIC_SECTION_3A_DOCX_BODY&gt;&gt;&gt;"
  if (hostDocument.includes(legacyEscaped)) {
    hostDocument = hostDocument.split(legacyEscaped).join(SECTION_3A_DOCX_BODY_MARKER)
  }
  if (!hostDocument.includes(SECTION_3A_DOCX_BODY_MARKER)) {
    return legalReportDocx
  }

  hostDocument = replaceMarkerParagraph(hostDocument, bodyXml)
  hostZip.file("word/document.xml", hostDocument)

  const hostStylesFile = hostZip.file("word/styles.xml")
  if (hostStylesFile && styleElements.length > 0) {
    const hostStyles = await hostStylesFile.async("string")
    hostZip.file("word/styles.xml", mergeStylesIntoHost(hostStyles, styleElements))
  }

  const hostNumberingFile = hostZip.file("word/numbering.xml")
  const hostNumbering = hostNumberingFile
    ? await hostNumberingFile.async("string")
    : null
  const mergedNumbering = mergeNumberingIntoHost(hostNumbering, abstractNums, nums)
  if (mergedNumbering) {
    hostZip.file("word/numbering.xml", mergedNumbering)
  }

  return Buffer.from(
    await hostZip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
    })
  )
}
