import Link from "next/link"
import { Building2, FileText, CheckCircle, Clock, AlertCircle, Download, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const packets = [
  {
    agency: "CFPB",
    fullName: "Consumer Financial Protection Bureau",
    description: "Federal complaint filing for FCRA violations and unresolved disputes.",
    status: "Ready",
    items: ["Dispute correspondence log", "Bureau responses", "Supporting tradeline data", "Case narrative"],
    filedDate: null,
  },
  {
    agency: "FTC",
    fullName: "Federal Trade Commission",
    description: "FTC complaint filing for identity theft and FCRA-related issues.",
    status: "Ready",
    items: ["Identity information", "Dispute history", "Account details", "FTC report form"],
    filedDate: null,
  },
  {
    agency: "CA AG",
    fullName: "California Attorney General",
    description: "State-level complaint filing under California's consumer protection laws.",
    status: "In Progress",
    items: ["State-specific narrative", "Evidence exhibits", "CCRAA statutes reference", "Correspondence log"],
    filedDate: null,
  },
  {
    agency: "CA DFPI",
    fullName: "CA Dept. of Financial Protection & Innovation",
    description: "State regulator complaint for California-licensed financial entities.",
    status: "Not Started",
    items: ["Creditor license lookup", "Complaint form", "Supporting documentation"],
    filedDate: null,
  },
]

const evidence = [
  { label: "Bureau dispute letters (CRA)", status: "complete" },
  { label: "Furnisher verification requests", status: "complete" },
  { label: "CRA response letters received", status: "pending" },
  { label: "Certified mail receipts", status: "complete" },
  { label: "Credit report PDFs (all 3 bureaus)", status: "complete" },
  { label: "Case timeline documentation", status: "pending" },
]

const statusColors: Record<string, string> = {
  Ready: "text-status-success bg-status-success/10 border-status-success/20",
  "In Progress": "text-status-pending bg-status-pending/10 border-status-pending/20",
  "Not Started": "text-muted-foreground bg-muted border-border",
  Filed: "text-status-success bg-status-success/10 border-status-success/20",
}

export default function AgencyFilingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-7">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Agency Filing Center</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Build and track filing packets for federal and state regulatory agencies.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {/* Packets */}
          <div className="lg:col-span-2 space-y-4">
            {packets.map((packet) => (
              <div key={packet.agency} className="rounded-lg border border-border bg-card">
                <div className="flex items-start justify-between px-5 py-4 border-b border-border">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10">
                      <Building2 className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-semibold text-foreground">{packet.agency}</h2>
                        <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium", statusColors[packet.status])}>
                          {packet.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{packet.fullName}</p>
                    </div>
                  </div>
                </div>
                <div className="px-5 py-4">
                  <p className="mb-3 text-xs text-muted-foreground">{packet.description}</p>
                  <ul className="mb-4 space-y-1.5">
                    {packet.items.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-xs text-foreground">
                        <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center gap-2">
                    {packet.status === "Ready" && (
                      <>
                        <Button size="sm" variant="outline">
                          <Download className="mr-1.5 h-3.5 w-3.5" /> Download Packet
                        </Button>
                        <Button size="sm">
                          Mark as Filed
                        </Button>
                      </>
                    )}
                    {packet.status === "In Progress" && (
                      <Button size="sm" variant="outline">
                        <ChevronRight className="mr-1.5 h-3.5 w-3.5" /> Continue Building
                      </Button>
                    )}
                    {packet.status === "Not Started" && (
                      <Button size="sm" variant="outline">
                        Start Packet
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Evidence checklist */}
          <div>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Evidence Checklist</h2>
            <div className="rounded-lg border border-border bg-card px-4 py-4">
              <ul className="space-y-3">
                {evidence.map((item) => (
                  <li key={item.label} className="flex items-start gap-3">
                    {item.status === "complete" ? (
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-status-success" />
                    ) : (
                      <Clock className="mt-0.5 h-4 w-4 shrink-0 text-status-warning" />
                    )}
                    <span className={cn("text-xs leading-relaxed", item.status === "complete" ? "text-foreground" : "text-muted-foreground")}>
                      {item.label}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 rounded-md bg-secondary/60 px-3 py-2.5">
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  4/6 items complete. Upload remaining documents to strengthen your filing packets.
                </p>
              </div>
            </div>

            {/* Filing status tracker */}
            <h2 className="mb-3 mt-5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Filing Status</h2>
            <div className="rounded-lg border border-border bg-card px-4 py-4 space-y-3">
              {packets.map((p) => (
                <div key={p.agency} className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground">{p.agency}</span>
                  <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium", statusColors[p.status])}>
                    {p.status}
                  </span>
                </div>
              ))}
            </div>

            {/* Disclaimer */}
            <div className="mt-4 flex items-start gap-2 rounded-md border border-status-warning/30 bg-status-warning/5 px-3 py-3">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-status-warning" />
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                Filing packets are for self-help educational purposes. TurnKey Credit is not a law firm.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
