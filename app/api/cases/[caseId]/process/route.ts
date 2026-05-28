import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { processCase } from "@/lib/cases/process-case"
import { hasOpenAI } from "@/lib/openai/client"

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

  const result = await processCase(supabase, user.id, caseId)

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
