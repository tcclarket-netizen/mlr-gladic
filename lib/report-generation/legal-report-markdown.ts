import type { LegalReportContent } from "@/types/legal-report"
import { sectionHeading } from "@/lib/report-generation/report-template"

function formatReportDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

export function legalReportToMarkdown(content: LegalReportContent): string {
  const lines: string[] = []

  lines.push(`# ${content.cover.title}`)
  lines.push("")
  lines.push(content.cover.subtitle)
  lines.push("")
  lines.push(`Prepared By: ${content.cover.prepared_by}`)
  lines.push(`Report Classification: ${content.cover.classification}`)
  lines.push(`Client Capacity: ${content.cover.client_capacity}`)
  lines.push(`Scope: ${content.cover.scope}`)
  lines.push(`Delivery Format: ${content.cover.delivery_format}`)
  lines.push(`Record Type: ${content.cover.record_type}`)
  lines.push("")
  lines.push(`Client: ${content.client_name}`)
  lines.push(`State: ${content.case_state}`)
  lines.push(`Case: ${content.case_reference}`)
  lines.push(`Generated: ${formatReportDate(content.generated_at)}`)
  lines.push("")
  lines.push("---")
  lines.push("")
  lines.push(content.notice_of_limitation)
  lines.push("")
  lines.push("---")
  lines.push("")
  lines.push("## TABLE OF CONTENTS")
  lines.push("")
  for (const title of content.table_of_contents) {
    lines.push(`- ${title}`)
  }
  lines.push("")
  lines.push("---")
  lines.push("")

  for (const section of content.sections) {
    lines.push(`## ${sectionHeading(section.number, section.title)}`)
    lines.push("")
    lines.push(section.body)
    lines.push("")
  }

  return lines.join("\n")
}
