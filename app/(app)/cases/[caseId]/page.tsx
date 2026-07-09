import { notFound } from "next/navigation"
import { getCaseExtractionData } from "@/lib/cases/queries"
import { getCaseBillingContext } from "@/lib/billing/queries"
import { CaseDetailView } from "@/components/cases/case-detail-view"

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ caseId: string }>
}) {
  const { caseId } = await params
  const [data, billingContext] = await Promise.all([
    getCaseExtractionData(caseId),
    getCaseBillingContext(caseId),
  ])

  if (!data || !billingContext) {
    notFound()
  }

  return <CaseDetailView {...data} billingContext={billingContext} />
}
