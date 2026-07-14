import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { MlrHeader } from "@/components/marketing/mlr-header"
import { MlrFooter } from "@/components/marketing/mlr-footer"

const FULL_PRIVACY_URL = "https://gladic.ai/privacy"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <MlrHeader />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="mb-6 text-3xl font-bold text-[#0B1020]">Privacy Policy</h1>
        <div className="rounded-xl border border-[#D8DEE9] bg-white p-8 text-sm leading-relaxed text-[#526174]">
          <p>
            GLADIC AI™ is committed to protecting your privacy. This policy describes how we collect, use, and safeguard
            information submitted through the MLR reporting application.
          </p>
          <p className="mt-4">
            Credit documents and personal information uploaded to MLR are handled through secure document workflows with
            encrypted storage and access-controlled dashboards.
          </p>
        </div>

        <p className="mt-8 text-center text-sm text-[#526174]">
          Looking for the complete policy?{" "}
          <a
            href={FULL_PRIVACY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-[#2454FF] transition-colors hover:text-[#0B1020]"
          >
            View the full Privacy Policy
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
