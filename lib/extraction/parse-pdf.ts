import "server-only"
import { extractText, getDocumentProxy } from "unpdf"

const MAX_CHARS = 120_000

export async function extractTextFromPdf(buffer: ArrayBuffer): Promise<string> {
  const pdf = await getDocumentProxy(new Uint8Array(buffer))
  const { text } = await extractText(pdf, { mergePages: true })
  const joined = Array.isArray(text) ? text.join("\n\n") : String(text ?? "")
  const trimmed = joined.replace(/\s+/g, " ").trim()

  if (!trimmed || trimmed.length < 200) {
    throw new Error(
      "Could not extract enough text from this PDF. Use a digital PDF from the bureau website, not a scan or screenshot."
    )
  }

  return trimmed.length > MAX_CHARS ? `${trimmed.slice(0, MAX_CHARS)}\n\n[truncated]` : trimmed
}
