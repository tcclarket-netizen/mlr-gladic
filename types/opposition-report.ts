export const OPPOSITION_NOT_FOUND = "Not Found In Uploaded Documents" as const

export type OppositionMetricValue = number | typeof OPPOSITION_NOT_FOUND

export type OppositionBureauName = "Experian" | "Equifax" | "TransUnion"

export type SuccessClassification = "Elite" | "Strong" | "Moderate" | "Needs Improvement"

export type PrimeBandStatus = "Prime Qualified" | "Not Prime Qualified" | "Unable To Determine"

export type OcuCalculationMethod =
  | "Bureau Reported Utilization"
  | "Derived Active Revolving Utilization"

export type NormalizedBureauAccount = {
  accountName?: string
  accountType?: string
  openClosed?: "Open" | "Closed" | string
  status?: string
  balance?: number
  creditLimit?: number
  creditUsagePercentage?: number
  pastDueAmount?: number
  paymentHistoryText?: string
  accountNumberLast4?: string
  dateOpened?: string
  isCollection?: boolean
  isChargeOff?: boolean
  isLatePaymentAccount?: boolean
  isNegativeClosedAccount?: boolean
}

export type NormalizedBureauData = {
  bureau: OppositionBureauName
  reportDate?: string
  creditScore?: number
  bureauLevelUtilizationPercentage?: number
  bureauLevelCreditUsed?: number
  bureauLevelCreditLimit?: number
  activeRevolvingCreditLimitTotal?: number
  activeRevolvingCreditUsedTotal?: number
  inquiries?: number
  addresses?: string[]
  employers?: string[]
  accounts?: NormalizedBureauAccount[]
}

export type OppositionIdentityEntry = {
  originalValues: string[]
  normalizedValue: string
  bureauSources: OppositionBureauName[]
  requiresReview: boolean
}

export type OppositionReportMetrics = {
  reportName: "The Opposition Report™"
  calculatedAt: string

  baselineValidation: {
    baselineWarning: boolean
    reportDates: {
      Experian?: string
      Equifax?: string
      TransUnion?: string
    }
    daysBetweenOldestAndNewest?: number
    message: string
  }

  bureaus: NormalizedBureauData[]

  metrics: {
    oas: OppositionMetricValue
    ocu: OppositionMetricValue
    osp: OppositionMetricValue
    oip: OppositionMetricValue
    riskDeduction: number
    successRating: number
    successClassification: SuccessClassification
  }

  sourceBreakdown: {
    oasSources: Partial<Record<OppositionBureauName, number>>
    ocuSources: Partial<Record<OppositionBureauName, number>>
    ospSources: Partial<Record<OppositionBureauName, number>>
    inquirySources: Partial<Record<OppositionBureauName, number>>
  }

  completenessWarnings: {
    oasCompletenessWarning: boolean
    ocuCompletenessWarning: boolean
    ospCompletenessWarning: boolean
    oipCompletenessWarning: boolean
  }

  identityReview: {
    addresses: OppositionIdentityEntry[]
    employers: OppositionIdentityEntry[]
  }

  riskExposure: {
    hasNegativeActivity: boolean
    negativeAccountCount: number
    latePaymentAccountCount: number
    collectionAccountCount: number
    chargeOffAccountCount: number
    negativeClosedAccountCount: number
  }

  primeBandQualification: {
    status: PrimeBandStatus
    currentOAS: number | typeof OPPOSITION_NOT_FOUND
    requiredOAS: 745
  }

  ocuCalculationMethod: OcuCalculationMethod
  ocuCalculationNote?: string

  calculationAudit: {
    oasMethod: string
    ocuMethod: string
    ospMethod: string
    oipMethod: string
    bureausUsed: {
      oas: OppositionBureauName[]
      ocu: OppositionBureauName[]
      osp: OppositionBureauName[]
      oip: OppositionBureauName[]
    }
  }
}
