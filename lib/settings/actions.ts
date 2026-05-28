"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import type { AccountType } from "@/types/profile"

export type SettingsActionState = {
  error?: string
  success?: string
  fullName?: string
  accountType?: AccountType
}

export async function updateProfileSettings(
  _prevState: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  const fullName = String(formData.get("fullName") ?? "").trim()
  const accountType = String(formData.get("accountType") ?? "").trim() as AccountType

  if (!fullName) return { error: "Full name is required." }
  if (!["consumer", "consultant", "legal"].includes(accountType)) {
    return { error: "Please choose a valid account type." }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "Unauthorized." }

  const { error } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      full_name: fullName,
      account_type: accountType,
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single()

  if (error) return { error: error.message }

  await supabase.auth.updateUser({
    data: {
      full_name: fullName,
      account_type: accountType,
    },
  })

  revalidatePath("/settings")
  revalidatePath("/", "layout")

  return {
    success: "Profile updated.",
    fullName,
    accountType,
  }
}

export async function sendPasswordResetEmail(
  _prevState: SettingsActionState
): Promise<SettingsActionState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.email) return { error: "No email found for your account." }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
    redirectTo: `${siteUrl}/auth/callback?next=/update-password`,
  })

  if (error) return { error: error.message }
  return { success: "Password reset link sent to your email." }
}
