import { Shield } from "lucide-react"

export function AuthBrand() {
  return (
    <div className="mb-8 flex flex-col items-center gap-3 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary shadow-sm">
        <Shield className="h-5 w-5 text-primary-foreground" />
      </div>
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">TurnKey Credit</h1>
        <p className="text-xs text-muted-foreground">Report Intelligence Platform</p>
      </div>
    </div>
  )
}

export function AuthDisclaimer() {
  return (
    <p className="mt-5 text-center text-[11px] leading-relaxed text-muted-foreground">
      TurnKey Credit is not a law firm and does not provide legal advice. This platform provides
      educational and self-help document tools only.
    </p>
  )
}
