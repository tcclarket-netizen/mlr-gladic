"use client"

import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { ReferralPartnerRow, ReferralRevenueByDay } from "@/lib/referrals/admin-queries"

type Props = {
  partners: ReferralPartnerRow[]
  revenueByDay: ReferralRevenueByDay[]
}

const chartConfig = {
  revenue: { label: "Revenue", color: "var(--chart-1)" },
  commission: { label: "Commission owed", color: "var(--chart-2)" },
}

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

export function ReferralRevenueCharts({ partners, revenueByDay }: Props) {
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

  const hasPartnerRevenue = byPartner.length > 0
  const hasDailyRevenue = daily.some((d) => d.revenue_cents > 0)

  return (
    <div className="mb-10 grid gap-4 lg:grid-cols-3">
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
  )
}
