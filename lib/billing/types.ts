import type { BillingPlanKey } from "@/lib/billing/plans"

export type BillingStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "unpaid"
  | "one_time_paid"
  | "none"

export type UserBilling = {
  user_id: string
  stripe_customer_id: string | null
  stripe_default_payment_method_id: string | null
  stripe_subscription_id: string | null
  stripe_price_id: string | null
  plan_key: BillingPlanKey
  billing_status: BillingStatus
  report_credits: number
  reports_purchased: number
  reports_charged_count: number
  current_period_end: string | null
  cancel_at_period_end: boolean
  created_at: string
  updated_at: string
}
