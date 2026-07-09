export type BillingPlanKey =
  | "none"
  | "basic_i"
  | "basic_ii"
  | "basic_iii"
  | "accuracy"
  | "dispute"
  | "resolute"

export type BillingInterval = "month" | "year"

export type PlanQuotas = {
  opposition: number
  legal: number
  self: number
}

type BillingPlan = {
  key: BillingPlanKey
  name: string
  monthlyPriceLabel: string
  annualPriceLabel: string | null
  description: string
  quotas: PlanQuotas
  envPriceKeys: {
    monthly?: string
    annual?: string
  }
  features: string[]
  popular?: boolean
}

export const BILLING_PLANS: BillingPlan[] = [
  {
    key: "basic_i",
    name: "Basic I",
    monthlyPriceLabel: "$25",
    annualPriceLabel: null,
    description: "Opposition analysis for light monthly volume.",
    quotas: { opposition: 2, legal: 0, self: 0 },
    envPriceKeys: { monthly: "STRIPE_PRICE_BASIC_I_MONTHLY" },
    features: [
      "Unlimited cases",
      "2 Opposition Report™ unlocks / month",
      "Opposition Dashboard™ preview",
      "3-bureau upload per case",
      "Email support",
    ],
  },
  {
    key: "basic_ii",
    name: "Basic II",
    monthlyPriceLabel: "$65",
    annualPriceLabel: null,
    description: "Opposition plus one full legal report each month.",
    quotas: { opposition: 1, legal: 1, self: 0 },
    envPriceKeys: { monthly: "STRIPE_PRICE_BASIC_II_MONTHLY" },
    features: [
      "Unlimited cases",
      "1 Opposition Report™ unlock / month",
      "1 MY LEGAL REPORT™ / month",
      "3-bureau upload per case",
      "Email support",
    ],
  },
  {
    key: "basic_iii",
    name: "Basic III",
    monthlyPriceLabel: "$115",
    annualPriceLabel: null,
    description: "Full opposition, legal, and self-report workflow.",
    quotas: { opposition: 1, legal: 1, self: 1 },
    envPriceKeys: { monthly: "STRIPE_PRICE_BASIC_III_MONTHLY" },
    features: [
      "Unlimited cases",
      "1 Opposition Report™ unlock / month",
      "1 MY LEGAL REPORT™ / month",
      "1 MY SELF REPORT™ / month",
      "3-bureau upload per case",
      "Email support",
    ],
  },
  {
    key: "accuracy",
    name: "Accuracy",
    monthlyPriceLabel: "$27.25",
    annualPriceLabel: "$225",
    description: "Higher monthly quotas for consistent casework.",
    quotas: { opposition: 3, legal: 2, self: 1 },
    envPriceKeys: {
      monthly: "STRIPE_PRICE_ACCURACY_MONTHLY",
      annual: "STRIPE_PRICE_ACCURACY_ANNUAL",
    },
    features: [
      "Unlimited cases",
      "3 Opposition Report™ unlocks / month",
      "2 MY LEGAL REPORT™ / month",
      "1 MY SELF REPORT™ / month",
      "Priority processing",
      "Email support",
    ],
    popular: true,
  },
  {
    key: "dispute",
    name: "Dispute",
    monthlyPriceLabel: "$33.75",
    annualPriceLabel: "$355",
    description: "Expanded quotas plus priority support.",
    quotas: { opposition: 4, legal: 3, self: 1 },
    envPriceKeys: {
      monthly: "STRIPE_PRICE_DISPUTE_MONTHLY",
      annual: "STRIPE_PRICE_DISPUTE_ANNUAL",
    },
    features: [
      "Unlimited cases",
      "4 Opposition Report™ unlocks / month",
      "3 MY LEGAL REPORT™ / month",
      "1 MY SELF REPORT™ / month",
      "Priority processing",
      "Priority support",
    ],
  },
  {
    key: "resolute",
    name: "Resolute",
    monthlyPriceLabel: "$107.50",
    annualPriceLabel: "$990",
    description: "High-volume membership for power users and professionals.",
    quotas: { opposition: 30, legal: 4, self: 2 },
    envPriceKeys: {
      monthly: "STRIPE_PRICE_RESOLUTE_MONTHLY",
      annual: "STRIPE_PRICE_RESOLUTE_ANNUAL",
    },
    features: [
      "Unlimited cases",
      "Up to 1 Opposition Report™ unlock / day (30 / month)",
      "4 MY LEGAL REPORT™ / month",
      "2 MY SELF REPORT™ / month",
      "Priority processing",
      "Dedicated support",
    ],
  },
]

export const NO_MEMBERSHIP_PLAN_KEY: BillingPlanKey = "none"

export const FREE_TRIAL_QUOTAS: PlanQuotas = {
  opposition: 1,
  legal: 0,
  self: 0,
}

export const NO_MEMBERSHIP_QUOTAS: PlanQuotas = {
  opposition: 0,
  legal: 0,
  self: 0,
}

export const FREE_TRIAL_OFFERING = {
  name: "Free Trial",
  headline: "Opposition Report",
  priceLabel: "FREE",
  priceDetail: "First Report",
  description: "GLADIC AI's foundational Credit Rights Intelligence assessment.",
  dashboardTitle: "Opposition Dashboard",
  features: [
    "Three-Bureau Credit Analysis",
    "Credit Score Evaluation",
    "Credit Utilization Review",
    "Spending Pattern Analysis",
    "Liability Assessment",
    "Inquiry Analysis",
    "Collection Analysis",
    "Charge-Off Review",
    "Public Record Review",
    "Reporting Accuracy Assessment",
    "Creditor Behavioral Profile",
    "Furnisher Reporting Analysis",
    "Consumer Risk Indicators",
    "Potential Reporting Deficiencies",
    "Preliminary Consumer Rights Findings",
    "Account-by-Account Review",
    "AI-Generated Findings Summary",
  ],
  recommendedFor:
    "Consumers beginning their Credit Rights Intelligence journey.",
  ctaLabel: "Get Started Free",
  ctaHref: "/cases/new",
}

export function getPlanByKey(key: string) {
  return BILLING_PLANS.find((p) => p.key === key)
}

export function getPlanQuotas(planKey: BillingPlanKey): PlanQuotas {
  if (planKey === "none") return FREE_TRIAL_QUOTAS
  return getPlanByKey(planKey)?.quotas ?? NO_MEMBERSHIP_QUOTAS
}

export function getStripePriceIdForPlan(
  planKey: BillingPlanKey,
  interval: BillingInterval
): string | null {
  if (planKey === "none") return null
  const plan = getPlanByKey(planKey)
  if (!plan) return null
  const envKey = interval === "year" ? plan.envPriceKeys.annual : plan.envPriceKeys.monthly
  if (!envKey) return null
  return process.env[envKey] ?? null
}

export function isPaidPlan(planKey: BillingPlanKey) {
  return planKey !== "none"
}
