import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { AuthBrand } from "@/components/auth/auth-brand"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/30 px-4 py-12">
      <div className="w-full max-w-sm">
        <AuthBrand />

        <div className="rounded-xl border border-border bg-card p-7 shadow-sm">
          <h2 className="mb-1 text-base font-semibold text-foreground">Reset your password</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Enter your email and we&apos;ll send you a secure reset link.
          </p>

          <ResetPasswordForm />

          <div className="mt-5 flex justify-center">
            <Link
              href="/sign-in"
              className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
            </Link>
          </div>
        </div>

        <p className="mt-5 text-center text-[11px] leading-relaxed text-muted-foreground">
          TurnKey Credit is not a law firm and does not provide legal advice.
        </p>
      </div>
    </div>
  )
}
