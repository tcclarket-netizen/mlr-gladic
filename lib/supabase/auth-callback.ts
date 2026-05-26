import { createServerClient } from "@supabase/ssr"
import { type EmailOtpType } from "@supabase/supabase-js"
import { NextResponse, type NextRequest } from "next/server"
import { getSupabaseEnv } from "@/lib/supabase/env"

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
  const errorUrl = `${origin}/auth/auth-code-error`

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

  // PKCE flow (default for new Supabase projects — signup, recovery, magic link)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return response
    }
  }

  // OTP / token_hash flow (legacy email templates)
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    })
    if (!error) {
      return response
    }
  }

  return NextResponse.redirect(errorUrl)
}
