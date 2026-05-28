import Stripe from "stripe"

function getRequiredEnv(key: string) {
  const value = process.env[key]
  if (!value) throw new Error(`Missing ${key} in environment.`)
  return value
}

export function getStripeClient() {
  return new Stripe(getRequiredEnv("STRIPE_SECRET_KEY"), {
    apiVersion: "2025-04-30.basil",
  })
}

export function getStripeWebhookSecret() {
  return getRequiredEnv("STRIPE_WEBHOOK_SECRET")
}
