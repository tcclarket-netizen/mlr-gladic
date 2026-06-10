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

export const BUREAU_LOGO_PATHS: Record<Bureau, string> = {
  experian: "/bureaus/experian.png",
  equifax: "/bureaus/equifax.png",
  transunion: "/bureaus/transunion.png",
}

export const BUREAUS: {
  key: Bureau
  name: string
  color: string
  abbr: string
  logoSrc: string
}[] = [
  {
    key: "experian",
    name: "Experian",
    color: "text-[#6E2C91]",
    abbr: "EXP",
    logoSrc: BUREAU_LOGO_PATHS.experian,
  },
  {
    key: "equifax",
    name: "Equifax",
    color: "text-[#9E1B32]",
    abbr: "EFX",
    logoSrc: BUREAU_LOGO_PATHS.equifax,
  },
  {
    key: "transunion",
    name: "TransUnion",
    color: "text-[#003B5C]",
    abbr: "TU",
    logoSrc: BUREAU_LOGO_PATHS.transunion,
  },
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
