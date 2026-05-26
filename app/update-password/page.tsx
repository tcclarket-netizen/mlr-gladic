import Link from "next/link"
import { AuthBrand } from "@/components/auth/auth-brand"
import { UpdatePasswordForm } from "@/components/auth/update-password-form"

export default function UpdatePasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/30 px-4 py-12">
      <div className="w-full max-w-sm">
        <AuthBrand />

        <div className="rounded-xl border border-border bg-card p-7 shadow-sm">
          <h2 className="mb-1 text-base font-semibold text-foreground">Set a new password</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Choose a strong password for your TurnKey account.
          </p>

          <UpdatePasswordForm />

          <p className="mt-5 text-center text-sm text-muted-foreground">
            <Link href="/sign-in" className="font-medium text-accent hover:underline">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
