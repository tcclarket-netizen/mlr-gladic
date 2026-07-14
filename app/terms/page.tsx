import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { MlrHeader } from "@/components/marketing/mlr-header"
import { MlrFooter } from "@/components/marketing/mlr-footer"

const FULL_TERMS_URL = "https://gladic.ai/terms"

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
        </div>

        <p className="mt-8 text-center text-sm text-[#526174]">
          Looking for the complete terms?{" "}
          <a
            href={FULL_TERMS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-[#2454FF] transition-colors hover:text-[#0B1020]"
          >
            View the full Terms of Use
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </a>{" "}
          on GLADIC AI™.
        </p>

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
