import { CheckCircle, CreditCard, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const plans = [
  {
    name: "Free Trial",
    price: "$0",
    period: "14 days",
    description: "Try TurnKey with a single case and limited report generation.",
    current: false,
    features: [
      "1 case",
      "1 bureau upload",
      "MY LEGAL REPORT™ preview",
      "Limited dispute templates",
      "Email support",
    ],
    cta: "Start Free Trial",
    highlight: false,
  },
  {
    name: "Pay-Per-Report",
    price: "$29",
    period: "per report",
    description: "Purchase individual reports and document packs as needed.",
    current: false,
    features: [
      "Unlimited cases",
      "3-bureau upload per report",
      "Full MY LEGAL REPORT™",
      "Complete dispute pack",
      "Agency filing templates",
      "Priority processing",
    ],
    cta: "Choose Plan",
    highlight: false,
  },
  {
    name: "Consultant",
    price: "$149",
    period: "per month",
    description: "For credit consultants managing multiple client cases.",
    current: true,
    features: [
      "Up to 25 cases/month",
      "3-bureau uploads",
      "Full MY LEGAL REPORT™",
      "Dispute + agency packs",
      "Client management tools",
      "Priority support",
      "Usage analytics",
    ],
    cta: "Current Plan",
    highlight: true,
  },
  {
    name: "Agency / Law Office",
    price: "$399",
    period: "per month",
    description: "For law offices and high-volume legal support operations.",
    current: false,
    features: [
      "Unlimited cases",
      "Unlimited bureau uploads",
      "Custom report branding",
      "Team member access",
      "API access",
      "Dedicated support",
      "Compliance exports",
    ],
    cta: "Upgrade",
    highlight: false,
  },
]

const usageItems = [
  { label: "Cases", used: 11, limit: 25, unit: "" },
  { label: "Reports Generated", used: 18, limit: 50, unit: "" },
  { label: "Storage", used: 340, limit: 1024, unit: "MB" },
  { label: "Downloads", used: 22, limit: 100, unit: "" },
]

export default function BillingPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-7">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Billing &amp; Plans</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Manage your subscription and review usage.
          </p>
        </div>

        {/* Current plan summary */}
        <div className="mb-8 rounded-lg border border-border bg-card px-6 py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-accent/10">
                <Zap className="h-4 w-4 text-accent" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Consultant Plan</p>
                <p className="text-xs text-muted-foreground">$149/month · Renews June 26, 2026</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <CreditCard className="mr-1.5 h-3.5 w-3.5" /> Manage Payment
              </Button>
              <Button variant="outline" size="sm">
                Cancel Plan
              </Button>
            </div>
          </div>
        </div>

        {/* Usage */}
        <div className="mb-8">
          <h2 className="mb-4 text-sm font-semibold text-foreground">This Month&apos;s Usage</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {usageItems.map(({ label, used, limit, unit }) => {
              const pct = Math.round((used / limit) * 100)
              return (
                <div key={label} className="rounded-lg border border-border bg-card p-4">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="mt-1 text-xl font-semibold tracking-tight text-foreground">
                    {used}{unit} <span className="text-sm font-normal text-muted-foreground">/ {limit}{unit}</span>
                  </p>
                  <div className="mt-2 h-1.5 w-full rounded-full bg-border overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all", pct > 80 ? "bg-status-warning" : "bg-accent")}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">{pct}% used</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Plan grid */}
        <h2 className="mb-4 text-sm font-semibold text-foreground">All Plans</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "rounded-lg border bg-card flex flex-col",
                plan.highlight ? "border-primary ring-1 ring-primary/20" : "border-border"
              )}
            >
              <div className="p-5 border-b border-border">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-foreground">{plan.name}</h3>
                  {plan.current && (
                    <Badge variant="outline" className="text-[10px] text-accent border-accent/30 bg-accent/5">
                      Current
                    </Badge>
                  )}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-semibold tracking-tight text-foreground">{plan.price}</span>
                  <span className="text-xs text-muted-foreground">/{plan.period}</span>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{plan.description}</p>
              </div>
              <div className="p-5 flex-1">
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
                <Button
                  className="w-full"
                  variant={plan.current ? "secondary" : "default"}
                  disabled={plan.current}
                  size="sm"
                >
                  {plan.cta}
                </Button>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 text-[11px] leading-relaxed text-muted-foreground">
          TurnKey Credit is not a law firm and does not provide legal advice. All plans provide access to educational
          and self-help document tools only.
        </p>
      </div>
    </div>
  )
}
