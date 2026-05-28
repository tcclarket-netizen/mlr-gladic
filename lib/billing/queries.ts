import { createClient } from "@/lib/supabase/server"
import type { UserBilling } from "@/lib/billing/types"

export async function getUserBilling(): Promise<UserBilling | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data } = await supabase
    .from("user_billing")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle()

  return (data as UserBilling | null) ?? null
}
