import Link from "next/link"
import { ArrowLeft, FolderPlus } from "lucide-react"
import { CaseForm } from "@/components/cases/case-form"

export default function NewCasePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-lg px-6 py-8">
        <Link
          href="/cases"
          className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Cases
        </Link>

        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <FolderPlus className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">New case</h1>
            <p className="text-sm text-muted-foreground">
              Cases organize bureau reports, letters, and filings for one client.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <CaseForm redirectTo="upload" submitLabel="Create Case & Upload Reports" />
          <p className="mt-4 text-center text-xs text-muted-foreground">
            After creating the case, you can upload Experian, Equifax, and TransUnion PDFs.
          </p>
        </div>
      </div>
    </div>
  )
}
