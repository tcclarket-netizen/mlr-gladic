import Link from "next/link"
import { MlrHeader } from "@/components/marketing/mlr-header"
import { MlrFooter } from "@/components/marketing/mlr-footer"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <MlrHeader />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="mb-6 text-3xl font-bold text-[#0B1020]">Terms of Use</h1>
        <div className="rounded-xl border border-[#D8DEE9] bg-white p-8 text-sm leading-relaxed text-[#526174]">
          <p>
            By accessing MLR, you agree to use GLADIC AI™ reporting products for informational, educational, research,
            and self-help purposes only.
          </p>
          <p className="mt-4">
            GLADIC AI™ is not a law firm and does not provide legal representation. Membership access is subject to the
            selected plan terms, billing cycle, and report allowances.
          </p>
          <p className="mt-4 text-xs">
            Full terms of use content will be published here.
          </p>
        </div>
        <p className="mt-6 text-center text-xs text-[#526174]">
          <Link href="/" className="text-[#2454FF] hover:underline">
            Return to home
          </Link>
        </p>
      </main>
      <MlrFooter />
    </div>
  )
}
