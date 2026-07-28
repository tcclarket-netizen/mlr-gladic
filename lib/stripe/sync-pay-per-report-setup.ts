import "server-only"
import type { SupabaseClient } from "@supabase/supabase-js"
import type Stripe from "stripe"
import { createAdminClient } from "@/lib/supabase/admin"
import { getStripeClient } from "@/lib/stripe/config"
import {
  cancelSubscriptionsExcept,
  listCustomerSubscriptions,
} from "@/lib/stripe/subscription-lifecycle"

function paymentMethodIdFromSetupIntent(setupIntent: Stripe.SetupIntent) {
  const pm = setupIntent.payment_method
  if (!pm) return null
  return typeof pm === "string" ? pm : pm.id
}

function setupIntentIdFromSession(session: Stripe.Checkout.Session) {
  const si = session.setup_intent
  if (!si) return null
  return typeof si === "string" ? si : si.id
}

export async function applyPayPerReportSetupFromCheckoutSession(
  sessionId: string,
  expectedUserId: string,
  options?: { supabase?: SupabaseClient }
): Promise<{ ok: true } | { ok: false; error: string }> {
  const stripe = getStripeClient()
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["setup_intent"],
  })

  if (session.mode !== "setup") {
    return { ok: false, error: "Checkout session is not a card setup." }
  }

  if (session.status !== "complete") {
    return { ok: false, error: "Checkout is not complete yet." }
  }

  const userId = session.metadata?.user_id
  if (!userId || userId !== expectedUserId) {
    return { ok: false, error: "Checkout session does not match your account." }
  }

  if (session.metadata?.plan_key !== "pay_per_report") {
    return { ok: false, error: "Checkout session is not for pay-per-report." }
  }

  let setupIntent: Stripe.SetupIntent | null = null
  const expanded = session.setup_intent
  if (expanded && typeof expanded !== "string") {
    setupIntent = expanded
  } else {
    const setupIntentId = setupIntentIdFromSession(session)
    if (!setupIntentId) {
      return { ok: false, error: "Missing setup intent on checkout session." }
    }
    setupIntent = await stripe.setupIntents.retrieve(setupIntentId)
  }

  const paymentMethodId = paymentMethodIdFromSetupIntent(setupIntent)
  const customerId =
    typeof session.customer === "string" ? session.customer : session.customer?.id ?? null

  if (!customerId || !paymentMethodId) {
    return { ok: false, error: "Payment method was not saved. Try connecting your card again." }
  }

  await stripe.customers.update(customerId, {
    invoice_settings: { default_payment_method: paymentMethodId },
  })

  const existing = await listCustomerSubscriptions(stripe, customerId)
  await cancelSubscriptionsExcept(stripe, existing, "__pay_per_report__")

  const db = options?.supabase ?? createAdminClient()
  const { error } = await db.from("user_billing").upsert(
    {
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: null,
      stripe_price_id: null,
      stripe_default_payment_method_id: paymentMethodId,
      plan_key: "pay_per_report",
      billing_status: "active",
      current_period_start: null,
      current_period_end: null,
      cancel_at_period_end: false,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  )

  if (error) {
    return { ok: false, error: error.message }
  }

  return { ok: true }
}

/** Used by Stripe webhooks when the session object is already available. */
export async function applyPayPerReportSetupFromWebhookSession(
  session: Stripe.Checkout.Session
) {
  const userId = session.metadata?.user_id
  if (!userId || session.metadata?.plan_key !== "pay_per_report") return

  await applyPayPerReportSetupFromCheckoutSession(session.id, userId)
}
