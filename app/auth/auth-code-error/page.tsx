import Link from "next/link"
import { AlertCircle } from "lucide-react"
import { MarketingAuthShell } from "@/components/marketing/marketing-auth-shell"

export default function AuthCodeErrorPage() {
  return (
    <MarketingAuthShell title="Authentication link expired">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
          <AlertCircle className="h-6 w-6 text-red-600" />
        </div>
        <p className="text-sm text-[#526174]">
          This sign-in or confirmation link is invalid or has expired. Request a new link and try again.
        </p>
        <Link
          href="/sign-in"
          className="mt-6 inline-block w-full rounded-lg bg-[#2454FF] px-4 py-2.5 text-center text-sm font-semibold text-white hover:brightness-110"
        >
          Back to sign in
        </Link>
      </div>
    </MarketingAuthShell>
  )
}
