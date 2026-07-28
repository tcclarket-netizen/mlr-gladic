import "server-only"

import { NextResponse } from "next/server"
import { isAdminEmail } from "@/lib/billing/admin"
import { createClient } from "@/lib/supabase/server"

export async function requireAdminUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { user: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  if (!isAdminEmail(user.email)) {
    return {
      user: null,
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    }
  }

  return { user, error: null }
}
