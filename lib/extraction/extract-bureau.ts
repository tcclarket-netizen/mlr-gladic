import "server-only"
import { getOpenAIClient, EXTRACTION_MODEL } from "@/lib/openai/client"
import { extractTextFromPdf } from "@/lib/extraction/parse-pdf"
import { bureauExtractionSchema, type BureauExtraction } from "@/lib/extraction/schema"
import type { Bureau } from "@/types/case"

export async function extractBureauFromPdf(
  pdfBuffer: ArrayBuffer,
  bureau: Bureau
): Promise<BureauExtraction> {
  const text = await extractTextFromPdf(pdfBuffer)
  const openai = getOpenAIClient()

  const completion = await openai.chat.completions.create({
    model: EXTRACTION_MODEL,
    temperature: 0.1,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You extract structured credit report data from consumer bureau report text.
Return JSON matching this shape:
{
  "bureau": "${bureau}",
  "credit_score": number | null,
  "consumer_name": string | null,
  "report_date": string | null,
  "tradelines": [{ "creditor_name", "account_type", "account_status", "balance", "credit_limit", "date_opened", "is_negative", "account_number_last4" }],
  "inquiries": [{ "creditor_name", "inquiry_type": "hard"|"soft"|"unknown", "inquiry_date" }],
  "collections": [{ "creditor_name", "balance", "status" }],
  "public_records": [{ "record_type", "status", "amount", "filing_date" }],
  "extraction_notes": string | null
}
Only include data present in the text. Do not invent accounts.`,
      },
      {
        role: "user",
        content: `Extract from this ${bureau} report:\n\n${text}`,
      },
    ],
  })

  const raw = completion.choices[0]?.message?.content
  if (!raw) {
    throw new Error(`Extraction failed for ${bureau}: empty response.`)
  }

  const json = JSON.parse(raw) as unknown
  return bureauExtractionSchema.parse({ ...(json as object), bureau })
}
