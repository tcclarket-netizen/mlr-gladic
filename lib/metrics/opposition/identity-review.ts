import type {
  NormalizedBureauData,
  OppositionBureauName,
  OppositionIdentityEntry,
} from "@/types/opposition-report"
import { normalizeAddress, normalizeEmployer } from "@/lib/metrics/opposition/normalize-text"

type RawEntry = {
  original: string
  bureau: OppositionBureauName
  normalized: string
  isCurrentLooking: boolean
}

function buildIdentityEntries(
  items: RawEntry[],
  kind: "address" | "employer"
): OppositionIdentityEntry[] {
  const groups = new Map<string, RawEntry[]>()

  for (const item of items) {
    if (!item.normalized) continue
    const list = groups.get(item.normalized) ?? []
    list.push(item)
    groups.set(item.normalized, list)
  }

  const bureauCount = new Set(items.map((i) => i.bureau)).size
  const majorityThreshold = Math.ceil(Math.max(bureauCount, 1) / 2)

  const entries: OppositionIdentityEntry[] = []

  for (const [normalizedValue, group] of groups) {
    const bureauSources = [...new Set(group.map((g) => g.bureau))]
    const originalValues = [...new Set(group.map((g) => g.original))]
    const onSingleBureau = bureauSources.length === 1 && bureauCount > 1
    const currentCount = group.filter((g) => g.isCurrentLooking).length
    const hasMultipleCurrent = currentCount > 1

    const minorityAcrossBureaus =
      bureauCount > 1 && bureauSources.length < majorityThreshold

    const formattingConflict =
      originalValues.length > 1 &&
      originalValues.some((a, i) =>
        originalValues.some((b, j) => i !== j && a.toLowerCase() !== b.toLowerCase())
      )

    let requiresReview =
      onSingleBureau ||
      hasMultipleCurrent ||
      minorityAcrossBureaus ||
      (kind === "employer" && onSingleBureau)

    if (kind === "address") {
      const allCurrent = items.filter((i) => i.isCurrentLooking)
      const distinctCurrentNorm = new Set(allCurrent.map((i) => i.normalized))
      if (distinctCurrentNorm.size > 1 && group.some((g) => g.isCurrentLooking)) {
        requiresReview = true
      }
    }

    if (formattingConflict && bureauSources.length === 1) {
      requiresReview = true
    }

    entries.push({
      originalValues,
      normalizedValue,
      bureauSources,
      requiresReview,
    })
  }

  return entries.sort((a, b) => a.normalizedValue.localeCompare(b.normalizedValue))
}

export function buildIdentityReview(bureaus: NormalizedBureauData[]): {
  addresses: OppositionIdentityEntry[]
  employers: OppositionIdentityEntry[]
} {
  const addressItems: RawEntry[] = []
  const employerItems: RawEntry[] = []

  for (const bureau of bureaus) {
    for (const addr of bureau.addresses ?? []) {
      const clean = addr.replace(/\s*\[(current|former)\]\s*/gi, "").trim()
      addressItems.push({
        original: clean,
        bureau: bureau.bureau,
        normalized: normalizeAddress(clean),
        isCurrentLooking: /\[current\]/i.test(addr),
      })
    }
    for (const emp of bureau.employers ?? []) {
      employerItems.push({
        original: emp,
        bureau: bureau.bureau,
        normalized: normalizeEmployer(emp),
        isCurrentLooking: true,
      })
    }
  }

  return {
    addresses: buildIdentityEntries(addressItems, "address"),
    employers: buildIdentityEntries(employerItems, "employer"),
  }
}
