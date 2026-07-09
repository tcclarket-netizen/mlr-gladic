import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { processCase } from "@/lib/cases/process-case"
import { hasOpenAI } from "@/lib/openai/client"
import { getProcessingEntitlement } from "@/lib/billing/entitlements"

export const maxDuration = 300
export const runtime = "nodejs"

export async function POST(
  _request: Request,
  context: { params: Promise<{ caseId: string }> }
) {
  if (!hasOpenAI()) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured. Add it to .env.local." },
      { status: 503 }
    )
  }

  const { caseId } = await context.params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: billing } = await supabase
    .from("user_billing")
    .select("plan_key, billing_status")
    .eq("user_id", user.id)
    .maybeSingle()

  const entitlement = getProcessingEntitlement(billing)
  if (!entitlement.allowed) {
    return NextResponse.json(
      { error: entitlement.reason ?? "Your membership is not active." },
      { status: 402 }
    )
  }

  const result = await processCase(supabase, user.id, caseId)

  if ("error" in result) {
    console.error(result.error)
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
