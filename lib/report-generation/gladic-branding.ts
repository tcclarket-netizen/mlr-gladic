import "server-only"
import fs from "fs"
import path from "path"

export const GLADIC_LOGO_FILES = {
  top: "logo-top.png",
  text: "logo-text.png",
  mascot: "logo.png",
} as const

const LOGO_DIR = path.join(process.cwd(), "public/logo")

/** Display sizes aligned with FINAL GENERATION MY LRPORT GLADIC.docx */
export const GLADIC_LOGO_DISPLAY = {
  top: { width: 199, height: 210 },
  text: { width: 85, height: 65 },
  mascot: { width: 100, height: 100 },
} as const

export function readGladicLogo(name: keyof typeof GLADIC_LOGO_FILES): Buffer {
  return fs.readFileSync(path.join(LOGO_DIR, GLADIC_LOGO_FILES[name]))
}
