import "server-only"
import type { SupabaseClient } from "@supabase/supabase-js"
import { CREDIT_REPORTS_BUCKET } from "@/lib/cases/constants"
import { extractBureauFromPdf } from "@/lib/extraction/extract-bureau"
import { normalizeTradelinesFromExtractions } from "@/lib/normalization/normalize-tradelines"
import { computeCaseMetrics } from "@/lib/metrics/compute-metrics"
import { buildLegalReportWithMarkdown } from "@/lib/report-generation/build-legal-report"
import { caseReferenceCode } from "@/lib/cases/constants"
import type { Bureau } from "@/types/case"
import type { BureauExtraction } from "@/lib/extraction/schema"

async function logEvent(
  supabase: SupabaseClient,
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

async function clearPriorExtraction(
  supabase: SupabaseClient,
  caseId: string
) {
  await supabase.from("tradelines").delete().eq("case_id", caseId)
  await supabase.from("inquiries").delete().eq("case_id", caseId)
  await supabase.from("collections").delete().eq("case_id", caseId)
  await supabase.from("public_records").delete().eq("case_id", caseId)
  await supabase.from("bureau_reports").delete().eq("case_id", caseId)
  await supabase.from("generated_reports").delete().eq("case_id", caseId)
}

export async function processCase(
  supabase: SupabaseClient,
  userId: string,
  caseId: string
): Promise<{ success: true } | { error: string }> {
  const { data: caseRow, error: caseError } = await supabase
    .from("cases")
    .select("id, client_name, state, user_id")
    .eq("id", caseId)
    .eq("user_id", userId)
    .single()

  if (caseError || !caseRow) {
    return { error: "Case not found." }
  }

  const { data: uploads, error: uploadsError } = await supabase
    .from("uploaded_reports")
    .select("id, bureau, file_path, file_name, status")
    .eq("case_id", caseId)
    .in("status", ["uploaded", "processing", "processed"])

  if (uploadsError || !uploads?.length) {
    return { error: "Upload at least one bureau report before processing." }
  }

  await supabase
    .from("uploaded_reports")
    .update({ status: "processing" })
    .eq("case_id", caseId)

  await supabase.from("cases").update({ status: "review" }).eq("id", caseId)

  await clearPriorExtraction(supabase, caseId)

  const extractions: BureauExtraction[] = []

  try {
    for (const upload of uploads) {
      const { data: file, error: downloadError } = await supabase.storage
        .from(CREDIT_REPORTS_BUCKET)
        .download(upload.file_path)

      if (downloadError || !file) {
        throw new Error(`Failed to download ${upload.bureau} PDF: ${downloadError?.message}`)
      }

      const buffer = await file.arrayBuffer()
      const extraction = await extractBureauFromPdf(buffer, upload.bureau as Bureau)

      extractions.push(extraction)

      await supabase.from("bureau_reports").upsert(
        {
          user_id: userId,
          case_id: caseId,
          uploaded_report_id: upload.id,
          bureau: upload.bureau,
          credit_score: extraction.credit_score,
          raw_extraction: extraction,
        },
        { onConflict: "uploaded_report_id" }
      )

      for (const inq of extraction.inquiries) {
        await supabase.from("inquiries").insert({
          user_id: userId,
          case_id: caseId,
          bureau: upload.bureau,
          creditor_name: inq.creditor_name,
          inquiry_type: inq.inquiry_type ?? "unknown",
          inquiry_date: inq.inquiry_date,
        })
      }

      for (const col of extraction.collections) {
        await supabase.from("collections").insert({
          user_id: userId,
          case_id: caseId,
          bureau: upload.bureau,
          creditor_name: col.creditor_name,
          balance: col.balance,
          status: col.status,
        })
      }

      for (const pr of extraction.public_records) {
        await supabase.from("public_records").insert({
          user_id: userId,
          case_id: caseId,
          bureau: upload.bureau,
          record_type: pr.record_type,
          status: pr.status,
          amount: pr.amount,
          filing_date: pr.filing_date,
        })
      }

      await supabase
        .from("uploaded_reports")
        .update({ status: "processed" })
        .eq("id", upload.id)
    }

    const normalized = normalizeTradelinesFromExtractions(extractions)
    const metrics = computeCaseMetrics(extractions, normalized)

    for (const tl of normalized) {
      await supabase.from("tradelines").insert({
        user_id: userId,
        case_id: caseId,
        normalized_key: tl.normalized_key,
        creditor_name: tl.creditor_name,
        account_type: tl.account_type,
        account_status: tl.account_status,
        bureaus: tl.bureaus,
        balance: tl.balance,
        credit_limit: tl.credit_limit,
        utilization_pct: tl.utilization_pct,
        date_opened: tl.date_opened,
        is_negative: tl.is_negative,
        verification_status: tl.verification_status,
        dispute_basis: tl.dispute_basis,
        raw_by_bureau: tl.raw_by_bureau,
      })
    }

    await supabase.from("cases").update({ metrics, status: "active" }).eq("id", caseId)

    await logEvent(supabase, userId, caseId, "extraction_complete", "Extraction complete", {
      tradelines: normalized.length,
      bureaus: extractions.length,
    })

    await supabase.from("generated_reports").upsert(
      {
        user_id: userId,
        case_id: caseId,
        report_type: "legal_report",
        title: "MY LEGAL REPORT™",
        status: "generating",
        content: {},
        markdown: null,
      },
      { onConflict: "case_id,report_type" }
    )

    const { content: reportContent, markdown } = buildLegalReportWithMarkdown({
      clientName: caseRow.client_name,
      caseState: caseRow.state,
      caseReference: caseReferenceCode(caseId),
      metrics,
      tradelines: normalized,
      extractions,
      uploadedFiles: uploads.map((u) => ({
        bureau: u.bureau as Bureau,
        file_name: u.file_name,
      })),
    })

    await supabase.from("generated_reports").upsert(
      {
        user_id: userId,
        case_id: caseId,
        report_type: "legal_report",
        title: "MY LEGAL REPORT™",
        status: "ready",
        content: reportContent,
        markdown,
      },
      { onConflict: "case_id,report_type" }
    )

    await logEvent(supabase, userId, caseId, "legal_report_generated", "MY LEGAL REPORT™ generated")

    return { success: true }
  } catch (e) {
    const message = e instanceof Error ? e.message : "Processing failed."

    await supabase
      .from("uploaded_reports")
      .update({ status: "failed" })
      .eq("case_id", caseId)
      .eq("status", "processing")

    await supabase.from("generated_reports").upsert(
      {
        user_id: userId,
        case_id: caseId,
        report_type: "legal_report",
        status: "failed",
        content: { error: message },
      },
      { onConflict: "case_id,report_type" }
    )

    await logEvent(supabase, userId, caseId, "processing_failed", "Processing failed", {
      error: message,
    })

    return { error: message }
  }
}
