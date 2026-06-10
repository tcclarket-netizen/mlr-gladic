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
  "report_date": string | null (ISO or as printed on report),
  "bureau_level_utilization_pct": number | null (revolving utilization % if shown at bureau/summary level),
  "bureau_level_credit_used": number | null,
  "bureau_level_credit_limit": number | null,
  "active_revolving_credit_limit_total": number | null (total open revolving limits if shown),
  "active_revolving_credit_used_total": number | null,
  "addresses": [{ "line", "city", "state", "postal_code", "status": "current"|"former"|"unknown", "reported_date" }],
  "employers": [{ "name", "status": "current"|"former"|"unknown", "reported_date" }],
  "tradelines": [{ "creditor_name", "account_type", "account_status", "balance", "credit_limit", "past_due_amount", "date_opened", "is_negative", "payment_history_notes", "account_number_last4" }],
  "inquiries": [{ "creditor_name", "inquiry_type": "hard"|"soft"|"unknown", "inquiry_date" }],
  "collections": [{ "creditor_name", "balance", "status" }],
  "public_records": [{ "record_type", "status", "amount", "filing_date" }],
  "extraction_notes": string | null
}
Extract bureau-level revolving utilization and limit totals from summary sections when present (do not average account-level percentages for bureau totals).
Extract personal information addresses and employers when shown. Mark address/employer status current vs former when labeled.
Only include data present in the text. Do not invent accounts, scores, limits, or dates.`,
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
