import { redirect } from "next/navigation"
import { isAdminEmail } from "@/lib/billing/admin"
import { getCurrentUser } from "@/lib/supabase/profile"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  if (!user || !isAdminEmail(user.email)) {
    redirect("/dashboard")
  }

  return children
}
