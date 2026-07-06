import Link from "next/link"
import { Shield, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AuthCodeErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/30 px-4 py-12">
      <div className="w-full max-w-sm text-center">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary shadow-sm">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">GLADIC AI™</h1>
        </div>

        <div className="rounded-xl border border-border bg-card p-7 shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <h2 className="text-base font-semibold text-foreground">Authentication link expired</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This sign-in or confirmation link is invalid or has expired. Request a new link and try
            again.
          </p>
          <Button asChild className="mt-6 w-full">
            <Link href="/sign-in">Back to sign in</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
