import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getCasesForUser } from "@/lib/cases/queries"
import { CasesTableClient } from "@/components/cases/cases-table-client"

export default async function CasesPage() {
  const cases = await getCasesForUser()

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Cases</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Manage client cases, bureau uploads, and generated documents.
            </p>
          </div>
          <Button size="sm" asChild>
            <Link href="/cases/new">
              <Plus className="mr-1.5 h-3.5 w-3.5" /> New Case
            </Link>
          </Button>
        </div>

        <div className="rounded-lg border border-border bg-card">
          <CasesTableClient cases={cases} pageSize={10} />
        </div>
      </div>
    </div>
  )
}
