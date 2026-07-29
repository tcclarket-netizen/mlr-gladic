import { headers } from "next/headers"
import { CreateReferralPartnerDialog } from "@/components/admin/create-referral-partner-dialog"
import { ReferralLedgerSection } from "@/components/admin/referral-ledger-section"
import { ReferralPartnersTable } from "@/components/admin/referral-partners-table"
import { ReferralRevenueCharts } from "@/components/admin/referral-revenue-charts"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getReferralAdminDashboard } from "@/lib/referrals/admin-queries"

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100)
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

async function getSiteOrigin() {
  const headersList = await headers()
  const origin = headersList.get("origin")
  const host = headersList.get("host")
  if (origin) return origin
  if (host) return `https://${host}`
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
}

export default async function AdminReferralsPage() {
  const [{ partners, signups, transactions, revenueByDay }, siteOrigin] = await Promise.all([
    getReferralAdminDashboard(),
    getSiteOrigin(),
  ])

  const totalSignups = signups.length
  const totalRevenue = partners.reduce((sum, p) => sum + p.revenue_cents, 0)
  const totalCommissionOwed = partners.reduce((sum, p) => sum + p.commission_owed_cents, 0)

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Partner referrals
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage partners, commission %, and track referred signups and payments.
            </p>
          </div>
          <div className="shrink-0 sm:pt-0.5">
            <CreateReferralPartnerDialog />
          </div>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-border bg-card px-4 py-3">
            <p className="text-xs text-muted-foreground">Active partners</p>
            <p className="text-2xl font-semibold">{partners.filter((p) => p.is_active).length}</p>
          </div>
          <div className="rounded-lg border border-border bg-card px-4 py-3">
            <p className="text-xs text-muted-foreground">Total referred signups</p>
            <p className="text-2xl font-semibold">
              {partners.reduce((n, p) => n + p.signup_count, 0)}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card px-4 py-3">
            <p className="text-xs text-muted-foreground">Attributed revenue</p>
            <p className="text-2xl font-semibold">{formatMoney(totalRevenue, "usd")}</p>
          </div>
          <div className="rounded-lg border border-border bg-card px-4 py-3">
            <p className="text-xs text-muted-foreground">Commission owed</p>
            <p className="text-2xl font-semibold">{formatMoney(totalCommissionOwed, "usd")}</p>
          </div>
        </div>

        <ReferralRevenueCharts
          partners={partners}
          revenueByDay={revenueByDay}
          transactions={transactions}
        />

        <section className="mb-10">
          <h2 className="mb-3 text-sm font-semibold text-foreground">Partners</h2>
          <ReferralPartnersTable partners={partners} siteOrigin={siteOrigin} />
        </section>

        <section className="mb-10">
          <h2 className="mb-3 text-sm font-semibold text-foreground">
            Recent referred signups ({totalSignups} shown, max 100)
          </h2>
          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Partner</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Attributed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {signups.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-muted-foreground">
                      No referred signups yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  signups.map((row) => (
                    <TableRow key={row.user_id}>
                      <TableCell>
                        <div className="font-medium">{row.full_name ?? "—"}</div>
                        <div className="text-xs text-muted-foreground">{row.email ?? row.user_id}</div>
                      </TableCell>
                      <TableCell>{row.partner_name}</TableCell>
                      <TableCell className="font-mono text-xs">{row.referral_code}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDate(row.attributed_at)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </section>

        <ReferralLedgerSection transactions={transactions} />
      </div>
    </div>
  )
}
