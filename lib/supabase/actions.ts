"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { hasSupabaseEnv } from "@/lib/supabase/env"
import { createClient } from "@/lib/supabase/server"

export type AuthActionState = {
  error?: string
  success?: string
}

async function getSiteUrl() {
  const headersList = await headers()
  const origin = headersList.get("origin")
  const host = headersList.get("host")

  if (origin) return origin
  if (host) return `https://${host}`
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
}

export async function signIn(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  if (!hasSupabaseEnv()) {
    return { error: "Supabase is not configured. Add your env vars to .env.local." }
  }

  const email = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "")
  const next = String(formData.get("next") ?? "/dashboard")

  if (!email || !password) {
    return { error: "Email and password are required." }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: "Incorrect email or password." }
  }

  revalidatePath("/", "layout")
  redirect(next.startsWith("/") ? next : "/dashboard")
}

export async function signUp(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  if (!hasSupabaseEnv()) {
    return { error: "Supabase is not configured. Add your env vars to .env.local." }
  }

  const fullName = String(formData.get("fullName") ?? "").trim()
  const email = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "")
  const confirm = String(formData.get("confirm") ?? "")
  const accountType = String(formData.get("accountType") ?? "consumer")

  if (!fullName || !email || !password) {
    return { error: "All fields are required." }
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." }
  }

  if (password !== confirm) {
    return { error: "Passwords do not match." }
  }

  const supabase = await createClient()
  const siteUrl = await getSiteUrl()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback?next=/onboarding`,
      data: {
        full_name: fullName,
        account_type: accountType,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.session) {
    revalidatePath("/", "layout")
    redirect("/onboarding")
  }

  return {
    success:
      "Check your email to confirm your account, then sign in to continue.",
  }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/sign-in")
}

export async function resetPassword(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  if (!hasSupabaseEnv()) {
    return { error: "Supabase is not configured. Add your env vars to .env.local." }
  }

  const email = String(formData.get("email") ?? "").trim()

  if (!email) {
    return { error: "Please enter your email address." }
  }

  const supabase = await createClient()
  const siteUrl = await getSiteUrl()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=/update-password`,
  })

  if (error) {
    return { error: error.message }
  }

  return {
    success: "If an account exists for that email, we sent a password reset link.",
  }
}

export async function updatePassword(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  if (!hasSupabaseEnv()) {
    return { error: "Supabase is not configured. Add your env vars to .env.local." }
  }

  const password = String(formData.get("password") ?? "")
  const confirm = String(formData.get("confirm") ?? "")

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." }
  }

  if (password !== confirm) {
    return { error: "Passwords do not match." }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/", "layout")
  redirect("/dashboard")
}

export async function signInWithGoogle() {
  if (!hasSupabaseEnv()) {
    redirect("/sign-in?error=oauth")
  }

  const supabase = await createClient()
  const siteUrl = await getSiteUrl()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${siteUrl}/auth/callback?next=/dashboard`,
    },
  })

  if (error) {
    redirect("/sign-in?error=oauth")
  }

  if (data.url) {
    redirect(data.url)
  }

  redirect("/sign-in")
}
