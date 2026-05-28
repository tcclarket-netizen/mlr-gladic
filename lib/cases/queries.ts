import { createClient } from "@/lib/supabase/server"
import type { CaseListItem, CaseWithReports } from "@/types/case"
import type { CaseMetrics } from "@/types/credit-report"
import { EMPTY_METRICS } from "@/types/credit-report"
import type { Tradeline, Inquiry, Collection } from "@/types/tradeline"
import type { GeneratedReport, LegalReportContent } from "@/types/legal-report"

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

export type CaseExtractionData = {
  case: CaseWithReports
  metrics: CaseMetrics
  tradelines: Tradeline[]
  inquiries: Inquiry[]
  collections: Collection[]
  legalReport: GeneratedReport | null
}

export async function getCaseExtractionData(
  caseId: string
): Promise<CaseExtractionData | null> {
  const caseData = await getCaseById(caseId)
  if (!caseData) return null

  const supabase = await createClient()

  const [tradelinesRes, inquiriesRes, collectionsRes, reportRes] = await Promise.all([
    supabase.from("tradelines").select("*").eq("case_id", caseId).order("creditor_name"),
    supabase.from("inquiries").select("*").eq("case_id", caseId).order("inquiry_date", {
      ascending: false,
    }),
    supabase.from("collections").select("*").eq("case_id", caseId),
    supabase
      .from("generated_reports")
      .select("*")
      .eq("case_id", caseId)
      .eq("report_type", "legal_report")
      .maybeSingle(),
  ])

  const metrics =
    caseData.metrics && typeof caseData.metrics === "object" && Object.keys(caseData.metrics).length > 0
      ? (caseData.metrics as CaseMetrics)
      : EMPTY_METRICS

  const legalReport = reportRes.data
    ? ({
        ...reportRes.data,
        content: reportRes.data.content as LegalReportContent,
      } as GeneratedReport)
    : null

  return {
    case: caseData,
    metrics,
    tradelines: (tradelinesRes.data ?? []) as Tradeline[],
    inquiries: (inquiriesRes.data ?? []) as Inquiry[],
    collections: (collectionsRes.data ?? []) as Collection[],
    legalReport,
  }
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
  const statusCounts = cases.reduce(
    (acc, c) => {
      acc[c.status] += 1
      return acc
    },
    { draft: 0, active: 0, review: 0, closed: 0 }
  )

  const dayLabels: string[] = []
  const casesByDaySeed = new Map<string, number>()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 13; i >= 0; i -= 1) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    dayLabels.push(key)
    casesByDaySeed.set(key, 0)
  }

  for (const c of cases) {
    const created = new Date(c.created_at)
    if (Number.isNaN(created.getTime())) continue
    const key = created.toISOString().slice(0, 10)
    if (casesByDaySeed.has(key)) {
      casesByDaySeed.set(key, (casesByDaySeed.get(key) ?? 0) + 1)
    }
  }

  const casesByDay = dayLabels.map((key) => ({
    date: key,
    count: casesByDaySeed.get(key) ?? 0,
  }))

  return {
    activeCases,
    totalUploads,
    readyReports,
    recentCases: cases.slice(0, 5),
    statusCounts,
    casesByDay,
  }
}
