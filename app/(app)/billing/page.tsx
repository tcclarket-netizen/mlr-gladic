import { CheckCircle, Zap } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { BILLING_PLANS, FREE_TRIAL_OFFERING, getPlanByKey } from "@/lib/billing/plans"
import { BILLING_PRODUCT_LABELS } from "@/lib/billing/products"
import { getUserBilling } from "@/lib/billing/queries"
import { getUsageSummary } from "@/lib/billing/usage-summary"
import { BillingActions, PlanCheckoutButton } from "@/components/billing/billing-actions"
import { FreeTrialPlanCard } from "@/components/billing/free-trial-plan-card"
import { createClient } from "@/lib/supabase/server"
import { getStripeClient } from "@/lib/stripe/config"

type PaymentHistoryItem = {
  id: string
  paid_at: string
  description: string
  charged_amount_cents: number
  currency: string
  reference_id: string | null
}

function formatPeriodEnd(iso: string | null) {
  if (!iso) return "No active membership period"
  return `Renews ${new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })}`
}

async function getPaymentHistory(): Promise<PaymentHistoryItem[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data: billing } = await supabase
    .from("user_billing")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle()

  if (!billing?.stripe_customer_id) return []

  try {
    const stripe = getStripeClient()
    const invoices = await stripe.invoices.list({
      customer: billing.stripe_customer_id,
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

export default async function BillingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [billing, paymentHistory] = await Promise.all([getUserBilling(), getPaymentHistory()])
  const usage = user ? await getUsageSummary(supabase, user.id, billing) : null
  const planKey = billing?.plan_key ?? "none"
  const isFreeTrial = planKey === "none"
  const currentPlan = isFreeTrial ? null : getPlanByKey(planKey)

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
            Membership unlocks full Opposition, Legal, and Self reports. Cases and processing are
            unlimited.
          </p>
        </div>

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
                  Status: {billing?.billing_status ?? "none"} · {formatPeriodEnd(billing?.current_period_end ?? null)}
                </p>
              </div>
            </div>

            <BillingActions hasCustomerPortal={Boolean(billing?.stripe_customer_id)} />
          </div>
        </div>

        <div className="mb-8">
          <h2 className="mb-4 text-sm font-semibold text-foreground">This Period&apos;s Unlocks</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {usageItems.map(({ label, used, limit, remaining }) => {
              const pct = limit > 0 ? Math.round((used / limit) * 100) : null
              return (
                <div key={label} className="rounded-lg border border-border bg-card p-4">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="mt-1 text-xl font-semibold tracking-tight text-foreground">
                    {remaining}{" "}
                    <span className="text-sm font-normal text-muted-foreground">
                      of {limit} remaining
                    </span>
                  </p>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        pct != null && pct > 80 ? "bg-status-warning" : "bg-accent"
                      )}
                      style={{ width: `${pct == null ? 0 : Math.max(0, Math.min(100, pct))}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {limit <= 0
                      ? "Not included on current plan"
                      : isFreeTrial && label === BILLING_PRODUCT_LABELS.opposition
                        ? `${used} used (1 free unlock total)`
                        : `${used} used this period`}
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

        <h2 className="mb-4 text-sm font-semibold text-foreground">Membership Plans</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <FreeTrialPlanCard
            isCurrent={isFreeTrial}
            oppositionRemaining={usage?.opposition.remaining}
          />
          {BILLING_PLANS.map((plan) => {
            const isCurrent = billing?.plan_key === plan.key
            return (
              <div
                key={plan.key}
                className={cn(
                  "flex flex-col rounded-lg border bg-card",
                  isCurrent ? "border-primary ring-1 ring-primary/20" : "border-border",
                  plan.popular && !isCurrent && "border-accent/40"
                )}
              >
                <div className="border-b border-border p-5">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-foreground">{plan.name}</h3>
                    <div className="flex items-center gap-1.5">
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
                    <span className="text-xs text-muted-foreground">/ month</span>
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
