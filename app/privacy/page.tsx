import Link from "next/link"
import { MlrHeader } from "@/components/marketing/mlr-header"
import { MlrFooter } from "@/components/marketing/mlr-footer"

function LegalPageLayout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <MlrHeader />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="mb-6 text-3xl font-bold text-[#0B1020]">{title}</h1>
        <div className="rounded-xl border border-[#D8DEE9] bg-white p-8 text-sm leading-relaxed text-[#526174]">
          {children}
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

export default function PrivacyPage() {
  return (
    <LegalPageLayout title="Privacy Policy">
      <p>
        GLADIC AI™ is committed to protecting your privacy. This policy describes how we collect, use, and safeguard
        information submitted through the MLR reporting application.
      </p>
      <p className="mt-4">
        Credit documents and personal information uploaded to MLR are handled through secure document workflows with
        encrypted storage and access-controlled dashboards.
      </p>
      <p className="mt-4 text-xs text-[#526174]">
        Full privacy policy content will be published here. For questions, contact support through your MLR account.
      </p>
    </LegalPageLayout>
  )
}
