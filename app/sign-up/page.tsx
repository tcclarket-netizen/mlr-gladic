import Link from "next/link"
import { MarketingAuthShell } from "@/components/marketing/marketing-auth-shell"
import { SignUpForm } from "@/components/auth/sign-up-form"

export default function SignUpPage() {
  return (
    <MarketingAuthShell
      title="Create your membership account"
      subtitle="Choose a membership and unlock monthly report access inside the MLR workspace."
    >
      <SignUpForm />

      <p className="mt-5 text-center text-sm text-[#526174]">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-medium text-[#2454FF] hover:underline">
          Sign in
        </Link>
      </p>
    </MarketingAuthShell>
  )
}
