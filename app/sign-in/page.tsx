import Link from "next/link"
import { MarketingAuthShell } from "@/components/marketing/marketing-auth-shell"
import { SignInForm } from "@/components/auth/sign-in-form"

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  const { next, error } = await searchParams

  return (
    <MarketingAuthShell title="Sign in to your account" subtitle="Enter your credentials to access the MLR workspace.">
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
