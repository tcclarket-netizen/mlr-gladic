import "server-only"
import fs from "fs"
import path from "path"
import JSZip from "jszip"
import { normalizeConsumerState } from "@/lib/report-generation/state-rights-data"

const SECTION_3A_DIR = path.join(process.cwd(), "public/all-state-laws")

const DOCX_NAME_RE =
  /^Section_3A_(.+)_Laws_FCRA_Personal_Information_Updated(?: \(\d+\))?\.docx$/i

function decodeXmlEntities(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
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
  body = body.replace(
    /Consumer:\s*_{2,}/i,
    `Consumer: ${clientName}`
  )
  return body.trim()
}
