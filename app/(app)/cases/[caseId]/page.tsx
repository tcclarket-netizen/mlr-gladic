import { notFound } from "next/navigation"
import { getCaseExtractionData } from "@/lib/cases/queries"
import { CaseDetailView } from "@/components/cases/case-detail-view"

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ caseId: string }>
}) {
  const { caseId } = await params
  const data = await getCaseExtractionData(caseId)

  if (!data) {
    notFound()
  }

  return <CaseDetailView {...data} />
}
