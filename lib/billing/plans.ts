export type BillingPlanKey = "free_trial" | "pay_per_report" | "consultant" | "agency"

type BillingPlan = {
  key: BillingPlanKey
  name: string
  priceLabel: string
  period: string
  description: string
  mode: "subscription" | "payment" | "setup"
  envPriceKey?: string
  features: string[]
}

export const BILLING_PLANS: BillingPlan[] = [
  {
    key: "free_trial",
    name: "Free Trial",
    priceLabel: "$0",
    period: "14 days",
    description: "Try GLADIC AI™ with a single case and limited report generation.",
    mode: "payment",
    features: [
      "1 case",
      "1 bureau upload",
      "MY LEGAL REPORT(TM) preview",
      "Limited dispute templates",
      "Email support",
    ],
  },
  {
    key: "pay_per_report",
    name: "Pay-Per-Report",
    priceLabel: "$29",
    period: "per report",
    description: "Save a card once, then auto-charge per completed report.",
    mode: "setup",
    features: [
      "Unlimited cases",
      "3-bureau upload per report",
      "Full MY LEGAL REPORT(TM)",
      "Complete dispute pack",
      "Agency filing templates",
      "Priority processing",
    ],
  },
  {
    key: "consultant",
    name: "Consultant",
    priceLabel: "$149",
    period: "per month",
    description: "For credit consultants managing multiple client cases.",
    mode: "subscription",
    envPriceKey: "STRIPE_PRICE_CONSULTANT_MONTHLY",
    features: [
      "Up to 25 cases/month",
      "3-bureau uploads",
      "Full MY LEGAL REPORT(TM)",
      "Dispute + agency packs",
      "Client management tools",
      "Priority support",
      "Usage analytics",
    ],
  },
  {
    key: "agency",
    name: "Agency / Law Office",
    priceLabel: "$399",
    period: "per month",
    description: "For law offices and high-volume legal support operations.",
    mode: "subscription",
    envPriceKey: "STRIPE_PRICE_AGENCY_MONTHLY",
    features: [
      "Unlimited cases",
      "Unlimited bureau uploads",
      "Custom report branding",
      "Team member access",
      "API access",
      "Dedicated support",
      "Compliance exports",
    ],
  },
]

export function getPlanByKey(key: string) {
  return BILLING_PLANS.find((p) => p.key === key)
}

export function getStripePriceIdForPlan(planKey: BillingPlanKey): string | null {
  const plan = BILLING_PLANS.find((p) => p.key === planKey)
  if (!plan?.envPriceKey) return null
  return process.env[plan.envPriceKey] ?? null
}
