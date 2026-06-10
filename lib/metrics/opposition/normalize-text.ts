const ABBREVIATIONS: Record<string, string> = {
  st: "street",
  str: "street",
  rd: "road",
  dr: "drive",
  ln: "lane",
  blvd: "boulevard",
  ave: "avenue",
  av: "avenue",
  apt: "apartment",
  ste: "suite",
  fl: "floor",
  n: "north",
  s: "south",
  e: "east",
  w: "west",
  co: "company",
  corp: "corporation",
  inc: "incorporated",
  llc: "limited liability company",
}

function expandAbbreviations(tokens: string[]) {
  return tokens.map((t) => ABBREVIATIONS[t] ?? t)
}

export function normalizeAddress(value: string): string {
  const lowered = value
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
  if (!lowered) return ""
  const tokens = expandAbbreviations(lowered.split(" "))
  return tokens.join(" ")
}

export function normalizeEmployer(value: string): string {
  const lowered = value
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
  if (!lowered) return ""
  const tokens = expandAbbreviations(lowered.split(" "))
  return tokens.join(" ")
}

export function normalizeAccountName(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 48)
}
