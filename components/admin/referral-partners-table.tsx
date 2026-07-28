"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Check, Copy, Loader2, Pencil, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { ReferralPartnerRow } from "@/lib/referrals/admin-queries"

function formatMoney(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100)
}

type Props = {
  partners: ReferralPartnerRow[]
  siteOrigin: string
}

export function ReferralPartnersTable({ partners, siteOrigin }: Props) {
  const router = useRouter()
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [commissionDraft, setCommissionDraft] = useState("")
  const [error, setError] = useState<string | null>(null)

  async function toggleActive(partner: ReferralPartnerRow) {
    setPendingId(partner.id)
    setError(null)
    try {
      await fetch(`/api/admin/referral-partners/${partner.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !partner.is_active }),
      })
      router.refresh()
    } finally {
      setPendingId(null)
    }
  }

  async function saveCommission(partnerId: string) {
    setPendingId(partnerId)
    setError(null)
    try {
      const res = await fetch(`/api/admin/referral-partners/${partnerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commissionPercent: commissionDraft }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Failed to update commission.")
        return
      }
      setEditingId(null)
      router.refresh()
    } catch {
      setError("Failed to update commission.")
    } finally {
      setPendingId(null)
    }
  }

  async function copySignUpLink(partner: ReferralPartnerRow) {
    const url = `${siteOrigin}/sign-up?ref=${encodeURIComponent(partner.code)}`
    await navigator.clipboard.writeText(url)
    setCopiedId(partner.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="rounded-md border border-destructive/30 bg-destructive/8 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Partner</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Commission</TableHead>
              <TableHead className="text-right">Signups</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
              <TableHead className="text-right">Owed</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {partners.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                  No partners yet. Create one to get a sign-up link.
                </TableCell>
              </TableRow>
            ) : (
              partners.map((partner) => {
                const isPending = pendingId === partner.id
                const isEditing = editingId === partner.id

                return (
                  <TableRow key={partner.id}>
                    <TableCell>
                      <div className="font-medium text-foreground">{partner.name}</div>
                      {partner.contact_email ? (
                        <div className="text-xs text-muted-foreground">{partner.contact_email}</div>
                      ) : null}
                      {partner.notes ? (
                        <div className="mt-0.5 max-w-[220px] truncate text-xs text-muted-foreground">
                          {partner.notes}
                        </div>
                      ) : null}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{partner.code}</TableCell>
                    <TableCell>
                      <Badge variant={partner.is_active ? "default" : "secondary"}>
                        {partner.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            step="0.01"
                            value={commissionDraft}
                            onChange={(e) => setCommissionDraft(e.target.value)}
                            className="h-8 w-20 text-right"
                            disabled={isPending}
                          />
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            disabled={isPending}
                            onClick={() => saveCommission(partner.id)}
                          >
                            {isPending ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Check className="h-3.5 w-3.5" />
                            )}
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            disabled={isPending}
                            onClick={() => {
                              setEditingId(null)
                              setError(null)
                            }}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <span>{partner.commission_percent}%</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{partner.signup_count}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatMoney(partner.revenue_cents)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-medium">
                      {formatMoney(partner.commission_owed_cents)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => copySignUpLink(partner)}
                        >
                          <Copy className="mr-1.5 h-3.5 w-3.5" />
                          {copiedId === partner.id ? "Copied" : "Link"}
                        </Button>
                        {!isEditing ? (
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            title="Edit commission"
                            onClick={() => {
                              setEditingId(partner.id)
                              setCommissionDraft(String(partner.commission_percent))
                              setError(null)
                            }}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        ) : null}
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          disabled={isPending}
                          onClick={() => toggleActive(partner)}
                        >
                          {isPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : partner.is_active ? (
                            "Deactivate"
                          ) : (
                            "Activate"
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
