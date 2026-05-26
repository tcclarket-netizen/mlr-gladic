import type { Bureau } from "@/types/case"

export const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
  "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
  "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
  "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
  "Wisconsin", "Wyoming",
] as const

export const BUREAUS: {
  key: Bureau
  name: string
  color: string
  abbr: string
}[] = [
  { key: "experian", name: "Experian", color: "text-red-600", abbr: "EXP" },
  { key: "equifax", name: "Equifax", color: "text-blue-600", abbr: "EFX" },
  { key: "transunion", name: "TransUnion", color: "text-blue-800", abbr: "TU" },
]

export const CREDIT_REPORTS_BUCKET = "credit-reports"

export function caseReferenceCode(caseId: string) {
  return `TK-${caseId.replace(/-/g, "").slice(0, 8).toUpperCase()}`
}

export function storagePathForReport(
  userId: string,
  caseId: string,
  bureau: Bureau,
  fileName: string
) {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_")
  return `${userId}/${caseId}/${bureau}/${safeName}`
}
