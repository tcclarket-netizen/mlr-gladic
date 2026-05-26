import { notFound } from "next/navigation"
import { getCaseById } from "@/lib/cases/queries"
import { CaseDetailView } from "@/components/cases/case-detail-view"

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ caseId: string }>
}) {
  const { caseId } = await params
  const caseData = await getCaseById(caseId)

  if (!caseData) {
    notFound()
  }

  return <CaseDetailView caseData={caseData} />
}
