import "server-only"
import fs from "fs"
import path from "path"
import JSZip from "jszip"
import type { SelfReportFillInput } from "@/lib/report-generation/build-self-report-data"

const TEMPLATE_PATH = path.join(
  process.cwd(),
  "lib/report-generation/templates/self-report-official.docx"
)

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

function applyReplacements(xml: string, replacements: Record<string, string>) {
  let next = xml
  for (const [token, value] of Object.entries(replacements)) {
    next = next.split(token).join(escapeXml(value))
  }
  return next
}

export async function generateSelfReportDocx(
  input: SelfReportFillInput
): Promise<Buffer> {
  const template = fs.readFileSync(TEMPLATE_PATH)
  const zip = await JSZip.loadAsync(template)

  const xmlParts = Object.keys(zip.files).filter((name) => name.endsWith(".xml"))

  for (const part of xmlParts) {
    const file = zip.file(part)
    if (!file) continue
    const xml = await file.async("string")
    zip.file(part, applyReplacements(xml, input.replacements))
  }

  return Buffer.from(
    await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
    })
  )
}
