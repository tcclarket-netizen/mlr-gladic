"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Loader2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function CreateReferralPartnerDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [contactEmail, setContactEmail] = useState("")
  const [notes, setNotes] = useState("")
  const [commissionPercent, setCommissionPercent] = useState("20")
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  function resetForm() {
    setName("")
    setCode("")
    setContactEmail("")
    setNotes("")
    setCommissionPercent("20")
    setError(null)
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setPending(true)
    try {
      const res = await fetch("/api/admin/referral-partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          code: code.trim() || undefined,
          contactEmail: contactEmail.trim() || undefined,
          notes: notes.trim() || undefined,
          commissionPercent,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Failed to create partner.")
        return
      }
      resetForm()
      setOpen(false)
      router.refresh()
    } catch {
      setError("Failed to create partner.")
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) resetForm()
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create partner
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create partner</DialogTitle>
          <DialogDescription>
            Set a referral code and commission percentage. Share the sign-up link after creating.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          {error && (
            <p className="rounded-md border border-destructive/30 bg-destructive/8 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="partner-name">Partner name</Label>
              <Input
                id="partner-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Acme Credit Partners"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="partner-code">Referral code (optional)</Label>
              <Input
                id="partner-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="auto from name"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="partner-commission">Commission %</Label>
              <Input
                id="partner-commission"
                type="number"
                min={0}
                max={100}
                step="0.01"
                value={commissionPercent}
                onChange={(e) => setCommissionPercent(e.target.value)}
                placeholder="20"
                required
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="partner-email">Contact email (optional)</Label>
              <Input
                id="partner-email"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="partner@example.com"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="partner-notes">Notes (optional)</Label>
              <Input
                id="partner-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Campaign, payout schedule, etc."
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending || !name.trim()}>
              {pending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating…
                </>
              ) : (
                "Create partner"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
