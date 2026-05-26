import { createClient } from "@/lib/supabase/server"
import type { CaseListItem, CaseWithReports } from "@/types/case"

export async function getCasesForUser(): Promise<CaseListItem[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from("cases")
    .select(
      `
      *,
      uploaded_reports ( bureau, status )
    `
    )
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })

  if (error) {
    console.error("getCasesForUser:", error.message)
    return []
  }

  return (data ?? []) as CaseListItem[]
}

export async function getCaseById(caseId: string): Promise<CaseWithReports | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data, error } = await supabase
    .from("cases")
    .select(
      `
      *,
      uploaded_reports ( * ),
      case_events ( * )
    `
    )
    .eq("id", caseId)
    .eq("user_id", user.id)
    .single()

  if (error) {
    console.error("getCaseById:", error.message)
    return null
  }

  const caseData = data as CaseWithReports
  caseData.case_events = (caseData.case_events ?? []).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  return caseData
}

export async function getDashboardStats() {
  const cases = await getCasesForUser()
  const activeCases = cases.filter((c) => c.status !== "closed").length
  const totalUploads = cases.reduce((sum, c) => sum + (c.uploaded_reports?.length ?? 0), 0)
  const readyReports = cases.reduce(
    (sum, c) =>
      sum + (c.uploaded_reports?.filter((r) => r.status === "processed").length ?? 0),
    0
  )

  return {
    activeCases,
    totalUploads,
    readyReports,
    recentCases: cases.slice(0, 5),
  }
}
