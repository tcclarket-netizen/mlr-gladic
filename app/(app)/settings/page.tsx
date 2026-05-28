import Link from "next/link"
import { Shield, CreditCard, User2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { ProfileSettingsForm } from "@/components/settings/profile-settings-form"
import { SecuritySettingsForm } from "@/components/settings/security-settings-form"
import { getCurrentProfile, getCurrentUser } from "@/lib/supabase/profile"
import { getUserBilling } from "@/lib/billing/queries"
import { ACCOUNT_TYPE_LABELS } from "@/types/profile"

function formatStatus(status: string | null | undefined) {
  if (!status) return "none"
  return status.replaceAll("_", " ")
}

export default async function SettingsPage() {
  const [user, profile, billing] = await Promise.all([
    getCurrentUser(),
    getCurrentProfile(),
    getUserBilling(),
  ])

  const fullName = profile?.full_name ?? user?.user_metadata?.full_name ?? ""
  const email = user?.email ?? ""
  const accountType = (profile?.account_type ?? "consumer") as keyof typeof ACCOUNT_TYPE_LABELS

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-7">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Settings</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Manage your profile, security, and billing shortcuts.
          </p>
        </div>

        <div className="space-y-6">
          <section className="rounded-lg border border-border bg-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <User2 className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-base font-semibold text-foreground">Profile</h2>
            </div>
            <Separator className="mb-4" />
            <ProfileSettingsForm
              fullName={fullName}
              email={email}
              accountType={accountType}
            />
          </section>

          <section className="rounded-lg border border-border bg-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-base font-semibold text-foreground">Security</h2>
            </div>
            <Separator className="mb-4" />
            <p className="mb-3 text-xs text-muted-foreground">
              Send yourself a secure password reset link.
            </p>
            <SecuritySettingsForm />
          </section>

          <section className="rounded-lg border border-border bg-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-base font-semibold text-foreground">Billing</h2>
            </div>
            <Separator className="mb-4" />
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm text-foreground">
                  Current plan: <span className="font-medium">{billing?.plan_key ?? "free_trial"}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Status: {formatStatus(billing?.billing_status)}
                </p>
              </div>
              <Button asChild size="sm" variant="outline">
                <Link href="/billing">Open Billing</Link>
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
