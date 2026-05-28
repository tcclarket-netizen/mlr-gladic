import { z } from "zod"

const bureauEnum = z.enum(["experian", "equifax", "transunion"])

export const extractedTradelineSchema = z.object({
  creditor_name: z.string(),
  account_type: z.string().optional().nullable(),
  account_status: z.string().optional().nullable(),
  balance: z.number().optional().nullable(),
  credit_limit: z.number().optional().nullable(),
  date_opened: z.string().optional().nullable(),
  is_negative: z.boolean().optional().default(false),
  payment_history_notes: z.string().optional().nullable(),
  account_number_last4: z.string().optional().nullable(),
})

export const extractedInquirySchema = z.object({
  creditor_name: z.string(),
  inquiry_type: z.enum(["hard", "soft", "unknown"]).optional().default("unknown"),
  inquiry_date: z.string().optional().nullable(),
})

export const extractedCollectionSchema = z.object({
  creditor_name: z.string(),
  balance: z.number().optional().nullable(),
  status: z.string().optional().nullable(),
})

export const extractedPublicRecordSchema = z.object({
  record_type: z.string(),
  status: z.string().optional().nullable(),
  amount: z.number().optional().nullable(),
  filing_date: z.string().optional().nullable(),
})

export const bureauExtractionSchema = z.object({
  bureau: bureauEnum,
  credit_score: z.number().int().min(300).max(850).optional().nullable(),
  consumer_name: z.string().optional().nullable(),
  report_date: z.string().optional().nullable(),
  tradelines: z.array(extractedTradelineSchema).default([]),
  inquiries: z.array(extractedInquirySchema).default([]),
  collections: z.array(extractedCollectionSchema).default([]),
  public_records: z.array(extractedPublicRecordSchema).default([]),
  extraction_notes: z.string().optional().nullable(),
})

export type BureauExtraction = z.infer<typeof bureauExtractionSchema>

export const bureauExtractionResponseSchema = z.object({
  extraction: bureauExtractionSchema,
})
