import "server-only"
import Stripe from "stripe"
import { getStripeClient } from "@/lib/stripe/config"

function getAmountCents() {
  const raw = process.env.STRIPE_PAY_PER_REPORT_AMOUNT_CENTS ?? "2900"
  const val = Number.parseInt(raw, 10)
  if (!Number.isFinite(val) || val <= 0) {
    throw new Error("Invalid STRIPE_PAY_PER_REPORT_AMOUNT_CENTS value.")
  }
  return val
}

function getCurrency() {
  return (process.env.STRIPE_PAY_PER_REPORT_CURRENCY ?? "usd").toLowerCase()
}

export async function chargePayPerReport(input: {
  userId: string
  caseId: string
  customerId: string
  paymentMethodId: string
}) {
  const stripe = getStripeClient()
  const amount = getAmountCents()
  const currency = getCurrency()

  try {
    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount,
        currency,
        customer: input.customerId,
        payment_method: input.paymentMethodId,
        off_session: true,
        confirm: true,
        description: `GLADIC pay-per-report charge (${input.caseId})`,
        metadata: {
          user_id: input.userId,
          case_id: input.caseId,
          product: "pay_per_report",
        },
      })

    return { ok: true as const, paymentIntent }
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
