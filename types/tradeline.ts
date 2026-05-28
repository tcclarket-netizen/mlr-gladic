import type { Bureau } from "@/types/case"

export type VerificationStatus =
  | "verified"
  | "proof_required"
  | "method_needed"
  | "review"
  | "suppression_candidate"

export type Tradeline = {
  id: string
  user_id: string
  case_id: string
  normalized_key: string
  creditor_name: string
  account_type: string | null
  account_status: string | null
  bureaus: string[]
  balance: number | null
  credit_limit: number | null
  utilization_pct: number | null
  date_opened: string | null
  is_negative: boolean
  verification_status: VerificationStatus
  dispute_basis: string | null
  raw_by_bureau: Record<string, unknown>
  created_at: string
}

export type Inquiry = {
  id: string
  user_id: string
  case_id: string
  bureau: Bureau
  creditor_name: string
  inquiry_type: "hard" | "soft" | "unknown"
  inquiry_date: string | null
  created_at: string
}

export type Collection = {
  id: string
  user_id: string
  case_id: string
  bureau: string
  creditor_name: string
  balance: number | null
  status: string | null
  created_at: string
}
