import Link from "next/link"
import { MlrHeader } from "@/components/marketing/mlr-header"
import { MlrFooter } from "@/components/marketing/mlr-footer"

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
          <p className="mt-4 text-xs">
            Full refund policy content will be published here.
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
