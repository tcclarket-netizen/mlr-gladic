import { cn } from "@/lib/utils"
import type { VerificationStatus } from "@/types/tradeline"

const labels: Record<VerificationStatus, string> = {
  verified: "Verified",
  proof_required: "Proof Required",
  method_needed: "Method Needed",
  review: "Review",
  suppression_candidate: "Suppression Candidate",
}

const styles: Record<VerificationStatus, string> = {
  verified: "text-status-success bg-status-success/10 border-status-success/20",
  proof_required: "text-status-warning bg-status-warning/10 border-status-warning/20",
  method_needed: "text-status-pending bg-status-pending/10 border-status-pending/20",
  review: "text-muted-foreground bg-muted border-border",
  suppression_candidate: "text-destructive bg-destructive/10 border-destructive/20",
}

export function VerificationBadge({ status }: { status: VerificationStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-1.5 py-0.5 text-[11px] font-medium",
        styles[status] ?? styles.review
      )}
    >
      {labels[status] ?? status}
    </span>
  )
}
