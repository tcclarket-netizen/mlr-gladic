/** Parse admin-entered commission % (0–100). Returns null if invalid. */
export function parseCommissionPercent(raw: unknown): number | null {
  if (raw === undefined || raw === null || raw === "") return null
  const value = typeof raw === "number" ? raw : Number(String(raw).trim())
  if (!Number.isFinite(value)) return null
  if (value < 0 || value > 100) return null
  return Math.round(value * 100) / 100
}

export function partnerCommissionCents(revenueCents: number, commissionPercent: number): number {
  if (revenueCents <= 0 || commissionPercent <= 0) return 0
  return Math.round((revenueCents * commissionPercent) / 100)
}
