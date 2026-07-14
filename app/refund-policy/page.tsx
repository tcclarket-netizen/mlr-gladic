import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { MlrHeader } from "@/components/marketing/mlr-header"
import { MlrFooter } from "@/components/marketing/mlr-footer"

const FULL_REFUNDS_URL = "https://gladic.ai/refunds"

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <MlrHeader />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="mb-6 text-3xl font-bold text-[#0B1020]">Refund Policy</h1>
        <div className="rounded-xl border border-[#D8DEE9] bg-white p-8 text-sm leading-relaxed text-[#526174]">
          <p>
            Customized AI-generated reports generally become non-refundable once processing has begun or the report has
            been delivered, subject to applicable law.
          </p>
          <p className="mt-4">
            Memberships may be canceled at any time. Cancellation prevents future renewal charges, and access continues
            through the end of the current billing period.
          </p>
        </div>

        <p className="mt-8 text-center text-sm text-[#526174]">
          Looking for the complete policy?{" "}
          <a
            href={FULL_REFUNDS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-[#2454FF] transition-colors hover:text-[#0B1020]"
          >
            View the full Refund Policy
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
