import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function CaseNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <h1 className="text-lg font-semibold text-foreground">Case not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        This case does not exist or you do not have access to it.
      </p>
      <Button className="mt-6" asChild>
        <Link href="/cases">Back to Cases</Link>
      </Button>
    </div>
  )
}
