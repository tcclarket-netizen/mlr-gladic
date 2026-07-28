import "server-only"
import { loadSection3ABodyFromDocx } from "@/lib/report-generation/section-3a-docx"

export async function buildSection3ABody(input: {
  clientName: string
  caseState: string
}) {
  return loadSection3ABodyFromDocx(input.caseState, input.clientName)
}

export const SECTION_3A_DEFINITION = {
  id: "3A",
  title: "Know Your Rights and Protection Under Your Residing State",
  label: "3A",
} as const
