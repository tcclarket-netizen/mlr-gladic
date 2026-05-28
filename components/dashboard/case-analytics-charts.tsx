"use client"

import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

type Props = {
  casesByDay: { date: string; count: number }[]
  statusCounts: { draft: number; active: number; review: number; closed: number }
}

const chartConfig = {
  count: { label: "Cases Created", color: "var(--chart-1)" },
  draft: { label: "Draft", color: "var(--muted-foreground)" },
  active: { label: "Active", color: "var(--chart-2)" },
  review: { label: "Review", color: "var(--chart-4)" },
  closed: { label: "Closed", color: "var(--chart-5)" },
}

function shortDate(isoDate: string) {
  const d = new Date(isoDate)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export function CaseAnalyticsCharts({ casesByDay, statusCounts }: Props) {
  const statusData = [
    { key: "draft", label: "Draft", value: statusCounts.draft, fill: "var(--color-draft)" },
    { key: "active", label: "Active", value: statusCounts.active, fill: "var(--color-active)" },
    { key: "review", label: "Review", value: statusCounts.review, fill: "var(--color-review)" },
    { key: "closed", label: "Closed", value: statusCounts.closed, fill: "var(--color-closed)" },
  ]

  return (
    <div className="mb-8 grid gap-4 lg:grid-cols-3">
      <div className="rounded-lg border border-border bg-card p-5 lg:col-span-2">
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-foreground">Daily Case Intake (14 days)</h3>
          <p className="text-xs text-muted-foreground">New cases created per day</p>
        </div>
        <ChartContainer config={chartConfig} className="h-[240px] w-full">
          <LineChart data={casesByDay}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(v) => shortDate(String(v))}
            />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => shortDate(String(value))}
                  formatter={(value) => (
                    <span className="font-mono tabular-nums">{Number(value)} case(s)</span>
                  )}
                />
              }
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="var(--color-count)"
              strokeWidth={2}
              dot={{ r: 3, fill: "var(--color-count)" }}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ChartContainer>
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-foreground">Case Status Mix</h3>
          <p className="text-xs text-muted-foreground">Current distribution</p>
        </div>
        <ChartContainer config={chartConfig} className="h-[240px] w-full">
          <BarChart data={statusData} layout="vertical" margin={{ left: 6, right: 6 }}>
            <CartesianGrid horizontal={false} />
            <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
            <YAxis
              dataKey="label"
              type="category"
              tickLine={false}
              axisLine={false}
              width={46}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Bar dataKey="value" radius={6}>
              {statusData.map((entry) => (
                <Cell key={entry.key} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  )
}
