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

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "TK"

  return (
    <div className="flex min-h-screen">
      <AppSidebar
        displayName={displayName}
        accountLabel={accountLabel}
        initials={initials}
        email={user?.email ?? ""}
      />
      <main className="ml-60 min-w-0 flex-1">{children}</main>
    </div>
  )
}
