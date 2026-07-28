import { CheckCircle, Zap } from "lucide-react"
import { redirect } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { isAdminEmail } from "@/lib/billing/admin"
import {
  FREE_TRIAL_OFFERING,
  getPlanByKey,
  getPublicBillingPlans,
  isPayPerReportPlanKey,
  isUnlimitedQuota,
  PAY_PER_REPORT_PLAN,
} from "@/lib/billing/plans"
import {
  formatPayPerReportAmount,
  getPayPerReportAmountCents,
  getPayPerReportPriceRangeLabel,
} from "@/lib/billing/pay-per-report-pricing"
import { BILLING_PRODUCT_LABELS } from "@/lib/billing/products"
import { getUserBilling } from "@/lib/billing/queries"
import { getUsageSummary } from "@/lib/billing/usage-summary"
import {
  ActivateAdminPlanButton,
  BillingActions,
  PayPerReportSetupButton,
  PlanCheckoutButton,
} from "@/components/billing/billing-actions"
import { FloridaMembershipNotice } from "@/components/billing/florida-membership-notice"
import { FreeTrialPlanCard } from "@/components/billing/free-trial-plan-card"
import { createClient } from "@/lib/supabase/server"
import { getStripeClient } from "@/lib/stripe/config"
import { applyPayPerReportSetupFromCheckoutSession } from "@/lib/stripe/sync-pay-per-report-setup"
import {
  applySubscriptionFromCheckoutSession,
  findLatestCompletedSubscriptionCheckoutSession,
} from "@/lib/stripe/sync-subscription-checkout"
import { reconcileMembershipFromStripe } from "@/lib/stripe/reconcile-membership-billing"
import { upsertUserBillingFromSubscription } from "@/lib/stripe/subscription-lifecycle"

type PaymentHistoryItem = {
  id: string
  paid_at: string
  description: string
  charged_amount_cents: number
  currency: string
  reference_id: string | null
}

function formatPeriodEnd(iso: string | null, planKey?: string) {
  if (planKey === "admin") return "Internal unlimited access"
  if (planKey === "pay_per_report") return "Charged per report unlock"
  if (!iso) return "No active membership period"
  return `Renews ${new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })}`
}

async function getPayPerReportPaymentHistory(
  stripeCustomerId: string
): Promise<PaymentHistoryItem[]> {
  try {
    const stripe = getStripeClient()
    const intents = await stripe.paymentIntents.list({
      customer: stripeCustomerId,
      limit: 30,
    })

    return intents.data
      .filter((pi) => {
        if (pi.status !== "succeeded") return false
        if ((pi.amount_received ?? pi.amount ?? 0) <= 0) return false
        // Only real report unlocks — exclude subscription PIs and card-setup noise.
        if (pi.metadata?.billing_mode !== "pay_per_report") return false
        const product = pi.metadata?.product
        return product === "opposition" || product === "legal" || product === "self"
      })
      .map((pi) => {
        const product = pi.metadata?.product
        const label =
          product === "opposition"
            ? "Opposition Report™ unlock"
            : product === "legal"
              ? "MY LEGAL REPORT™ unlock"
              : product === "self"
                ? "MY SELF REPORT™ unlock"
                : "Pay-per-report unlock"
        return {
          id: `pi_${pi.id}`,
          paid_at: new Date(pi.created * 1000).toISOString(),
          description: label,
          charged_amount_cents: pi.amount_received ?? pi.amount ?? 0,
          currency: (pi.currency ?? "usd").toUpperCase(),
          reference_id: pi.id,
        }
      })
  } catch {
    return []
  }
}

async function getPaymentHistory(stripeCustomerId: string | null): Promise<PaymentHistoryItem[]> {
  if (!stripeCustomerId) return []

  const [subscriptionPayments, payPerReportPayments] = await Promise.all([
    getSubscriptionPaymentHistory(stripeCustomerId),
    getPayPerReportPaymentHistory(stripeCustomerId),
  ])

  return [...subscriptionPayments, ...payPerReportPayments].sort(
    (a, b) => new Date(b.paid_at).getTime() - new Date(a.paid_at).getTime()
  )
}

async function getSubscriptionPaymentHistory(
  stripeCustomerId: string
): Promise<PaymentHistoryItem[]> {
  try {
    const stripe = getStripeClient()
    const invoices = await stripe.invoices.list({
      customer: stripeCustomerId,
      limit: 20,
      status: "paid",
    })

    return invoices.data
      .filter((inv) => inv.status === "paid" && (inv.amount_paid ?? 0) > 0)
      .map((inv) => ({
        id: `sub_${inv.id}`,
        paid_at: new Date((inv.status_transitions.paid_at ?? inv.created) * 1000).toISOString(),
        description: inv.description ?? inv.lines.data[0]?.description ?? "Membership payment",
        charged_amount_cents: inv.amount_paid ?? 0,
        currency: (inv.currency ?? "usd").toUpperCase(),
        reference_id: inv.id,
      }))
      .sort((a, b) => new Date(b.paid_at).getTime() - new Date(a.paid_at).getTime())
  } catch {
    return []
  }
}

function usageItemPayPerHint(
  item: { payPerUnlockCents?: number | null; used: number },
  isPayPerReport: boolean
) {
  if (!isPayPerReport || !item.payPerUnlockCents) return null
  return `${formatPayPerReportAmount(item.payPerUnlockCents)} per unlock · ${item.used} unlocked this period`
}

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const params = await searchParams
  const checkout = typeof params.checkout === "string" ? params.checkout : undefined
  const sessionId = typeof params.session_id === "string" ? params.session_id : undefined
  const planParam = typeof params.plan === "string" ? params.plan : undefined

  let billing = await getUserBilling()
  let billingSyncError: string | null =
    typeof params.billing_error === "string" ? params.billing_error : null

  async function tryCompletePayPerReportSetup(checkoutSessionId: string) {
    const result = await applyPayPerReportSetupFromCheckoutSession(checkoutSessionId, user!.id, {
      supabase,
    })
    if (result.ok) {
      redirect("/billing?activated=pay_per_report")
    }
    billingSyncError = result.error
    return result
  }

  async function tryCompleteSubscriptionSetup(checkoutSessionId: string) {
    const result = await applySubscriptionFromCheckoutSession(checkoutSessionId, user!.id)
    if (result.ok) {
      redirect("/billing?activated=subscription")
    }
    billingSyncError = result.error
    return result
  }

  if (user && checkout === "success") {
    if (planParam === "pay_per_report") {
      if (sessionId) {
        await tryCompletePayPerReportSetup(sessionId)
      } else if (billing?.stripe_customer_id) {
        try {
          const stripe = getStripeClient()
          const sessions = await stripe.checkout.sessions.list({
            customer: billing.stripe_customer_id,
            limit: 10,
          })
          const setupSession = sessions.data.find(
            (s) =>
              s.mode === "setup" &&
              s.status === "complete" &&
              s.metadata?.user_id === user.id &&
              s.metadata?.plan_key === "pay_per_report"
          )
          if (setupSession) {
            await tryCompletePayPerReportSetup(setupSession.id)
          }
        } catch {
          billingSyncError =
            billingSyncError ?? "Unable to verify pay-per-report setup. Try connecting your card again."
        }
      }
    } else if (sessionId) {
      await tryCompleteSubscriptionSetup(sessionId)
    } else if (billing?.stripe_customer_id) {
      try {
        const subSession = await findLatestCompletedSubscriptionCheckoutSession(
          billing.stripe_customer_id,
          user.id
        )
        if (subSession) {
          await tryCompleteSubscriptionSetup(subSession.id)
        }
      } catch {
        billingSyncError =
          billingSyncError ??
          "Payment succeeded in Stripe but membership was not synced. Refresh or contact support."
      }
    }
  }

  if (user && checkout === "updated") {
    billing = await getUserBilling()
    if (billing?.stripe_subscription_id) {
      try {
        const stripe = getStripeClient()
        const subscription = await stripe.subscriptions.retrieve(billing.stripe_subscription_id)
        await upsertUserBillingFromSubscription(subscription)
        redirect("/billing?activated=subscription")
      } catch {
        billingSyncError = "Plan was updated in Stripe but could not be synced to your account."
      }
    }
  }

  billing = await getUserBilling()

  if (user && billing && (await reconcileMembershipFromStripe(billing))) {
    redirect("/billing?activated=subscription")
  }

  billing = await getUserBilling()
  const [paymentHistory, usage] = await Promise.all([
    getPaymentHistory(billing?.stripe_customer_id ?? null),
    user ? getUsageSummary(supabase, user.id, billing) : Promise.resolve(null),
  ])
  const planKey = billing?.plan_key ?? "none"
  const isFreeTrial = planKey === "none"
  const isPayPerReport = isPayPerReportPlanKey(planKey)
  const activatedPayPerReport =
    typeof params.activated === "string" && params.activated === "pay_per_report"
  const activatedSubscription =
    typeof params.activated === "string" && params.activated === "subscription"
  const currentPlan = isFreeTrial ? null : getPlanByKey(planKey)
  const showAdminPlan = isAdminEmail(user?.email)
  const visiblePlans = [
    ...getPublicBillingPlans(),
    ...(showAdminPlan ? [getPlanByKey("admin")].filter(Boolean) : []),
  ]

  const usageItems = usage
    ? [
        {
          label: BILLING_PRODUCT_LABELS.opposition,
          ...usage.opposition,
        },
        {
          label: BILLING_PRODUCT_LABELS.legal,
          ...usage.legal,
        },
        {
          label: BILLING_PRODUCT_LABELS.self,
          ...usage.self,
        },
      ]
    : []

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-7">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Billing &amp; Plans</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Choose membership monthly unlocks or pay-per-report with a card on file. Cases and
            processing are unlimited.
          </p>
        </div>

        {activatedPayPerReport ? (
          <div className="mb-6 rounded-lg border border-status-success/30 bg-status-success/10 px-4 py-3 text-sm text-foreground">
            Pay Per Report is active. Your card is on file — you will be charged when you unlock each
            report.
          </div>
        ) : null}

        {activatedSubscription ? (
          <div className="mb-6 rounded-lg border border-status-success/30 bg-status-success/10 px-4 py-3 text-sm text-foreground">
            Your membership is active. Monthly report unlocks are now available on your plan.
          </div>
        ) : null}

        {billingSyncError ? (
          <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-foreground">
            {billingSyncError}
          </div>
        ) : null}

        <div className="mb-8 rounded-lg border border-border bg-card px-6 py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-accent/10">
                <Zap className="h-4 w-4 text-accent" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {isFreeTrial ? FREE_TRIAL_OFFERING.name : currentPlan?.name ?? "No membership"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Status: {billing?.billing_status ?? "none"} ·{" "}
                  {formatPeriodEnd(billing?.current_period_end ?? null, planKey)}
                </p>
                {isPayPerReport ? (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Card on file:{" "}
                    {billing?.stripe_default_payment_method_id ? "yes" : "not connected"} ·
                    Reports charged: {billing?.reports_charged_count ?? 0}
                  </p>
                ) : null}
              </div>
            </div>

            <BillingActions hasCustomerPortal={Boolean(billing?.stripe_customer_id)} />
          </div>
        </div>

        <div className="mb-8">
          <h2 className="mb-4 text-sm font-semibold text-foreground">This Period&apos;s Unlocks</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {usageItems.map(({ label, used, limit, remaining, payPerUnlockCents }) => {
              const unlimited = isUnlimitedQuota(limit)
              const pct =
                unlimited || limit <= 0 ? null : Math.round((used / limit) * 100)
              return (
                <div key={label} className="rounded-lg border border-border bg-card p-4">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="mt-1 text-xl font-semibold tracking-tight text-foreground">
                    {payPerUnlockCents ? (
                      <>
                        {formatPayPerReportAmount(payPerUnlockCents)}{" "}
                        <span className="text-sm font-normal text-muted-foreground">/ unlock</span>
                      </>
                    ) : unlimited ? (
                      "Unlimited"
                    ) : (
                      <>
                        {remaining}{" "}
                        <span className="text-sm font-normal text-muted-foreground">
                          of {limit} remaining
                        </span>
                      </>
                    )}
                  </p>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        pct != null && pct > 80 ? "bg-status-warning" : "bg-accent"
                      )}
                      style={{
                        width: unlimited
                          ? "100%"
                          : `${pct == null ? 0 : Math.max(0, Math.min(100, pct))}%`,
                      }}
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {usageItemPayPerHint({ payPerUnlockCents, used }, isPayPerReport) ??
                      (limit <= 0
                        ? "Not included on current plan"
                        : unlimited
                          ? `${used} unlocked this period`
                          : isFreeTrial && label === BILLING_PRODUCT_LABELS.opposition
                            ? `${used} used (1 free unlock total)`
                            : `${used} used this period`)}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Payment History</h2>
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            {paymentHistory.length === 0 ? (
              <p className="px-4 py-6 text-sm text-muted-foreground">No payments recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-secondary/40 text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium">Description</th>
                      <th className="px-4 py-3 font-medium">Amount</th>
                      <th className="px-4 py-3 font-medium">Reference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentHistory.map((item) => (
                      <tr key={item.id} className="border-t border-border">
                        <td className="px-4 py-3 text-foreground">
                          {new Date(item.paid_at).toLocaleString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                        <td className="px-4 py-3 text-foreground">{item.description}</td>
                        <td className="px-4 py-3 text-foreground">
                          {(item.charged_amount_cents / 100).toLocaleString("en-US", {
                            style: "currency",
                            currency: item.currency || "USD",
                          })}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                          {item.reference_id ?? "n/a"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <h2 className="mb-4 text-sm font-semibold text-foreground">Plans</h2>
        <div className="mb-6">
          <FloridaMembershipNotice />
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <FreeTrialPlanCard
            isCurrent={isFreeTrial}
            oppositionRemaining={usage?.opposition.remaining}
          />
          <div
            className={cn(
              "flex flex-col rounded-lg border bg-card",
              isPayPerReport ? "border-primary ring-1 ring-primary/20" : "border-border"
            )}
          >
            <div className="border-b border-border p-5">
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-foreground">{PAY_PER_REPORT_PLAN.name}</h3>
                {isPayPerReport ? (
                  <Badge
                    variant="outline"
                    className="border-accent/30 bg-accent/5 text-[10px] text-accent"
                  >
                    Current
                  </Badge>
                ) : null}
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-semibold tracking-tight text-foreground">
                  {getPayPerReportPriceRangeLabel()}
                </span>
                <span className="text-xs text-muted-foreground">/ unlock</span>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                {PAY_PER_REPORT_PLAN.description} Opposition unlocks are{" "}
                {formatPayPerReportAmount(getPayPerReportAmountCents("opposition"))}; legal unlocks
                are {formatPayPerReportAmount(getPayPerReportAmountCents("legal"))}; self-report
                unlocks are {formatPayPerReportAmount(getPayPerReportAmountCents("self"))}.
              </p>
            </div>
            <div className="flex-1 p-5">
              <ul className="space-y-2">
                {PAY_PER_REPORT_PLAN.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-foreground">
                    <CheckCircle className="h-3.5 w-3.5 shrink-0 text-status-success" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-5 pt-0">
              <PayPerReportSetupButton
                disabled={isPayPerReport && Boolean(billing?.stripe_default_payment_method_id)}
                label={
                  isPayPerReport && billing?.stripe_default_payment_method_id
                    ? "Card connected"
                    : isPayPerReport
                      ? "Update payment card"
                      : "Connect card & enable"
                }
              />
            </div>
          </div>
          {visiblePlans.map((plan) => {
            if (!plan) return null
            const isCurrent = billing?.plan_key === plan.key
            const isAdminOnly = Boolean(plan.adminOnly)
            return (
              <div
                key={plan.key}
                className={cn(
                  "flex flex-col rounded-lg border bg-card",
                  isCurrent ? "border-primary ring-1 ring-primary/20" : "border-border",
                  plan.popular && !isCurrent && "border-accent/40",
                  isAdminOnly && !isCurrent && "border-dashed border-primary/40"
                )}
              >
                <div className="border-b border-border p-5">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-foreground">{plan.name}</h3>
                    <div className="flex items-center gap-1.5">
                      {isAdminOnly ? (
                        <Badge
                          variant="outline"
                          className="border-primary/30 bg-primary/5 text-[10px] text-primary"
                        >
                          Admin only
                        </Badge>
                      ) : null}
                      {plan.popular && !isCurrent ? (
                        <Badge
                          variant="outline"
                          className="border-accent/30 bg-accent/5 text-[10px] text-accent"
                        >
                          Popular
                        </Badge>
                      ) : null}
                      {isCurrent ? (
                        <Badge
                          variant="outline"
                          className="border-accent/30 bg-accent/5 text-[10px] text-accent"
                        >
                          Current
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-semibold tracking-tight text-foreground">
                      {plan.monthlyPriceLabel}
                    </span>
                    {!isAdminOnly ? (
                      <span className="text-xs text-muted-foreground">/ month</span>
                    ) : null}
                  </div>
                  {plan.annualPriceLabel ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      or {plan.annualPriceLabel} / year
                    </p>
                  ) : null}
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    {plan.description}
                  </p>
                </div>
                <div className="flex-1 p-5">
                  <ul className="space-y-2">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-foreground">
                        <CheckCircle className="h-3.5 w-3.5 shrink-0 text-status-success" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-2 p-5 pt-0">
                  {isAdminOnly ? (
                    <ActivateAdminPlanButton
                      disabled={isCurrent}
                      label={isCurrent ? "Current Plan" : "Activate admin access"}
                    />
                  ) : (
                    <>
                      <PlanCheckoutButton
                        planKey={plan.key}
                        interval="month"
                        disabled={isCurrent}
                        label={isCurrent ? "Current Plan" : "Subscribe monthly"}
                      />
                      {plan.annualPriceLabel ? (
                        <PlanCheckoutButton
                          planKey={plan.key}
                          interval="year"
                          disabled={isCurrent}
                          label={isCurrent ? "Current Plan" : "Subscribe annually"}
                        />
                      ) : null}
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <p className="mt-8 text-[11px] leading-relaxed text-muted-foreground">
          GLADIC AI™ is not a law firm and does not provide legal advice. Billing controls access
          to software features and document tooling only.
        </p>
      </div>
    </div>
  )
}
