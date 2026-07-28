import { createServerClient } from "@supabase/ssr"
import { type EmailOtpType } from "@supabase/supabase-js"
import { NextResponse, type NextRequest } from "next/server"
import { getSupabaseEnv } from "@/lib/supabase/env"
import { attributeUserReferral } from "@/lib/referrals/attribution"
import { REFERRAL_COOKIE } from "@/lib/referrals/constants"

/**
 * Handles Supabase auth redirects from email links and OAuth.
 * PKCE emails arrive with `?code=...`; older templates use `?token_hash=&type=`.
 */
export async function handleAuthCallback(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const { searchParams, origin } = requestUrl
  const code = searchParams.get("code")
  const tokenHash = searchParams.get("token_hash")
  const type = searchParams.get("type") as EmailOtpType | null
  const next = searchParams.get("next") ?? "/dashboard"
  const redirectPath = next.startsWith("/") ? next : "/dashboard"
  const successUrl = `${origin}${redirectPath}`
  const isSignupConfirm =
    type === "signup" ||
    type === "email" ||
    redirectPath.startsWith("/onboarding")

  const { url, anonKey } = getSupabaseEnv()

  // Cookies must be written onto this response (route handler requirement).
  let response = NextResponse.redirect(successUrl)

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value)
        })
        response = NextResponse.redirect(successUrl)
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  async function finalizeForUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return false

    const refFromCookie = request.cookies.get(REFERRAL_COOKIE)?.value
    const refFromMeta =
      typeof user.user_metadata?.referral_code === "string"
        ? user.user_metadata.referral_code
        : null
    await attributeUserReferral(user.id, refFromCookie || refFromMeta)
    return true
  }

  // PKCE flow (default for new Supabase projects — signup, recovery, magic link)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && (await finalizeForUser())) {
      return response
    }
  }

  // OTP / token_hash flow (legacy email templates)
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    })
    if (!error && (await finalizeForUser())) {
      return response
    }
  }

  // Session already established (e.g. link opened twice in same browser)
  if (await finalizeForUser()) {
    return response
  }

  // Email may already be confirmed (scanner/prefetch consumed the one-time link).
  // Send signup users to sign-in instead of a dead-end "expired" page.
  if (isSignupConfirm) {
    const signInUrl = new URL("/sign-in", origin)
    signInUrl.searchParams.set("confirmed", "1")
    signInUrl.searchParams.set("next", redirectPath)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
