"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
import { CheckCircle2, Scale } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { GLADIC_BRAND } from "@/lib/brand"
import { cn } from "@/lib/utils"

export const LEGAL_RESEARCH_CONSENT_FIELD = "legalResearchConsentAck"
export const LEGAL_RESEARCH_CONSENT_PAYLOAD_FIELD = "legalResearchConsentPayload"

type ConsentChecks = {
  readConsent: boolean
  aiMistakes: boolean
  verifyAuthorities: boolean
  noLegalAdvice: boolean
  noAttorneyClient: boolean
  authorizeReports: boolean
  educationalOnly: boolean
  verifyBeforeRely: boolean
}

const INITIAL_CHECKS: ConsentChecks = {
  readConsent: false,
  aiMistakes: false,
  verifyAuthorities: false,
  noLegalAdvice: false,
  noAttorneyClient: false,
  authorizeReports: false,
  educationalOnly: false,
  verifyBeforeRely: false,
}

type LegalResearchConsentAckProps = {
  accepted: boolean
  onAcceptedChange: (accepted: boolean) => void
  invalid?: boolean
}

function AckCheckbox({
  id,
  checked,
  onCheckedChange,
  children,
}: {
  id: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  children: ReactNode
}) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-start gap-2.5 rounded-md border px-3 py-2.5 transition-colors",
        checked
          ? "border-primary/30 bg-primary/5"
          : "border-border bg-background hover:bg-muted/40"
      )}
    >
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(value === true)}
        className="mt-0.5"
      />
      <span className="text-[11px] leading-relaxed text-foreground">{children}</span>
    </label>
  )
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </h3>
  )
}

function BodyText({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "space-y-2 rounded-md border border-border/60 bg-muted/20 px-3 py-2.5 text-[11px] leading-relaxed text-muted-foreground",
        className
      )}
    >
      {children}
    </div>
  )
}

export function LegalResearchConsentAck({
  accepted,
  onAcceptedChange,
  invalid = false,
}: LegalResearchConsentAckProps) {
  const [open, setOpen] = useState(false)
  const [checks, setChecks] = useState<ConsentChecks>(INITIAL_CHECKS)
  const [payloadJson, setPayloadJson] = useState("")

  const requiredComplete = useMemo(
    () => Object.values(checks).every(Boolean),
    [checks]
  )

  const setCheck = (key: keyof ConsentChecks, value: boolean) => {
    setChecks((prev) => ({ ...prev, [key]: value }))
    if (accepted) onAcceptedChange(false)
  }

  const handleContinue = () => {
    if (!requiredComplete) return

    const payload = {
      version: "2026-07-legal-research-consent-v1",
      acceptedAt: new Date().toISOString(),
      acknowledgments: { ...checks },
    }

    setPayloadJson(JSON.stringify(payload))
    onAcceptedChange(true)
    setOpen(false)
  }

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
  }

  useEffect(() => {
    if (!accepted) setPayloadJson("")
  }, [accepted])

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border bg-muted/20",
        invalid && !accepted ? "border-destructive/50" : "border-border"
      )}
    >
      <div className="flex items-start gap-3 px-3.5 py-3">
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10">
          {accepted ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-status-success" aria-hidden />
          ) : (
            <Scale className="h-3.5 w-3.5 text-primary" aria-hidden />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold leading-snug text-foreground">
              Legal Research Consent, Acknowledgment &amp; Terms of Use
            </p>
            <span className="rounded border border-destructive/30 bg-destructive/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-destructive">
              Required
            </span>
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            Required before using any {GLADIC_BRAND.full} Report Service.
          </p>
          {accepted ? (
            <p className="mt-2 text-[11px] font-medium text-status-success">
              Acknowledgment accepted. You can review it again anytime.
            </p>
          ) : (
            <p className="mt-2 text-[11px] text-muted-foreground">
              Open the acknowledgment window to review and accept each required term.
            </p>
          )}
        </div>
      </div>

      <div className="border-t border-border/70 px-3.5 py-3">
        <Button
          type="button"
          variant={accepted ? "outline" : "default"}
          className="w-full"
          onClick={() => setOpen(true)}
        >
          {accepted ? "Review Acknowledgment" : "Open Acknowledgment"}
        </Button>
      </div>

      <input
        type="hidden"
        name={LEGAL_RESEARCH_CONSENT_FIELD}
        value={accepted ? "true" : "false"}
      />
      <input type="hidden" name={LEGAL_RESEARCH_CONSENT_PAYLOAD_FIELD} value={payloadJson} />

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="flex max-h-[90vh] max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
          <DialogHeader className="shrink-0 border-b border-border px-5 py-4 pr-12 text-left">
            <DialogTitle className="text-base leading-snug">
              Legal Research Consent, Acknowledgment, Authorization, and Terms of Use
            </DialogTitle>
            <DialogDescription className="text-[11px] leading-relaxed">
              {GLADIC_BRAND.full} Report Services — required before creating an account action or
              using any report service.
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-4">
            <section className="space-y-2.5">
              <SectionTitle>Legal Research Consent</SectionTitle>
              <BodyText>
                <p>
                  Before using any {GLADIC_BRAND.full} Report Service, including but not limited to
                  the Opposition Report™, My Legal Report™, My Self Report™, Opposition Dashboard™,
                  Credit Rights Intelligence Reports™, Consumer Rights Reports™, State Law
                  Reports™, and any other {GLADIC_BRAND.full} generated reports or services, you
                  must carefully read and acknowledge the following.
                </p>
                <p>
                  By selecting &ldquo;I Agree,&rdquo; creating an account, uploading information,
                  submitting documents, or using any {GLADIC_BRAND.full} service, you acknowledge
                  that you have read, understood, and voluntarily agree to the following terms.
                </p>
              </BodyText>
            </section>

            <section className="space-y-2.5">
              <SectionTitle>1. Purpose of {GLADIC_BRAND.full}</SectionTitle>
              <BodyText>
                <p>
                  {GLADIC_BRAND.full} is a Legal Intelligence and Rights Research Platform designed
                  to assist users in identifying potentially applicable legal authorities, consumer
                  protections, administrative remedies, regulations, governmental guidance, publicly
                  available legal resources, and educational information.
                </p>
                <p>
                  {GLADIC_BRAND.full} is designed to assist users in researching legal issues and
                  organizing information for educational, informational, investigative, and
                  self-help purposes.
                </p>
                <p>
                  {GLADIC_BRAND.full} is <span className="font-medium text-foreground/80">not</span>{" "}
                  designed to replace the independent judgment of licensed attorneys, judges,
                  regulators, governmental agencies, or courts.
                </p>
              </BodyText>
            </section>

            <section className="space-y-2.5">
              <SectionTitle>2. No Legal Advice</SectionTitle>
              <BodyText>
                <p className="font-medium text-foreground/80">
                  I understand and acknowledge that:
                </p>
                <ul className="list-disc space-y-1 pl-4">
                  <li>
                    {GLADIC_BRAND.full} is{" "}
                    <span className="font-medium text-foreground/80">not a law firm</span>.
                  </li>
                  <li>
                    {GLADIC_BRAND.full} is{" "}
                    <span className="font-medium text-foreground/80">not a licensed attorney</span>.
                  </li>
                  <li>
                    {GLADIC_BRAND.full} does{" "}
                    <span className="font-medium text-foreground/80">not provide legal advice</span>.
                  </li>
                  <li>
                    {GLADIC_BRAND.full} does{" "}
                    <span className="font-medium text-foreground/80">not practice law</span>.
                  </li>
                  <li>
                    {GLADIC_BRAND.full} does{" "}
                    <span className="font-medium text-foreground/80">
                      not provide legal representation
                    </span>
                    .
                  </li>
                  <li>
                    {GLADIC_BRAND.full} does{" "}
                    <span className="font-medium text-foreground/80">
                      not establish an attorney-client relationship
                    </span>
                    .
                  </li>
                </ul>
                <p>
                  Any information generated is provided solely for educational, informational, legal
                  research, investigative preparation, and self-help purposes.
                </p>
              </BodyText>
            </section>

            <section className="space-y-2.5">
              <SectionTitle>3. AI Limitations</SectionTitle>
              <BodyText>
                <p>I understand Artificial Intelligence has limitations.</p>
                <p>
                  Although {GLADIC_BRAND.full} utilizes advanced legal research technologies,
                  statutory databases, regulatory authorities, public legal sources, and proprietary
                  Rights Intelligence methodologies, I understand that Artificial Intelligence can:
                </p>
                <ul className="list-disc space-y-1 pl-4">
                  <li>Misinterpret facts</li>
                  <li>Misclassify legal authorities</li>
                  <li>Omit applicable statutes</li>
                  <li>Cite outdated authorities</li>
                  <li>Misread uploaded documents</li>
                  <li>Misidentify case law</li>
                  <li>Incorrectly summarize legal authorities</li>
                  <li>Generate inaccurate conclusions</li>
                  <li>Make factual, legal, or analytical errors</li>
                </ul>
                <p>
                  Accordingly,{" "}
                  <span className="font-medium text-foreground/80">
                    I understand that every report should be independently reviewed and verified
                    before being relied upon for legal, financial, governmental, business, or
                    personal decisions.
                  </span>
                </p>
              </BodyText>
            </section>

            <section className="space-y-2.5">
              <SectionTitle>
                4. Shepardizing®, Case Validation, and Legal Research Notice
              </SectionTitle>
              <BodyText>
                <p>I understand that {GLADIC_BRAND.full} may reference:</p>
                <ul className="list-disc space-y-1 pl-4">
                  <li>Judicial opinions</li>
                  <li>Statutes</li>
                  <li>Regulations</li>
                  <li>Administrative decisions</li>
                  <li>Agency guidance</li>
                  <li>Legal publications</li>
                  <li>Secondary authorities</li>
                  <li>Public legal databases</li>
                </ul>
                <p>
                  Although {GLADIC_BRAND.full} attempts to identify relevant legal authorities,{" "}
                  <span className="font-medium text-foreground/80">
                    it does not guarantee that every cited authority remains good law or has not
                    been modified, limited, distinguished, superseded, vacated, reversed, repealed,
                    or otherwise affected by later legal developments.
                  </span>
                </p>
                <p>
                  I acknowledge that:{" "}
                  <span className="font-medium text-foreground/80">
                    AI-generated legal research may contain errors.
                  </span>
                </p>
                <p>
                  Important legal authorities should always be independently verified using reliable
                  legal research services, official governmental publications, court records, or
                  qualified legal counsel before reliance.
                </p>
              </BodyText>
            </section>

            <section className="space-y-2.5">
              <SectionTitle>5. No Guarantee of Results</SectionTitle>
              <BodyText>
                <p>I understand {GLADIC_BRAND.full} cannot guarantee:</p>
                <ul className="list-disc space-y-1 pl-4">
                  <li>Legal success</li>
                  <li>Administrative success</li>
                  <li>Court victories</li>
                  <li>Settlements</li>
                  <li>Regulatory enforcement</li>
                  <li>Credit corrections</li>
                  <li>Government action</li>
                  <li>Litigation outcomes</li>
                  <li>Consumer relief</li>
                  <li>Financial recovery</li>
                </ul>
                <p>
                  Every legal matter depends upon its own facts, evidence, applicable law, judicial
                  interpretation, governmental discretion, and procedural requirements.
                </p>
              </BodyText>
            </section>

            <section className="space-y-2.5">
              <SectionTitle>6. User Responsibility</SectionTitle>
              <BodyText>
                <p>I understand that I remain solely responsible for:</p>
                <ul className="list-disc space-y-1 pl-4">
                  <li>Reviewing all reports</li>
                  <li>Verifying legal citations</li>
                  <li>Confirming statutes remain current</li>
                  <li>Confirming case law remains valid</li>
                  <li>Confirming factual accuracy</li>
                  <li>Reviewing uploaded documents</li>
                  <li>Determining whether legal counsel should be consulted</li>
                  <li>Making all final decisions</li>
                </ul>
              </BodyText>
            </section>

            <section className="space-y-2.5">
              <SectionTitle>7. Educational Use</SectionTitle>
              <BodyText>
                <p>{GLADIC_BRAND.full} reports are intended to help users:</p>
                <ul className="list-disc space-y-1 pl-4">
                  <li>Better understand their legal rights</li>
                  <li>Identify possible legal issues</li>
                  <li>Organize evidence</li>
                  <li>Research applicable laws</li>
                  <li>Prepare for discussions with attorneys</li>
                  <li>Prepare administrative complaints</li>
                  <li>Improve self-advocacy</li>
                </ul>
                <p>
                  They are educational tools and should not be interpreted as legal opinions.
                </p>
              </BodyText>
            </section>

            <section className="space-y-2.5">
              <SectionTitle>8. User Authorization</SectionTitle>
              <BodyText>
                <p>I authorize {GLADIC_BRAND.full} to:</p>
                <ul className="list-disc space-y-1 pl-4">
                  <li>Analyze information I voluntarily submit.</li>
                  <li>Review uploaded documents.</li>
                  <li>Process publicly available legal authorities.</li>
                  <li>Generate educational legal research reports.</li>
                  <li>
                    Produce Rights Intelligence Reports based upon submitted information.
                  </li>
                </ul>
              </BodyText>
            </section>

            <section className="space-y-2.5">
              <SectionTitle>9. Document Ownership</SectionTitle>
              <BodyText>
                <p>I certify that all information and documents I upload:</p>
                <ul className="list-disc space-y-1 pl-4">
                  <li>Belong to me, or</li>
                  <li>I possess lawful authority to upload and authorize review.</li>
                </ul>
                <p>
                  I understand unauthorized submission of another person&apos;s confidential records
                  may violate applicable federal or state laws.
                </p>
              </BodyText>
            </section>

            <section className="space-y-2.5">
              <SectionTitle>10. Privacy</SectionTitle>
              <BodyText>
                <p>
                  I understand {GLADIC_BRAND.full} will use submitted information in accordance with
                  its Privacy Policy, Terms of Service, applicable privacy laws, and security
                  procedures.
                </p>
              </BodyText>
            </section>

            <section className="space-y-2.5">
              <SectionTitle>11. Consent to Electronic Delivery</SectionTitle>
              <BodyText>
                <p>
                  I consent to receiving reports, updates, notices, acknowledgments, communications,
                  disclosures, and legal research electronically through my {GLADIC_BRAND.full}{" "}
                  account or registered email address.
                </p>
              </BodyText>
            </section>

            <section className="space-y-2.5">
              <SectionTitle>12. Acknowledgment</SectionTitle>
              <p className="text-[11px] text-muted-foreground">
                By selecting &ldquo;I Agree,&rdquo; I certify that:
              </p>
              <div className="space-y-2">
                <AckCheckbox
                  id="lrc-read"
                  checked={checks.readConsent}
                  onCheckedChange={(v) => setCheck("readConsent", v)}
                >
                  I have read this Legal Research Consent.
                </AckCheckbox>
                <AckCheckbox
                  id="lrc-ai-mistakes"
                  checked={checks.aiMistakes}
                  onCheckedChange={(v) => setCheck("aiMistakes", v)}
                >
                  I understand Artificial Intelligence can make mistakes.
                </AckCheckbox>
                <AckCheckbox
                  id="lrc-verify"
                  checked={checks.verifyAuthorities}
                  onCheckedChange={(v) => setCheck("verifyAuthorities", v)}
                >
                  I understand legal authorities should be independently verified.
                </AckCheckbox>
                <AckCheckbox
                  id="lrc-no-advice"
                  checked={checks.noLegalAdvice}
                  onCheckedChange={(v) => setCheck("noLegalAdvice", v)}
                >
                  I understand {GLADIC_BRAND.full} does not provide legal advice.
                </AckCheckbox>
                <AckCheckbox
                  id="lrc-no-acr"
                  checked={checks.noAttorneyClient}
                  onCheckedChange={(v) => setCheck("noAttorneyClient", v)}
                >
                  I understand no attorney-client relationship is created.
                </AckCheckbox>
                <AckCheckbox
                  id="lrc-authorize"
                  checked={checks.authorizeReports}
                  onCheckedChange={(v) => setCheck("authorizeReports", v)}
                >
                  I voluntarily authorize {GLADIC_BRAND.full} to generate legal research reports
                  using the information I provide.
                </AckCheckbox>
                <AckCheckbox
                  id="lrc-educational"
                  checked={checks.educationalOnly}
                  onCheckedChange={(v) => setCheck("educationalOnly", v)}
                >
                  I understand all reports are educational, informational, investigative, and
                  self-help resources.
                </AckCheckbox>
                <AckCheckbox
                  id="lrc-verify-rely"
                  checked={checks.verifyBeforeRely}
                  onCheckedChange={(v) => setCheck("verifyBeforeRely", v)}
                >
                  I agree to independently verify important legal authorities before relying upon
                  them.
                </AckCheckbox>
              </div>
            </section>

            <section className="space-y-2.5">
              <SectionTitle>Legal Authorities Supporting This Consent</SectionTitle>
              <BodyText>
                <p>
                  The following authorities support the educational nature of legal information
                  services, electronic disclosures, privacy practices, consumer consent, and the
                  distinction between legal information and legal representation:
                </p>
                <p className="font-medium text-foreground/80">Federal Statutes</p>
                <ul className="list-disc space-y-1 pl-4">
                  <li>
                    <span className="font-medium text-foreground/80">28 U.S.C. § 1654</span> — Right
                    of parties to conduct their own cases personally or by counsel.
                  </li>
                  <li>
                    <span className="font-medium text-foreground/80">
                      Electronic Signatures in Global and National Commerce Act (E-SIGN Act), 15
                      U.S.C. §§ 7001–7031
                    </span>{" "}
                    — Validates electronic records, disclosures, and signatures with consumer
                    consent.
                  </li>
                  <li>
                    <span className="font-medium text-foreground/80">
                      Uniform Electronic Transactions Act (UETA)
                    </span>{" "}
                    (adopted in most states) — Recognizes electronic contracts, signatures, and
                    records.
                  </li>
                  <li>
                    <span className="font-medium text-foreground/80">
                      Federal Trade Commission Act, 15 U.S.C. § 45
                    </span>{" "}
                    — Prohibits unfair or deceptive acts or practices; requires truthful
                    representations about products and services.
                  </li>
                  <li>
                    <span className="font-medium text-foreground/80">
                      Computer Fraud and Abuse Act, 18 U.S.C. § 1030
                    </span>{" "}
                    — Supports authorized access requirements for electronic systems and data.
                  </li>
                  <li>
                    <span className="font-medium text-foreground/80">
                      Stored Communications Act, 18 U.S.C. §§ 2701–2712
                    </span>{" "}
                    — Addresses protection of stored electronic communications.
                  </li>
                  <li>
                    <span className="font-medium text-foreground/80">
                      Federal Rules of Evidence 901 &amp; 902
                    </span>{" "}
                    — Govern authentication of evidence, emphasizing the need to verify information
                    before legal use.
                  </li>
                </ul>
                <p className="font-medium text-foreground/80">Privacy &amp; Data Protection</p>
                <ul className="list-disc space-y-1 pl-4">
                  <li>Applicable state privacy laws.</li>
                  <li>Applicable consumer protection statutes.</li>
                  <li>{GLADIC_BRAND.full} Privacy Policy.</li>
                </ul>
                <p className="font-medium text-foreground/80">Professional Responsibility</p>
                <p>
                  {GLADIC_BRAND.full} is designed as a legal information and research platform. It
                  does not engage in the practice of law, provide legal representation, or
                  substitute for licensed legal counsel. Users should consult qualified attorneys for
                  legal advice specific to their circumstances.
                </p>
              </BodyText>
            </section>

            <section className="space-y-2.5">
              <SectionTitle>Final Notice</SectionTitle>
              <BodyText>
                <p className="font-medium text-foreground/80">
                  Artificial Intelligence is a research tool—not a substitute for professional legal
                  judgment.
                </p>
                <p>
                  {GLADIC_BRAND.full} is designed to make users more informed, organized, and
                  prepared. It helps identify potentially relevant legal authorities and rights, but
                  users remain responsible for verifying significant legal information before acting
                  on it.
                </p>
                <p className="font-medium text-foreground/80">
                  When legal rights, deadlines, litigation, governmental filings, or substantial
                  financial interests are involved, independent verification of all legal
                  authorities is strongly recommended.
                </p>
              </BodyText>
            </section>
          </div>

          <DialogFooter className="shrink-0 flex-col gap-2 border-t border-border px-5 py-4 sm:flex-col sm:space-x-0">
            <Button
              type="button"
              className={cn(
                "w-full",
                requiredComplete &&
                  "bg-status-success text-white hover:bg-status-success/90"
              )}
              disabled={!requiredComplete}
              onClick={handleContinue}
            >
              I Agree
            </Button>
            <p className="text-[10px] leading-relaxed text-muted-foreground">
              By selecting &ldquo;I Agree,&rdquo; you confirm that you have affirmatively checked
              and accepted each required acknowledgment above. You certify that you have read this
              Legal Research Consent and understand that {GLADIC_BRAND.full} does not provide legal
              advice, does not practice law, and does not establish an attorney-client relationship.
              Reports are educational, informational, investigative, and self-help resources. You
              remain responsible for independently verifying important legal authorities before
              relying upon them.
            </p>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
