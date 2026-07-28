import "server-only"
import type Stripe from "stripe"
import { getStripeClient } from "@/lib/stripe/config"
import {
  getPayPerReportAmountCents,
  getPayPerReportCurrency,
  type PayPerReportChargeProduct,
} from "@/lib/billing/pay-per-report-pricing"

export async function chargePayPerReportUnlock(input: {
  userId: string
  caseId: string
  product: PayPerReportChargeProduct
  customerId: string
  paymentMethodId: string
}) {
  const stripe = getStripeClient()
  const amount = getPayPerReportAmountCents(input.product)
  const currency = getPayPerReportCurrency()

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      customer: input.customerId,
      payment_method: input.paymentMethodId,
      off_session: true,
      confirm: true,
      description: `GLADIC AI pay-per-report — ${input.product} (${input.caseId})`,
      metadata: {
        user_id: input.userId,
        case_id: input.caseId,
        product: input.product,
        billing_mode: "pay_per_report",
      },
    })

    return { ok: true as const, paymentIntent, amountCents: amount }
  } catch (e) {
    const err = e as Stripe.errors.StripeError
    return {
      ok: false as const,
      error:
        err?.message ??
        "Automatic payment failed. Update your payment method in Billing and try again.",
    }
  }
}
