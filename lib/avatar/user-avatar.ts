export type UserAvatarStyle = {
  gradientFrom: string
  gradientTo: string
  accent: string
  emoji: string
}

const AVATAR_EMOJIS = [
  "🦊",
  "🐼",
  "🦁",
  "🐨",
  "🐸",
  "🦉",
  "🐙",
  "🦄",
  "🐯",
  "🐵",
  "🐶",
  "🐱",
  "🐻",
  "🐰",
  "🦋",
  "🐢",
  "🦈",
  "🐬",
  "🦜",
  "🐝",
] as const

const AVATAR_PALETTES = [
  { gradientFrom: "#2454FF", gradientTo: "#1B3DB8", accent: "#7B9FFF" },
  { gradientFrom: "#0D9488", gradientTo: "#115E59", accent: "#5EEAD4" },
  { gradientFrom: "#7C3AED", gradientTo: "#5B21B6", accent: "#C4B5FD" },
  { gradientFrom: "#DB2777", gradientTo: "#9D174D", accent: "#F9A8D4" },
  { gradientFrom: "#EA580C", gradientTo: "#9A3412", accent: "#FDBA74" },
  { gradientFrom: "#0891B2", gradientTo: "#155E75", accent: "#67E8F9" },
  { gradientFrom: "#4F46E5", gradientTo: "#312E81", accent: "#A5B4FC" },
  { gradientFrom: "#059669", gradientTo: "#065F46", accent: "#6EE7B7" },
] as const

function hashString(value: string) {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash)
}

export function getUserAvatarStyle(seed: string): UserAvatarStyle {
  const hash = hashString(seed)
  const palette = AVATAR_PALETTES[hash % AVATAR_PALETTES.length]
  const emoji = AVATAR_EMOJIS[hash % AVATAR_EMOJIS.length]

  return {
    ...palette,
    emoji,
  }
}

export function getInitials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "?"
  )
}
