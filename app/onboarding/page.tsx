"use client"

import { useCallback, useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  Shield,
  User,
  Briefcase,
  Building2,
  Upload,
  ArrowRight,
  ArrowLeft,
  FileText,
  CheckCircle,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { updateProfileAccountType } from "@/lib/cases/actions"
import { OnboardingCreateCaseStep } from "@/components/cases/onboarding-create-case-step"
import { BureauUploadPanel } from "@/components/cases/bureau-upload-panel"
import type { AccountType } from "@/types/profile"

const STEPS = ["Account Type", "Create Case", "Upload Reports", "What's Next"]

const userTypes = [
  {
    value: "consumer" as AccountType,
    icon: User,
    label: "Individual Consumer",
    desc: "Managing my own credit profile and building my personal case record.",
  },
  {
    value: "consultant" as AccountType,
    icon: Briefcase,
    label: "Credit Consultant",
    desc: "Working with clients to review their reports and generate procedural documents.",
  },
  {
    value: "legal" as AccountType,
    icon: Building2,
    label: "Legal Support / Law Office",
    desc: "Attorney practice or legal support team using structured case files.",
  },
]

const nextSteps = [
  {
    icon: FileText,
    title: "Extract",
    desc: "Parse tradelines, accounts, and inquiries from each bureau report.",
  },
  {
    icon: Shield,
    title: "Normalize",
    desc: "Standardize and cross-reference data across all three bureaus.",
  },
  {
    icon: FileText,
    title: "Generate MY LEGAL REPORT™",
    desc: "Create a comprehensive legal-ready interpretation document.",
  },
  {
    icon: Upload,
    title: "Generate Dispute & Agency Packs",
    desc: "Produce dispute letters and agency filing packets based on findings.",
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [userType, setUserType] = useState<AccountType | "">("")
  const [caseId, setCaseId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [uploadCount, setUploadCount] = useState(0)
  const [error, setError] = useState("")
  const [pending, startTransition] = useTransition()

  const handleAccountTypeContinue = () => {
    if (!userType) return
    setError("")
    startTransition(async () => {
      const result = await updateProfileAccountType(userType)
      if (result.error) {
        setError(result.error)
        return
      }
      setStep(1)
    })
  }

  const handleCaseCreated = useCallback((id: string) => {
    setCaseId(id)
    setStep(2)
  }, [])

  const handleFetchUser = useCallback(async () => {
    const { createClient } = await import("@/lib/supabase/client")
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) setUserId(user.id)
  }, [])

  useEffect(() => {
    if (step === 2 && !userId) {
      void handleFetchUser()
    }
  }, [step, userId, handleFetchUser])

  const handleFinish = () => {
    if (caseId) {
      router.push(`/cases/${caseId}`)
    } else {
      router.push("/dashboard")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/30 px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary shadow-sm">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Welcome to GLADIC</h1>
          <p className="text-xs text-muted-foreground">
            Let&apos;s get your account set up in a few steps.
          </p>
        </div>

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
                <div
                  className={cn("h-px w-8 transition-colors", i < step ? "bg-accent" : "bg-border")}
                />
              )}
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-card p-7 shadow-sm">
          {error && (
            <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/8 px-3 py-2.5 text-sm text-destructive">
              {error}
            </div>
          )}

          {step === 0 && (
            <div>
              <h2 className="mb-1 text-base font-semibold text-foreground">
                Choose your account type
              </h2>
              <p className="mb-5 text-sm text-muted-foreground">
                This helps us tailor the experience to your needs.
              </p>
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
                    <div
                      className={cn(
                        "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
                        userType === value ? "bg-primary/10" : "bg-secondary"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4",
                          userType === value ? "text-primary" : "text-muted-foreground"
                        )}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{label}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
                    </div>
                  </button>
                ))}
              </div>
              <Button
                className="mt-6 w-full"
                onClick={handleAccountTypeContinue}
                disabled={!userType || pending}
              >
                {pending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
                  </>
                ) : (
                  <>
                    Continue <ArrowRight className="ml-1.5 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          )}

          {step === 1 && (
            <OnboardingCreateCaseStep
              onBack={() => setStep(0)}
              onCreated={handleCaseCreated}
            />
          )}

          {step === 2 && caseId && (
            <div>
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                  <Upload className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-foreground">Upload bureau reports</h2>
                  <p className="text-xs text-muted-foreground">
                    3-bureau uploads produce the strongest analysis.
                  </p>
                </div>
              </div>

              {userId ? (
                <BureauUploadPanel
                  caseId={caseId}
                  userId={userId}
                  compact
                  onUploadComplete={() => setUploadCount((n) => n + 1)}
                />
              ) : (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />
                  Loading…
                </div>
              )}

              <p className="mt-3 text-[11px] text-muted-foreground">
                You can skip this step and upload reports later from the case page.
              </p>
              <div className="mt-5 flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
                </Button>
                <Button className="flex-1" onClick={() => setStep(3)}>
                  {uploadCount > 0 ? "Continue" : "Skip for now"}{" "}
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && !caseId && (
            <p className="text-sm text-muted-foreground">Create a case first to upload reports.</p>
          )}

          {step === 3 && (
            <div>
              <h2 className="mb-1 text-base font-semibold text-foreground">
                Here&apos;s what happens next
              </h2>
              <p className="mb-5 text-sm text-muted-foreground">
                Once reports are uploaded, GLADIC AI™ will process them through these stages.
              </p>
              <ol className="space-y-4">
                {nextSteps.map(({ icon: Icon, title, desc }, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{title}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="mt-6 rounded-md bg-secondary/60 px-3 py-2.5">
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  GLADIC AI™ is not a law firm. All generated documents are for educational and
                  procedural self-help purposes only.
                </p>
              </div>
              <div className="mt-5 flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
                </Button>
                <Button className="flex-1" onClick={handleFinish}>
                  {caseId ? "Open Case" : "Go to Dashboard"}
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
