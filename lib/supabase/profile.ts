import { hasSupabaseEnv } from "@/lib/supabase/env"
import { createClient } from "@/lib/supabase/server"
import type { Profile } from "@/types/profile"

export async function getCurrentUser() {
  if (!hasSupabaseEnv()) return null

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function getCurrentProfile(): Promise<Profile | null> {
  if (!hasSupabaseEnv()) return null

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, account_type, created_at, updated_at")
    .eq("id", user.id)
    .single()

  if (profile) return profile as Profile

  const metadata = user.user_metadata
  return {
    id: user.id,
    full_name: (metadata?.full_name as string) ?? user.email?.split("@")[0] ?? null,
    account_type: (metadata?.account_type as Profile["account_type"]) ?? "consumer",
    created_at: user.created_at,
    updated_at: user.updated_at ?? user.created_at,
  }
}
