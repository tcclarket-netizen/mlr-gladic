import "server-only"
import type { BureauExtraction } from "@/lib/extraction/schema"
import { normalizeConsumerState } from "@/lib/report-generation/state-rights-data"

export type ResolvedJurisdiction = {
  primaryStateInput: string
  primary: ReturnType<typeof normalizeConsumerState>
  secondary: ReturnType<typeof normalizeConsumerState>[]
  selectionNote: string
}

function parseStateFromAddress(addr: {
  state?: string | null
  city?: string | null
  line?: string | null
  postal_code?: string | null
  status?: string
  reported_date?: string | null
}) {
  if (addr.state?.trim()) return addr.state.trim()
  const line = addr.line ?? ""
  const match = line.match(/\b([A-Z]{2})\b\s*,?\s*\d{5}(?:-\d{4})?/i)
  return match?.[1] ?? null
}

function addressSortKey(addr: {
  status?: string
  reported_date?: string | null
}) {
  const statusRank = addr.status === "current" ? 0 : addr.status === "former" ? 1 : 2
  const date = addr.reported_date ? Date.parse(addr.reported_date) : 0
  return { statusRank, date: Number.isFinite(date) ? date : 0 }
}

export function resolveControllingState(
  extractions: BureauExtraction[],
  caseStateFallback: string
): ResolvedJurisdiction {
  const allAddresses = extractions.flatMap((e) =>
    (e.addresses ?? []).map((a) => ({
      ...a,
      bureau: e.bureau,
      report_date: e.report_date,
    }))
  )

  const withState = allAddresses
    .map((a) => {
      const stateRaw = parseStateFromAddress(a)
      if (!stateRaw) return null
      return {
        ...a,
        stateRaw,
        normalized: normalizeConsumerState(stateRaw),
      }
    })
    .filter((a): a is NonNullable<typeof a> => a != null)

  if (withState.length > 0) {
    const sorted = [...withState].sort((a, b) => {
      const ka = addressSortKey(a)
      const kb = addressSortKey(b)
      if (ka.statusRank !== kb.statusRank) return ka.statusRank - kb.statusRank
      return kb.date - ka.date
    })

    const primaryEntry = sorted[0]
    const secondaryAbbrs = new Set<string>()
    const secondary: ReturnType<typeof normalizeConsumerState>[] = []

    for (const entry of sorted.slice(1)) {
      if (entry.normalized.stateAbbr === primaryEntry.normalized.stateAbbr) continue
      if (secondaryAbbrs.has(entry.normalized.stateAbbr)) continue
      secondaryAbbrs.add(entry.normalized.stateAbbr)
      secondary.push(entry.normalized)
    }

    const bureauList = [...new Set(withState.map((a) => a.bureau))].join(", ")
    return {
      primaryStateInput: primaryEntry.stateRaw,
      primary: primaryEntry.normalized,
      secondary,
      selectionNote: `Controlling state selected from current/most recent address on uploaded bureau report(s) (${bureauList}). Case file state used only if report addresses were unavailable.`,
    }
  }

  const fallback = normalizeConsumerState(caseStateFallback)
  return {
    primaryStateInput: caseStateFallback,
    primary: fallback,
    secondary: [],
    selectionNote:
      "No parseable current address was extracted from uploaded bureau PDFs. Controlling state reverted to the case file state of residence. Review bureau identity/address pages manually for confirmation.",
  }
}
