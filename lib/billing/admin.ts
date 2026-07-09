const ADMIN_EMAILS = [
  "teoasher.mg@gmail.com",
  "info@gladic.ai",
  "allansmi690@gmail.com",
  "jeanpauljr@gmail.com",
] as const

const ADMIN_EMAIL_SET = new Set(
  ADMIN_EMAILS.map((email) => email.trim().toLowerCase())
)

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return ADMIN_EMAIL_SET.has(email.trim().toLowerCase())
}

export { ADMIN_EMAILS }
