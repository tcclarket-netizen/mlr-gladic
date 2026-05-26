import Link from "next/link"
import { AuthBrand, AuthDisclaimer } from "@/components/auth/auth-brand"
import { SignInForm } from "@/components/auth/sign-in-form"

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  const { next, error } = await searchParams

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/30 px-4 py-12">
      <div className="w-full max-w-sm">
        <AuthBrand />

        <div className="rounded-xl border border-border bg-card p-7 shadow-sm">
          <h2 className="mb-1 text-base font-semibold text-foreground">Sign in to your account</h2>
          <p className="mb-6 text-sm text-muted-foreground">Enter your credentials to continue.</p>

          {error === "oauth" && (
            <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/8 px-3 py-2.5 text-sm text-destructive">
              Google sign-in failed. Please try again or use email and password.
            </div>
          )}

          <SignInForm next={next} />

          <p className="mt-5 text-center text-sm text-muted-foreground">
            {"Don't have an account? "}
            <Link href="/sign-up" className="font-medium text-accent hover:underline">
              Create one
            </Link>
          </p>
        </div>

        <AuthDisclaimer />
      </div>
    </div>
  )
}
