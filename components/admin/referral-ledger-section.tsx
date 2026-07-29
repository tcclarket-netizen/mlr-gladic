"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { BillingLedgerRow } from "@/lib/referrals/admin-queries"

type Props = {
  transactions: BillingLedgerRow[]
}

function formatMoney(cents: number, currency = "usd") {
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

function labelEntryType(entryType: string) {
  return entryType.replaceAll("_", " ")
}

export function ReferralLedgerSection({ transactions }: Props) {
  return (
    <section>
      <h2 className="mb-1 text-sm font-semibold text-foreground">Transactions (ledger)</h2>
      <p className="mb-3 text-xs text-muted-foreground">
        Subscription invoices and pay-per-report unlock charges for referred customers.
      </p>
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Partner</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground">
                  No ledger entries yet.
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                    {formatDate(row.occurred_at)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{row.user_name ?? "—"}</div>
                    <div className="text-xs text-muted-foreground">{row.user_email ?? "—"}</div>
                  </TableCell>
                  <TableCell>{row.partner_name ?? "—"}</TableCell>
                  <TableCell className="text-xs capitalize">
                    {labelEntryType(row.entry_type)}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-xs">
                    {row.description ?? row.stripe_reference_id ?? "—"}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatMoney(row.amount_cents, row.currency)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  )
}
