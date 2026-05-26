export type AccountType = "consumer" | "consultant" | "legal"

export type Profile = {
  id: string
  full_name: string | null
  account_type: AccountType | null
  created_at: string
  updated_at: string
}

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  consumer: "Consumer",
  consultant: "Credit Consultant",
  legal: "Law Office / Legal Support",
}
