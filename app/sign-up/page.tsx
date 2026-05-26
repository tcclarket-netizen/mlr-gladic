import Link from "next/link"
import { AuthBrand, AuthDisclaimer } from "@/components/auth/auth-brand"
import { SignUpForm } from "@/components/auth/sign-up-form"

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/30 px-4 py-12">
      <div className="w-full max-w-sm">
        <AuthBrand />

        <div className="rounded-xl border border-border bg-card p-7 shadow-sm">
          <h2 className="mb-1 text-base font-semibold text-foreground">Create your account</h2>
          <p className="mb-6 text-sm text-muted-foreground">Start your free trial today.</p>

          <SignUpForm />

          <p className="mt-5 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/sign-in" className="font-medium text-accent hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <AuthDisclaimer />
      </div>
    </div>
  )
}
