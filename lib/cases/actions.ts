"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CREDIT_REPORTS_BUCKET, storagePathForReport } from "@/lib/cases/constants"
import {
  getCaseCreationEntitlement,
  getUploadEntitlement,
} from "@/lib/billing/entitlements"
import type { AccountType } from "@/types/profile"
import type { Bureau } from "@/types/case"

export type CaseActionState = {
  error?: string
  caseId?: string
}

async function requireUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("You must be signed in.")
  }

  return { supabase, user }
}

async function assertCaseOwnership(caseId: string) {
  const { supabase, user } = await requireUser()

  const { data: caseRow, error } = await supabase
    .from("cases")
    .select("id")
    .eq("id", caseId)
    .eq("user_id", user.id)
    .single()

  if (error || !caseRow) {
    throw new Error("Case not found.")
  }

  return { supabase, user }
}

async function getBillingEntitlement(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  type: "case" | "upload"
) {
  const { data: billing } = await supabase
    .from("user_billing")
    .select("plan_key, billing_status, stripe_default_payment_method_id")
    .eq("user_id", userId)
    .maybeSingle()

  return type === "case"
    ? getCaseCreationEntitlement(billing)
    : getUploadEntitlement(billing)
}

async function logCaseEvent(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  caseId: string,
  eventType: string,
  title: string,
  metadata: Record<string, unknown> = {}
) {
  await supabase.from("case_events").insert({
    user_id: userId,
    case_id: caseId,
    event_type: eventType,
    title,
    metadata,
  })
}

export async function updateProfileAccountType(accountType: AccountType) {
  const { supabase, user } = await requireUser()

  const { error } = await supabase
    .from("profiles")
    .update({ account_type: accountType, updated_at: new Date().toISOString() })
    .eq("id", user.id)

  if (error) {
    return { error: error.message }
  }

  await supabase.auth.updateUser({
    data: { account_type: accountType },
  })

  return { success: true }
}

export async function createCase(
  _prevState: CaseActionState,
  formData: FormData
): Promise<CaseActionState> {
  try {
    const { supabase, user } = await requireUser()
    const entitlement = await getBillingEntitlement(supabase, user.id, "case")
    if (!entitlement.allowed) {
      return { error: entitlement.reason ?? "Your plan does not allow creating cases." }
    }
    const clientName = String(formData.get("clientName") ?? "").trim()
    const county = String(formData.get("county") ?? "").trim()
    const state = String(formData.get("state") ?? "").trim()
    const notes = String(formData.get("notes") ?? "").trim()
    const redirectTo = String(formData.get("redirectTo") ?? "")

    if (!clientName || !county || !state) {
      return { error: "Client name, county, and state are required." }
    }

    const { data: caseRow, error } = await supabase
      .from("cases")
      .insert({
        user_id: user.id,
        client_name: clientName,
        county,
        state,
        notes: notes || null,
        status: "draft",
      })
      .select("id")
      .single()

    if (error || !caseRow) {
      return { error: error?.message ?? "Failed to create case." }
    }

    await logCaseEvent(supabase, user.id, caseRow.id, "case_created", "Case created", {
      client_name: clientName,
      county,
      state,
    })

    revalidatePath("/dashboard")
    revalidatePath("/cases")

    if (redirectTo === "upload") {
      redirect(`/cases/${caseRow.id}/upload`)
    }

    if (redirectTo === "onboarding") {
      return { caseId: caseRow.id }
    }

    redirect(`/cases/${caseRow.id}`)
  } catch (e) {
    if (e instanceof Error && e.message === "NEXT_REDIRECT") throw e
    return { error: e instanceof Error ? e.message : "Failed to create case." }
  }
}

export async function recordReportUpload(input: {
  caseId: string
  bureau: Bureau
  filePath: string
  fileName: string
  fileSize: number
}) {
  const { supabase, user } = await assertCaseOwnership(input.caseId)
  const entitlement = await getBillingEntitlement(supabase, user.id, "upload")
  if (!entitlement.allowed) {
    return { error: entitlement.reason ?? "Your plan does not allow report uploads." }
  }

  const { data: existing } = await supabase
    .from("uploaded_reports")
    .select("id, file_path")
    .eq("case_id", input.caseId)
    .eq("bureau", input.bureau)
    .maybeSingle()

  if (existing?.file_path && existing.file_path !== input.filePath) {
    await supabase.storage.from(CREDIT_REPORTS_BUCKET).remove([existing.file_path])
  }

  const { error } = await supabase.from("uploaded_reports").upsert(
    {
      user_id: user.id,
      case_id: input.caseId,
      bureau: input.bureau,
      file_path: input.filePath,
      file_name: input.fileName,
      file_size: input.fileSize,
      mime_type: "application/pdf",
      status: "uploaded",
    },
    { onConflict: "case_id,bureau" }
  )

  if (error) {
    return { error: error.message }
  }

  await supabase
    .from("cases")
    .update({ status: "active", updated_at: new Date().toISOString() })
    .eq("id", input.caseId)

  await logCaseEvent(supabase, user.id, input.caseId, "report_uploaded", `${input.bureau} report uploaded`, {
    bureau: input.bureau,
    file_name: input.fileName,
  })

  revalidatePath(`/cases/${input.caseId}`)
  revalidatePath("/dashboard")
  revalidatePath("/cases")

  return { success: true }
}

export async function removeReportUpload(caseId: string, bureau: Bureau) {
  const { supabase, user } = await assertCaseOwnership(caseId)

  const { data: report } = await supabase
    .from("uploaded_reports")
    .select("file_path")
    .eq("case_id", caseId)
    .eq("bureau", bureau)
    .maybeSingle()

  if (report?.file_path) {
    await supabase.storage.from(CREDIT_REPORTS_BUCKET).remove([report.file_path])
  }

  const { error } = await supabase
    .from("uploaded_reports")
    .delete()
    .eq("case_id", caseId)
    .eq("bureau", bureau)

  if (error) {
    return { error: error.message }
  }

  await logCaseEvent(supabase, user.id, caseId, "report_removed", `${bureau} report removed`, {
    bureau,
  })

  revalidatePath(`/cases/${caseId}`)
  revalidatePath("/dashboard")

  return { success: true }
}

export async function startCaseProcessing(caseId: string) {
  await assertCaseOwnership(caseId)
  return { success: true, useApi: true as const }
}

export { storagePathForReport }
