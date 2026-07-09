import Link from "next/link"
import { MarketingAuthShell } from "@/components/marketing/marketing-auth-shell"
import { UpdatePasswordForm } from "@/components/auth/update-password-form"

export default function UpdatePasswordPage() {
  return (
    <MarketingAuthShell title="Set a new password" subtitle="Choose a strong password for your MLR account.">
      <UpdatePasswordForm />

      <p className="mt-5 text-center text-sm text-[#526174]">
        <Link href="/sign-in" className="font-medium text-[#2454FF] hover:underline">
          Back to sign in
        </Link>
      </p>
    </MarketingAuthShell>
  )
}
