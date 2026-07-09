import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { MarketingAuthShell } from "@/components/marketing/marketing-auth-shell"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"

export default function ResetPasswordPage() {
  return (
    <MarketingAuthShell
      title="Reset your password"
      subtitle="Enter your email and we'll send you a secure reset link."
    >
      <ResetPasswordForm />

      <div className="mt-5 flex justify-center">
        <Link
          href="/sign-in"
          className="flex items-center gap-1.5 text-sm text-[#526174] transition-colors hover:text-[#0B1020]"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
        </Link>
      </div>
    </MarketingAuthShell>
  )
}
