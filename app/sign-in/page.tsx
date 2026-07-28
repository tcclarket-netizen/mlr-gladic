import Link from "next/link"
import { MarketingAuthShell } from "@/components/marketing/marketing-auth-shell"
import { SignInForm } from "@/components/auth/sign-in-form"

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string; confirmed?: string }>
}) {
  const { next, error, confirmed } = await searchParams

  return (
    <MarketingAuthShell title="Sign in to your account" subtitle="Enter your credentials to access the MLR workspace.">
      {confirmed === "1" && (
        <div className="mb-4 rounded-md border border-status-success/30 bg-status-success/8 px-3 py-2.5 text-sm text-foreground">
          Your email is confirmed. Sign in to continue.
        </div>
      )}

      {error === "oauth" && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
          Google sign-in failed. Please try again or use email and password.
        </div>
      )}

      <SignInForm next={next} />

      <p className="mt-5 text-center text-sm text-[#526174]">
        {"Don't have an account? "}
        <Link href="/sign-up" className="font-medium text-[#2454FF] hover:underline">
          Start Membership
        </Link>
      </p>
    </MarketingAuthShell>
  )
}
