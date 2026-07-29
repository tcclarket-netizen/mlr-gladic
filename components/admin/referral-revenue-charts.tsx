"use client"

import { useMemo, useState } from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { cn } from "@/lib/utils"
import type {
  BillingLedgerRow,
  ReferralPartnerRow,
  ReferralRevenueByDay,
} from "@/lib/referrals/admin-queries"

type Props = {
  partners: ReferralPartnerRow[]
  revenueByDay: ReferralRevenueByDay[]
  transactions: BillingLedgerRow[]
}

type LedgerChartView = "timeline" | "type" | "partner"

const chartConfig = {
  revenue: { label: "Revenue", color: "var(--chart-1)" },
  commission: { label: "Commission owed", color: "var(--chart-2)" },
  amount: { label: "Amount", color: "var(--chart-1)" },
  subscription: { label: "Subscription", color: "var(--chart-1)" },
  pay_per_report: { label: "Pay per report", color: "var(--chart-2)" },
  other: { label: "Other", color: "var(--chart-3)" },
}

const TYPE_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

function formatDollars(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

function formatDollarsExact(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100)
}

function shortDate(isoDate: string) {
  const d = new Date(`${isoDate}T00:00:00Z`)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })
}

function labelEntryType(entryType: string) {
  return entryType.replaceAll("_", " ")
}

function buildTimeline(transactions: BillingLedgerRow[]) {
  const byDay = new Map<string, number>()
  for (const row of transactions) {
    const day = row.occurred_at.slice(0, 10)
    if (!day) continue
    byDay.set(day, (byDay.get(day) ?? 0) + row.amount_cents)
  }

  const today = new Date()
  const points: { date: string; amount: number; amount_cents: number }[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today)
    d.setUTCDate(d.getUTCDate() - i)
    const key = d.toISOString().slice(0, 10)
    const cents = byDay.get(key) ?? 0
    points.push({
      date: key,
      amount: Math.round(cents) / 100,
      amount_cents: cents,
    })
  }
  return points
}

function buildByType(transactions: BillingLedgerRow[]) {
  const totals = new Map<string, number>()
  for (const row of transactions) {
    const key = row.entry_type || "other"
    totals.set(key, (totals.get(key) ?? 0) + row.amount_cents)
  }
  return [...totals.entries()]
    .map(([key, cents], index) => ({
      key,
      label: labelEntryType(key),
      amount: Math.round(cents) / 100,
      amount_cents: cents,
      fill: TYPE_COLORS[index % TYPE_COLORS.length],
    }))
    .sort((a, b) => b.amount_cents - a.amount_cents)
}

function buildByPartner(transactions: BillingLedgerRow[]) {
  const totals = new Map<string, { name: string; cents: number }>()
  for (const row of transactions) {
    const id = row.partner_id ?? "unassigned"
    const name = row.partner_name ?? "Unassigned"
    const prev = totals.get(id)
    totals.set(id, {
      name,
      cents: (prev?.cents ?? 0) + row.amount_cents,
    })
  }
  return [...totals.entries()]
    .map(([, value]) => ({
      name: value.name.length > 18 ? `${value.name.slice(0, 16)}…` : value.name,
      fullName: value.name,
      amount: Math.round(value.cents) / 100,
      amount_cents: value.cents,
    }))
    .sort((a, b) => b.amount_cents - a.amount_cents)
    .slice(0, 12)
}

export function ReferralRevenueCharts({ partners, revenueByDay, transactions }: Props) {
  const [ledgerView, setLedgerView] = useState<LedgerChartView>("timeline")

  const byPartner = [...partners]
    .filter((p) => p.revenue_cents > 0)
    .sort((a, b) => b.revenue_cents - a.revenue_cents)
    .slice(0, 12)
    .map((p) => ({
      name: p.name.length > 18 ? `${p.name.slice(0, 16)}…` : p.name,
      fullName: p.name,
      revenue: Math.round(p.revenue_cents) / 100,
      commission: Math.round(p.commission_owed_cents) / 100,
      revenue_cents: p.revenue_cents,
      commission_owed_cents: p.commission_owed_cents,
    }))

  const daily = revenueByDay.map((row) => ({
    date: row.date,
    revenue: Math.round(row.revenue_cents) / 100,
    revenue_cents: row.revenue_cents,
  }))

  const ledgerTotals = useMemo(() => {
    const amountCents = transactions.reduce((sum, row) => sum + row.amount_cents, 0)
    return {
      count: transactions.length,
      amountCents,
      avgCents: transactions.length ? Math.round(amountCents / transactions.length) : 0,
    }
  }, [transactions])

  const timeline = useMemo(() => buildTimeline(transactions), [transactions])
  const byType = useMemo(() => buildByType(transactions), [transactions])
  const ledgerByPartner = useMemo(() => buildByPartner(transactions), [transactions])

  const hasPartnerRevenue = byPartner.length > 0
  const hasDailyRevenue = daily.some((d) => d.revenue_cents > 0)
  const hasLedgerAmount = transactions.some((t) => t.amount_cents > 0)

  return (
    <div className="mb-10 space-y-4">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-5 lg:col-span-2">
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-foreground">Revenue by partner</h3>
            <p className="text-xs text-muted-foreground">
              Attributed ledger revenue and commission owed
            </p>
          </div>
          {hasPartnerRevenue ? (
            <ChartContainer config={chartConfig} className="h-[280px] w-full">
              <BarChart data={byPartner} margin={{ left: 4, right: 8, top: 4 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={52}
                  tickFormatter={(v) => `$${Number(v).toLocaleString("en-US")}`}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(_, payload) =>
                        String(payload?.[0]?.payload?.fullName ?? "")
                      }
                      formatter={(value, name) => (
                        <span className="font-mono tabular-nums">
                          {formatDollarsExact(Math.round(Number(value) * 100))}{" "}
                          <span className="text-muted-foreground">
                            {name === "commission" ? "owed" : "revenue"}
                          </span>
                        </span>
                      )}
                    />
                  }
                />
                <Bar
                  dataKey="revenue"
                  fill="var(--color-revenue)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={42}
                />
                <Bar
                  dataKey="commission"
                  fill="var(--color-commission)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={42}
                />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
              No attributed revenue yet.
            </div>
          )}
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-foreground">Daily attributed revenue</h3>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </div>
          {hasDailyRevenue ? (
            <ChartContainer config={chartConfig} className="h-[280px] w-full">
              <LineChart data={daily} margin={{ left: 0, right: 4, top: 4 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(v) => shortDate(String(v))}
                  minTickGap={28}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={44}
                  tickFormatter={(v) => formatDollars(Math.round(Number(v) * 100))}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) => shortDate(String(value))}
                      formatter={(value) => (
                        <span className="font-mono tabular-nums">
                          {formatDollarsExact(Math.round(Number(value) * 100))}
                        </span>
                      )}
                    />
                  }
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--color-revenue)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ChartContainer>
          ) : (
            <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
              No payments in the last 30 days.
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <div className="flex flex-col gap-4 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="grid grid-cols-3 gap-4 sm:gap-8">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Ledger entries
              </p>
              <p className="mt-0.5 text-lg font-semibold tabular-nums">{ledgerTotals.count}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Volume</p>
              <p className="mt-0.5 text-lg font-semibold tabular-nums">
                {formatDollarsExact(ledgerTotals.amountCents)}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Avg</p>
              <p className="mt-0.5 text-lg font-semibold tabular-nums">
                {formatDollarsExact(ledgerTotals.avgCents)}
              </p>
            </div>
          </div>

          <div
            role="tablist"
            aria-label="Ledger chart view"
            className="inline-flex h-9 w-fit items-center rounded-lg bg-muted p-[3px] text-muted-foreground"
          >
            {(
              [
                { id: "timeline", label: "Timeline" },
                { id: "type", label: "By type" },
                { id: "partner", label: "By partner" },
              ] as const
            ).map((option) => (
              <button
                key={option.id}
                type="button"
                role="tab"
                aria-selected={ledgerView === option.id}
                onClick={() => setLedgerView(option.id)}
                className={cn(
                  "inline-flex h-[calc(100%-1px)] items-center justify-center rounded-md px-3 text-sm font-medium transition-all",
                  ledgerView === option.id
                    ? "bg-background text-foreground shadow-sm"
                    : "hover:text-foreground"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5">
          {!hasLedgerAmount ? (
            <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
              No ledger volume to chart yet.
            </div>
          ) : ledgerView === "timeline" ? (
            <div>
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-foreground">Daily ledger volume</h3>
                <p className="text-xs text-muted-foreground">
                  Last 30 days from loaded ledger entries
                </p>
              </div>
              <ChartContainer config={chartConfig} className="h-[280px] w-full">
                <AreaChart data={timeline} margin={{ left: 4, right: 8, top: 8 }}>
                  <defs>
                    <linearGradient id="ledgerAmountFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-amount)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="var(--color-amount)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={28}
                    tickFormatter={(v) => shortDate(String(v))}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={52}
                    tickFormatter={(v) => formatDollars(Math.round(Number(v) * 100))}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        labelFormatter={(value) => shortDate(String(value))}
                        formatter={(value) => (
                          <span className="font-mono tabular-nums">
                            {formatDollarsExact(Math.round(Number(value) * 100))}
                          </span>
                        )}
                      />
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="var(--color-amount)"
                    strokeWidth={2}
                    fill="url(#ledgerAmountFill)"
                    activeDot={{ r: 4 }}
                  />
                </AreaChart>
              </ChartContainer>
            </div>
          ) : ledgerView === "type" ? (
            <div>
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-foreground">Volume by entry type</h3>
                <p className="text-xs text-muted-foreground">
                  How ledger dollars break down across charge types
                </p>
              </div>
              <ChartContainer config={chartConfig} className="h-[280px] w-full">
                <BarChart data={byType} layout="vertical" margin={{ left: 8, right: 12, top: 4 }}>
                  <CartesianGrid horizontal={false} />
                  <XAxis
                    type="number"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => formatDollars(Math.round(Number(v) * 100))}
                  />
                  <YAxis
                    dataKey="label"
                    type="category"
                    tickLine={false}
                    axisLine={false}
                    width={110}
                    tickFormatter={(v) =>
                      String(v).length > 16 ? `${String(v).slice(0, 14)}…` : String(v)
                    }
                  />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        formatter={(value) => (
                          <span className="font-mono tabular-nums">
                            {formatDollarsExact(Math.round(Number(value) * 100))}
                          </span>
                        )}
                      />
                    }
                  />
                  <Bar dataKey="amount" radius={6} maxBarSize={28}>
                    {byType.map((entry) => (
                      <Cell key={entry.key} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </div>
          ) : (
            <div>
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-foreground">Volume by partner</h3>
                <p className="text-xs text-muted-foreground">
                  Top partners by attributed ledger amount
                </p>
              </div>
              <ChartContainer config={chartConfig} className="h-[280px] w-full">
                <BarChart data={ledgerByPartner} margin={{ left: 4, right: 8, top: 4 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={52}
                    tickFormatter={(v) => formatDollars(Math.round(Number(v) * 100))}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        labelFormatter={(_, payload) =>
                          String(payload?.[0]?.payload?.fullName ?? "")
                        }
                        formatter={(value) => (
                          <span className="font-mono tabular-nums">
                            {formatDollarsExact(Math.round(Number(value) * 100))}
                          </span>
                        )}
                      />
                    }
                  />
                  <Bar
                    dataKey="amount"
                    fill="var(--color-amount)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={42}
                  />
                </BarChart>
              </ChartContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
