export type MlrPlanTier = "basic_i" | "basic_ii" | "basic_iii" | "accuracy" | "dispute" | "resolute"

export type MlrPricingPlan = {
  key: MlrPlanTier
  name: string
  price: string
  billingTerm: string
  monthlyAlt?: string
  savingsBadge?: string
  features: string[]
  bestFor: string
  cta: string
  highlighted?: boolean
  premium?: boolean
  group: "monthly" | "annual"
}

export const MLR_MONTHLY_PLANS: MlrPricingPlan[] = [
  {
    key: "basic_i",
    name: "BASIC MEMBER I",
    price: "$25.00",
    billingTerm: "/ month + applicable tax",
    features: ["Two (2) Opposition Reports™", "Opposition Dashboard™", "Credit Monitoring Analysis"],
    bestFor: "Routine credit monitoring.",
    cta: "Start Basic I",
    group: "monthly",
  },
  {
    key: "basic_ii",
    name: "BASIC MEMBER II",
    price: "$65.00",
    billingTerm: "/ month + applicable tax",
    features: [
      "One (1) Opposition Report™",
      "One (1) My Legal Report™",
      "Opposition Dashboard™",
      "Consumer Rights Analysis",
    ],
    bestFor: "Consumers actively reviewing credit reporting issues.",
    cta: "Start Basic II",
    group: "monthly",
  },
  {
    key: "basic_iii",
    name: "BASIC MEMBER III",
    price: "$115.00",
    billingTerm: "/ month + applicable tax",
    features: [
      "One (1) Opposition Report™",
      "One (1) My Legal Report™",
      "One (1) My Self Report™",
      "Opposition Dashboard™",
      "Consumer Rights Roadmap",
      "Pre-Litigation Package Framework",
    ],
    bestFor: "Consumers seeking complete monthly Credit Rights Intelligence™.",
    cta: "Start Basic III",
    group: "monthly",
  },
]

export const MLR_ANNUAL_PLANS: MlrPricingPlan[] = [
  {
    key: "accuracy",
    name: "ACCURACY MEMBER™",
    price: "$225.00",
    billingTerm: "annually",
    monthlyAlt: "or $27.25 monthly",
    savingsBadge: "Save approximately 31.2% with annual billing",
    features: [
      "Three (3) Opposition Reports™",
      "Two (2) My Legal Reports™",
      "One (1) My Self Report™",
      "Priority Processing",
      "Opposition Dashboard™",
    ],
    bestFor: "Best value for individual consumers.",
    cta: "Start Accuracy Member™",
    highlighted: true,
    group: "annual",
  },
  {
    key: "dispute",
    name: "DISPUTE MEMBER™",
    price: "$355.00",
    billingTerm: "annually",
    monthlyAlt: "or $33.75 monthly",
    savingsBadge: "Save approximately 12.35% with annual billing",
    features: [
      "Four (4) Opposition Reports™",
      "Three (3) My Legal Reports™",
      "One (1) My Self Report™",
      "Priority Contact Support",
      "Consumer Viability Case Study Analytics",
      "Thirty (30) Minute Support Consultation",
      "Enhanced Dashboard Features",
    ],
    bestFor: "Active consumer disputes.",
    cta: "Start Dispute Member™",
    group: "annual",
  },
  {
    key: "resolute",
    name: "RESOLUTE MEMBER™",
    price: "$990.00",
    billingTerm: "annually",
    monthlyAlt: "or $107.50 monthly",
    savingsBadge: "Save approximately 23.26% with annual billing",
    features: [
      "One (1) Opposition Report™ Daily",
      "Four (4) My Legal Reports™",
      "Two (2) My Self Reports™",
      "Premium Dashboard Access",
      "Consumer Viability Analytics",
      "Priority Contact Support",
      "Sixty (60) Minute Team Support Consultation",
      "Advanced Reporting Tools",
    ],
    bestFor: "Professionals, consumer advocates, and high-volume users.",
    cta: "Start Resolute Member™",
    premium: true,
    group: "annual",
  },
]

export const MLR_COMPARISON_ROWS = [
  { feature: "Opposition Reports™", basic_i: "2", basic_ii: "1", basic_iii: "1", accuracy: "3", dispute: "4", resolute: "Daily" },
  { feature: "My Legal Report™", basic_i: "—", basic_ii: "1", basic_iii: "1", accuracy: "2", dispute: "3", resolute: "4" },
  { feature: "My Self Report™", basic_i: "—", basic_ii: "—", basic_iii: "1", accuracy: "1", dispute: "1", resolute: "2" },
  { feature: "Dashboard Access", basic_i: "✓", basic_ii: "✓", basic_iii: "✓", accuracy: "✓", dispute: "✓", resolute: "Premium" },
  { feature: "Priority Processing", basic_i: "—", basic_ii: "—", basic_iii: "—", accuracy: "✓", dispute: "✓", resolute: "✓" },
  { feature: "Support Consultation", basic_i: "—", basic_ii: "—", basic_iii: "—", accuracy: "—", dispute: "30 Min", resolute: "60 Min" },
] as const

export const MLR_FAQS = [
  { q: "Can I buy a single report without a membership?", a: "No. GLADIC AI™ reports are now available through active memberships only. Memberships include monthly report access based on the selected plan." },
  { q: "Which membership should I start with?", a: "Basic I is best for routine monitoring. Basic II adds My Legal Report™ access. Basic III adds My Self Report™ access. Accuracy Member™ is the best-value individual plan. Dispute Member™ is designed for active consumer disputes. Resolute Member™ is designed for professionals, advocates, and high-volume users." },
  { q: "Can I cancel my membership?", a: "Yes. Memberships may be canceled at any time. Cancellation prevents future renewal charges, and access continues through the end of the current billing period." },
  { q: "What happens if I use all my reports for the month?", a: "Your report access resets according to your active membership billing cycle. Users who need more report capacity should upgrade to a higher membership." },
  { q: "Are reports refundable?", a: "Customized AI-generated reports generally become non-refundable once processing has begun or the report has been delivered, subject to the GLADIC AI™ Refund Policy and applicable law." },
  { q: "Is GLADIC AI™ a law firm?", a: "No. GLADIC AI™ is not a law firm, is not an attorney, does not provide legal representation, and does not establish an attorney-client relationship. Reports are provided for informational, educational, research, and self-help purposes only." },
  { q: "Is my information secure?", a: "GLADIC AI™ uses secure document uploads, encrypted storage, enterprise-grade security controls, and protected customer dashboards." },
  { q: "What reports does MLR generate?", a: "MLR generates GLADIC AI™ report products including Opposition Report™, My Legal Report™, and My Self Report™, depending on your membership level." },
] as const

export function membershipSignUpHref(planKey?: string) {
  return planKey ? `/sign-up?plan=${planKey}` : "/sign-up"
}
