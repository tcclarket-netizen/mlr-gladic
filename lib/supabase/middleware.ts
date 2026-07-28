import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { getSupabaseEnv, hasSupabaseEnv } from "@/lib/supabase/env"
import { normalizeReferralCode } from "@/lib/referrals/codes"
import { REFERRAL_COOKIE, REFERRAL_COOKIE_MAX_AGE_SECONDS, REFERRAL_QUERY_PARAM } from "@/lib/referrals/constants"

const PUBLIC_PATHS = [
  "/",
  "/sign-in",
  "/sign-up",
  "/reset-password",
  "/update-password",
  "/auth/callback",
  "/auth/confirm",
  "/auth/auth-code-error",
  "/api/stripe/webhook",
]

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  )
}

function applyReferralCookie(response: NextResponse, request: NextRequest) {
  const rawRef = request.nextUrl.searchParams.get(REFERRAL_QUERY_PARAM)
  const code = normalizeReferralCode(rawRef)
  if (!code) return response

  response.cookies.set(REFERRAL_COOKIE, code, {
    maxAge: REFERRAL_COOKIE_MAX_AGE_SECONDS,
    path: "/",
    sameSite: "lax",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  })
  return response
}

export async function updateSession(request: NextRequest) {
  if (!hasSupabaseEnv()) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })
  const { url, anonKey } = getSupabaseEnv()

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Supabase sometimes lands on Site URL with ?code= instead of the configured redirect path
  if (request.nextUrl.searchParams.has("code") && pathname !== "/auth/callback" && pathname !== "/auth/confirm") {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = "/auth/callback"
    return applyReferralCookie(NextResponse.redirect(redirectUrl), request)
  }

  if (!user && !isPublicPath(pathname)) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = "/sign-in"
    redirectUrl.searchParams.set("next", pathname)
    return applyReferralCookie(NextResponse.redirect(redirectUrl), request)
  }

  if (user && (pathname === "/sign-in" || pathname === "/sign-up")) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = "/dashboard"
    redirectUrl.search = ""
    return NextResponse.redirect(redirectUrl)
  }

  return applyReferralCookie(supabaseResponse, request)
}
