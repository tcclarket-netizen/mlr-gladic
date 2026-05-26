"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Shield,
  User,
  Briefcase,
  Building2,
  FolderPlus,
  Upload,
  ArrowRight,
  ArrowLeft,
  FileText,
  CheckCircle,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

const STEPS = ["Account Type", "Create Case", "Upload Reports", "What's Next"]

const userTypes = [
  {
    value: "consumer",
    icon: User,
    label: "Individual Consumer",
    desc: "Managing my own credit profile and building my personal case record.",
  },
  {
    value: "consultant",
    icon: Briefcase,
    label: "Credit Consultant",
    desc: "Working with clients to review their reports and generate procedural documents.",
  },
  {
    value: "legal",
    icon: Building2,
    label: "Legal Support / Law Office",
    desc: "Attorney practice or legal support team using structured case files.",
  },
]

const states = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
  "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
  "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
  "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
  "Wisconsin", "Wyoming",
]

const nextSteps = [
  { icon: FileText, title: "Extract", desc: "Parse tradelines, accounts, and inquiries from each bureau report." },
  { icon: Shield, title: "Normalize", desc: "Standardize and cross-reference data across all three bureaus." },
  { icon: FileText, title: "Generate MY LEGAL REPORT™", desc: "Create a comprehensive legal-ready interpretation document." },
  { icon: Upload, title: "Generate Dispute & Agency Packs", desc: "Produce dispute letters and agency filing packets based on findings." },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [userType, setUserType] = useState("")
  const [caseName, setCaseName] = useState("")
  const [caseState, setCaseState] = useState("")
  const [caseNotes, setCaseNotes] = useState("")
  const [uploads, setUploads] = useState({ experian: false, equifax: false, transunion: false })
  const [loading, setLoading] = useState(false)

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep(step + 1)
  }
  const handleBack = () => {
    if (step > 0) setStep(step - 1)
  }
  const handleFinish = () => {
    setLoading(true)
    setTimeout(() => router.push("/dashboard"), 1200)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/30 px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Brand */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary shadow-sm">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Welcome to TurnKey</h1>
          <p className="text-xs text-muted-foreground">{"Let's get your account set up in a few steps."}</p>
        </div>

        {/* Step indicators */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                    i < step
                      ? "bg-accent text-accent-foreground"
                      : i === step
                      ? "bg-primary text-primary-foreground"
                      : "bg-border text-muted-foreground"
                  )}
                >
                  {i < step ? <CheckCircle className="h-3.5 w-3.5" /> : i + 1}
                </div>
                <span className="hidden text-[10px] text-muted-foreground sm:block">{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn("h-px w-8 transition-colors", i < step ? "bg-accent" : "bg-border")} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="rounded-xl border border-border bg-card p-7 shadow-sm">
          {/* Step 1: User type */}
          {step === 0 && (
            <div>
              <h2 className="mb-1 text-base font-semibold text-foreground">Choose your account type</h2>
              <p className="mb-5 text-sm text-muted-foreground">This helps us tailor the experience to your needs.</p>
              <div className="space-y-3">
                {userTypes.map(({ value, icon: Icon, label, desc }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setUserType(value)}
                    className={cn(
                      "flex w-full items-start gap-4 rounded-lg border px-4 py-3.5 text-left transition-colors",
                      userType === value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40"
                    )}
                  >
                    <div className={cn(
                      "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
                      userType === value ? "bg-primary/10" : "bg-secondary"
                    )}>
                      <Icon className={cn("h-4 w-4", userType === value ? "text-primary" : "text-muted-foreground")} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                    </div>
                  </button>
                ))}
              </div>
              <Button className="mt-6 w-full" onClick={handleNext} disabled={!userType}>
                Continue <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Step 2: Create case */}
          {step === 1 && (
            <div>
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                  <FolderPlus className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-foreground">Create your first case</h2>
                  <p className="text-xs text-muted-foreground">Cases organize reports, letters, and filings.</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="clientName" className="text-xs font-medium">Client name</Label>
                  <Input
                    id="clientName"
                    placeholder="e.g. Jane Doe"
                    value={caseName}
                    onChange={(e) => setCaseName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="state" className="text-xs font-medium">State of residence</Label>
                  <select
                    id="state"
                    value={caseState}
                    onChange={(e) => setCaseState(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Select state…</option>
                    {states.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="notes" className="text-xs font-medium">
                    Notes <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Any relevant background or context…"
                    rows={3}
                    value={caseNotes}
                    onChange={(e) => setCaseNotes(e.target.value)}
                  />
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <Button variant="outline" onClick={handleBack} className="flex-1">
                  <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
                </Button>
                <Button className="flex-1" onClick={handleNext} disabled={!caseName || !caseState}>
                  Create Case <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Upload */}
          {step === 2 && (
            <div>
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                  <Upload className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-foreground">Upload bureau reports</h2>
                  <p className="text-xs text-muted-foreground">3-bureau uploads produce the strongest analysis.</p>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { key: "experian" as const, label: "Experian", color: "text-red-600" },
                  { key: "equifax" as const, label: "Equifax", color: "text-blue-600" },
                  { key: "transunion" as const, label: "TransUnion", color: "text-blue-800" },
                ].map(({ key, label, color }) => (
                  <div
                    key={key}
                    className={cn(
                      "flex items-center justify-between rounded-lg border px-4 py-3 transition-colors",
                      uploads[key] ? "border-status-success bg-status-success/5" : "border-border"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <FileText className={cn("h-4 w-4", uploads[key] ? "text-status-success" : color)} />
                      <div>
                        <p className="text-sm font-medium text-foreground">{label} PDF</p>
                        <p className="text-xs text-muted-foreground">{uploads[key] ? "report-uploaded.pdf" : "No file selected"}</p>
                      </div>
                    </div>
                    {uploads[key] ? (
                      <CheckCircle className="h-4 w-4 text-status-success" />
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setUploads({ ...uploads, [key]: true })}
                      >
                        Upload
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[11px] text-muted-foreground">
                You can skip this step and upload reports later from the case detail page.
              </p>
              <div className="mt-5 flex gap-3">
                <Button variant="outline" onClick={handleBack} className="flex-1">
                  <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
                </Button>
                <Button className="flex-1" onClick={handleNext}>
                  {Object.values(uploads).some(Boolean) ? "Continue" : "Skip for now"}{" "}
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: What's next */}
          {step === 3 && (
            <div>
              <h2 className="mb-1 text-base font-semibold text-foreground">{"Here's what happens next"}</h2>
              <p className="mb-5 text-sm text-muted-foreground">
                Once reports are uploaded, TurnKey will process them through these stages.
              </p>
              <ol className="space-y-4">
                {nextSteps.map(({ icon: Icon, title, desc }, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{title}</p>
                      <p className="text-xs leading-relaxed text-muted-foreground mt-0.5">{desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="mt-6 rounded-md bg-secondary/60 px-3 py-2.5">
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  TurnKey Credit is not a law firm. All generated documents are for educational and procedural
                  self-help purposes only.
                </p>
              </div>
              <div className="mt-5 flex gap-3">
                <Button variant="outline" onClick={handleBack} className="flex-1">
                  <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
                </Button>
                <Button className="flex-1" onClick={handleFinish} disabled={loading}>
                  {loading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Setting up…</>
                  ) : (
                    <>Go to Dashboard <ArrowRight className="ml-1.5 h-4 w-4" /></>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
