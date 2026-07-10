import "server-only"
import { execFile } from "child_process"
import { existsSync } from "fs"
import { mkdtemp, readFile, rm, writeFile } from "fs/promises"
import { tmpdir } from "os"
import path from "path"
import { promisify } from "util"
import { pathToFileURL } from "url"

const execFileAsync = promisify(execFile)

export class DocxToPdfError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "DocxToPdfError"
  }
}

const SOFFICE_CANDIDATES = [
  process.env.LIBREOFFICE_PATH,
  "/Applications/LibreOffice.app/Contents/MacOS/soffice",
  "/opt/homebrew/bin/soffice",
  "/usr/local/bin/soffice",
  "/usr/bin/libreoffice",
  "/usr/bin/soffice",
].filter((candidate): candidate is string => Boolean(candidate))

function findSofficeBinary() {
  for (const candidate of SOFFICE_CANDIDATES) {
    if (existsSync(candidate)) return candidate
  }

  throw new DocxToPdfError(
    "PDF export requires LibreOffice locally, or set GOTENBERG_URL for production (Vercel)."
  )
}

async function convertViaGotenberg(docx: Buffer): Promise<Buffer> {
  const baseUrl = process.env.GOTENBERG_URL?.replace(/\/$/, "")
  if (!baseUrl) {
    throw new DocxToPdfError("GOTENBERG_URL is not configured.")
  }

  const form = new FormData()
  form.append(
    "files",
    new Blob([new Uint8Array(docx)], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    }),
    "my-legal-report.docx"
  )

  const response = await fetch(`${baseUrl}/forms/libreoffice/convert`, {
    method: "POST",
    body: form,
  })

  if (!response.ok) {
    const detail = await response.text().catch(() => "")
    throw new DocxToPdfError(
      `Gotenberg PDF conversion failed (${response.status})${detail ? `: ${detail.slice(0, 300)}` : ""}`
    )
  }

  return Buffer.from(await response.arrayBuffer())
}

async function convertViaLocalLibreOffice(docx: Buffer): Promise<Buffer> {
  const soffice = findSofficeBinary()
  const workDir = await mkdtemp(path.join(tmpdir(), "mlr-docx-pdf-"))
  const profileDir = await mkdtemp(path.join(tmpdir(), "mlr-lo-profile-"))
  const inputPath = path.join(workDir, "my-legal-report.docx")
  const pdfPath = path.join(workDir, "my-legal-report.pdf")

  try {
    await writeFile(inputPath, docx)

    await execFileAsync(
      soffice,
      [
        "--headless",
        "--norestore",
        "--nologo",
        "--nofirststartwizard",
        `-env:UserInstallation=${pathToFileURL(profileDir).href}`,
        "--convert-to",
        "pdf",
        "--outdir",
        workDir,
        inputPath,
      ],
      { timeout: 120_000, maxBuffer: 10 * 1024 * 1024 }
    )

    if (!existsSync(pdfPath)) {
      throw new DocxToPdfError("LibreOffice finished but no PDF was created.")
    }

    return await readFile(pdfPath)
  } catch (error) {
    if (error instanceof DocxToPdfError) throw error
    const message = error instanceof Error ? error.message : "Unknown conversion error"
    throw new DocxToPdfError(`LibreOffice PDF conversion failed: ${message}`)
  } finally {
    await Promise.all([
      rm(workDir, { recursive: true, force: true }).catch(() => undefined),
      rm(profileDir, { recursive: true, force: true }).catch(() => undefined),
    ])
  }
}

/**
 * Convert DOCX → PDF with full Word layout (footers, fonts, page breaks).
 * - Production (Vercel): set GOTENBERG_URL to a hosted Gotenberg instance
 * - Local dev: uses LibreOffice on your machine when GOTENBERG_URL is unset
 */
export async function convertDocxBufferToPdf(docx: Buffer): Promise<Buffer> {
  if (process.env.GOTENBERG_URL) {
    return convertViaGotenberg(docx)
  }

  return convertViaLocalLibreOffice(docx)
}
