import AppSidebar from "@/components/app-sidebar"
import { getCurrentProfile, getCurrentUser } from "@/lib/supabase/profile"
import { ACCOUNT_TYPE_LABELS } from "@/types/profile"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  const profile = await getCurrentProfile()

  const displayName =
    profile?.full_name?.trim() ||
    user?.email?.split("@")[0] ||
    "Account"

  const accountLabel = profile?.account_type
    ? ACCOUNT_TYPE_LABELS[profile.account_type]
    : "User"

  return (
    <div className="flex min-h-screen">
      <AppSidebar
        userId={user?.id ?? user?.email ?? "anonymous"}
        displayName={displayName}
        accountLabel={accountLabel}
        email={user?.email ?? ""}
      />
      <main className="ml-60 min-w-0 flex-1">{children}</main>
    </div>
  )
}
