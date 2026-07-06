import { CheckCircle, Zap } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { BILLING_PLANS } from "@/lib/billing/plans"
import { getUserBilling } from "@/lib/billing/queries"
import { BillingActions, PlanCheckoutButton } from "@/components/billing/billing-actions"
import { createClient } from "@/lib/supabase/server"
import { getStripeClient } from "@/lib/stripe/config"

type UsageItem = {
  label: string
  used: number
  limit: number | null
  unit: string
  hint: string
}

type PaymentHistoryItem = {
  id: string
  paid_at: string
  source: "pay_per_report" | "subscription"
  description: string
  charged_amount_cents: number
  currency: string
  reference_id: string | null
}

function formatPeriodEnd(iso: string | null) {
  if (!iso) return "No renewal date yet"
  return `Renews ${new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })}`
}

function buildUsageItems(planKey: string | undefined, reportsChargedCount: number): UsageItem[] {
  if (planKey === "pay_per_report") {
    return [
      {
        label: "Reports Charged",
        used: reportsChargedCount,
        limit: null,
        unit: "",
        hint: "Billed automatically per completed report",
      },
      {
        label: "Cases",
        used: 0,
        limit: null,
        unit: "",
        hint: "No fixed monthly cap on case count",
      },
      {
        label: "Storage",
        used: 0,
        limit: 1024,
        unit: "MB",
        hint: "Soft operational limit",
      },
      {
        label: "Downloads",
        used: 0,
        limit: 100,
        unit: "",
        hint: "Monthly export guidance",
      },
    ]
  }

  if (planKey === "agency") {
    return [
      { label: "Cases", used: 0, limit: null, unit: "", hint: "Unlimited on Agency plan" },
      { label: "Reports Generated", used: 0, limit: null, unit: "", hint: "Unlimited on Agency plan" },
      { label: "Storage", used: 0, limit: 10240, unit: "MB", hint: "Expanded storage tier" },
      { label: "Downloads", used: 0, limit: null, unit: "", hint: "Unlimited exports" },
    ]
  }

  if (planKey === "consultant") {
    return [
      { label: "Cases", used: 0, limit: 25, unit: "", hint: "Monthly case allowance" },
      { label: "Reports Generated", used: 0, limit: 50, unit: "", hint: "Monthly report allowance" },
      { label: "Storage", used: 0, limit: 2048, unit: "MB", hint: "Standard consultant tier" },
      { label: "Downloads", used: 0, limit: 200, unit: "", hint: "Monthly export allowance" },
    ]
  }

  return [
    { label: "Cases", used: 0, limit: 1, unit: "", hint: "Free trial allowance" },
    { label: "Reports Generated", used: 0, limit: 1, unit: "", hint: "Preview generation only" },
    { label: "Storage", used: 0, limit: 256, unit: "MB", hint: "Trial storage limit" },
    { label: "Downloads", used: 0, limit: 5, unit: "", hint: "Limited trial exports" },
  ]
}

async function getPaymentHistory(): Promise<PaymentHistoryItem[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data: rows } = await supabase
    .from("generated_reports")
    .select("id, generated_at, case_id, charged_amount_cents, stripe_payment_intent_id")
    .eq("user_id", user.id)
    .eq("report_type", "legal_report")
    .eq("status", "ready")
    .not("charged_amount_cents", "is", null)
    .order("generated_at", { ascending: false })
    .limit(20)

  if (!rows?.length) return []

  const caseIds = [...new Set(rows.map((row) => row.case_id))]
  const { data: cases } = await supabase.from("cases").select("id, client_name").in("id", caseIds)
  const caseNameById = new Map((cases ?? []).map((c) => [c.id, c.client_name]))
  const payPerReportItems: PaymentHistoryItem[] = rows.map((row) => ({
    id: `ppr_${row.id}`,
    paid_at: row.generated_at,
    source: "pay_per_report",
    description: `Report charge${caseNameById.get(row.case_id) ? ` - ${caseNameById.get(row.case_id)}` : ""}`,
    charged_amount_cents: row.charged_amount_cents ?? 0,
    currency: (process.env.STRIPE_PAY_PER_REPORT_CURRENCY ?? "usd").toUpperCase(),
    reference_id: row.stripe_payment_intent_id ?? null,
  }))

  const { data: billing } = await supabase
    .from("user_billing")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle()

  let subscriptionItems: PaymentHistoryItem[] = []
  if (billing?.stripe_customer_id) {
    try {
      const stripe = getStripeClient()
      const invoices = await stripe.invoices.list({
        customer: billing.stripe_customer_id,
        limit: 20,
        status: "paid",
      })

      subscriptionItems = invoices.data
        .filter((inv) => inv.status === "paid" && (inv.amount_paid ?? 0) > 0)
        .map((inv) => ({
          id: `sub_${inv.id}`,
          paid_at: new Date((inv.status_transitions.paid_at ?? inv.created) * 1000).toISOString(),
          source: "subscription",
          description: inv.description ?? inv.lines.data[0]?.description ?? "Subscription payment",
          charged_amount_cents: inv.amount_paid ?? 0,
          currency: (inv.currency ?? "usd").toUpperCase(),
          reference_id: inv.id,
        }))
    } catch {
      // Do not break billing page if Stripe is temporarily unavailable.
      subscriptionItems = []
    }
  }

  return [...payPerReportItems, ...subscriptionItems].sort(
    (a, b) => new Date(b.paid_at).getTime() - new Date(a.paid_at).getTime()
  )
}

export default async function BillingPage() {
  const [billing, paymentHistory] = await Promise.all([getUserBilling(), getPaymentHistory()])
  const currentPlan = BILLING_PLANS.find((p) => p.key === (billing?.plan_key ?? "free_trial"))
  const selectedPlanForCheckout = currentPlan?.key === "free_trial" ? "consultant" : currentPlan?.key ?? null
  const usageItems = buildUsageItems(billing?.plan_key, billing?.reports_charged_count ?? 0)

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-7">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Billing &amp; Plans</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Manage your Stripe subscription and review usage.
          </p>
        </div>

        <div className="mb-8 rounded-lg border border-border bg-card px-6 py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-accent/10">
                <Zap className="h-4 w-4 text-accent" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{currentPlan?.name ?? "Free Trial"}</p>
                <p className="text-xs text-muted-foreground">
                  Status: {billing?.billing_status ?? "none"} · {formatPeriodEnd(billing?.current_period_end ?? null)}
                </p>
                {billing?.plan_key === "pay_per_report" ? (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Autopay: {billing.stripe_default_payment_method_id ? "enabled" : "not set"} ·
                    Charged reports: {billing.reports_charged_count}
                  </p>
                ) : null}
              </div>
            </div>

            <BillingActions
              selectedPlanKey={selectedPlanForCheckout}
              hasCustomerPortal={Boolean(billing?.stripe_customer_id)}
              showCheckout={false}
            />
          </div>
        </div>

        <div className="mb-8">
          <h2 className="mb-4 text-sm font-semibold text-foreground">This Month&apos;s Usage</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {usageItems.map(({ label, used, limit, unit, hint }) => {
              const pct = limit && limit > 0 ? Math.round((used / limit) * 100) : null
              return (
                <div key={label} className="rounded-lg border border-border bg-card p-4">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="mt-1 text-xl font-semibold tracking-tight text-foreground">
                    {used}
                    {unit}{" "}
                    <span className="text-sm font-normal text-muted-foreground">
                      / {limit == null ? "Unlimited" : `${limit}${unit}`}
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
                    {pct == null ? hint : `${pct}% used`}
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
              <p className="px-4 py-6 text-sm text-muted-foreground">
                No payments recorded yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-secondary/40 text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium">Type</th>
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
                        <td className="px-4 py-3 text-foreground">
                          {item.source === "subscription" ? "Subscription" : "Pay-per-report"}
                        </td>
                        <td className="px-4 py-3 text-foreground">
                          {item.description}
                        </td>
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

        <h2 className="mb-4 text-sm font-semibold text-foreground">All Plans</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {BILLING_PLANS.map((plan) => {
            const isCurrent = billing?.plan_key === plan.key
            return (
              <div
                key={plan.name}
                className={cn(
                  "flex flex-col rounded-lg border bg-card",
                  isCurrent ? "border-primary ring-1 ring-primary/20" : "border-border"
                )}
              >
                <div className="border-b border-border p-5">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground">{plan.name}</h3>
                    {isCurrent && (
                      <Badge
                        variant="outline"
                        className="border-accent/30 bg-accent/5 text-[10px] text-accent"
                      >
                        Current
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-semibold tracking-tight text-foreground">
                      {plan.priceLabel}
                    </span>
                    <span className="text-xs text-muted-foreground">/{plan.period}</span>
                  </div>
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
                <div className="p-5 pt-0">
                  {plan.key === "free_trial" ? (
                    <p className="text-xs text-muted-foreground">Auto-assigned on signup.</p>
                  ) : (
                    <PlanCheckoutButton
                      planKey={plan.key}
                      disabled={isCurrent}
                      label={isCurrent ? "Current Plan" : "Choose Plan"}
                    />
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
