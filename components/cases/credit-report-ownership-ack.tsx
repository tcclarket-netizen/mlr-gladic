"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
import { CheckCircle2, Shield } from "lucide-react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { GLADIC_BRAND } from "@/lib/brand"
import { cn } from "@/lib/utils"

export const CREDIT_REPORT_OWNERSHIP_FIELD = "creditReportOwnershipAck"
export const CREDIT_REPORT_CONSENT_PAYLOAD_FIELD = "creditReportConsentPayload"

export type ConsumerRelationship =
  | "consumer"
  | "authorized_representative"
  | "attorney"
  | "parent_guardian"
  | "power_of_attorney"
  | "personal_representative"
  | "other"

const RELATIONSHIP_OPTIONS: { value: ConsumerRelationship; label: string }[] = [
  { value: "consumer", label: "I am the consumer named in the report" },
  { value: "authorized_representative", label: "Authorized representative" },
  { value: "attorney", label: "Attorney or authorized legal representative" },
  { value: "parent_guardian", label: "Parent or legal guardian" },
  { value: "power_of_attorney", label: "Holder of a valid power of attorney" },
  {
    value: "personal_representative",
    label: "Personal representative, executor, administrator, or court-appointed fiduciary",
  },
  { value: "other", label: "Other lawful authority" },
]

type ConsentChecks = {
  ownershipAuthority: boolean
  retainAuthorization: boolean
  identityTheftClaim: boolean
  analysisAuthorization: boolean
  truthfulness: boolean
  finalRead: boolean
  finalAuthority: boolean
  finalLawfulObtain: boolean
  finalNoCreateRights: boolean
  finalFalseCertRisk: boolean
  finalProcessingAuth: boolean
}

const INITIAL_CHECKS: ConsentChecks = {
  ownershipAuthority: false,
  retainAuthorization: false,
  identityTheftClaim: false,
  analysisAuthorization: false,
  truthfulness: false,
  finalRead: false,
  finalAuthority: false,
  finalLawfulObtain: false,
  finalNoCreateRights: false,
  finalFalseCertRisk: false,
  finalProcessingAuth: false,
}

type CreditReportOwnershipAckProps = {
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

export function CreditReportOwnershipAck({
  accepted,
  onAcceptedChange,
  invalid = false,
}: CreditReportOwnershipAckProps) {
  const [open, setOpen] = useState(false)
  const [checks, setChecks] = useState<ConsentChecks>(INITIAL_CHECKS)
  const [relationship, setRelationship] = useState<ConsumerRelationship | "">("")
  const [otherAuthority, setOtherAuthority] = useState("")
  const [payloadJson, setPayloadJson] = useState("")

  const actingForAnother = relationship !== "" && relationship !== "consumer"

  const requiredComplete = useMemo(() => {
    const base =
      checks.ownershipAuthority &&
      Boolean(relationship) &&
      checks.analysisAuthorization &&
      checks.truthfulness &&
      checks.finalRead &&
      checks.finalAuthority &&
      checks.finalLawfulObtain &&
      checks.finalNoCreateRights &&
      checks.finalFalseCertRisk &&
      checks.finalProcessingAuth

    if (!base) return false
    if (relationship === "other" && !otherAuthority.trim()) return false
    if (actingForAnother && !checks.retainAuthorization) return false
    return true
  }, [actingForAnother, checks, otherAuthority, relationship])

  const setCheck = (key: keyof ConsentChecks, value: boolean) => {
    setChecks((prev) => ({ ...prev, [key]: value }))
    if (accepted) onAcceptedChange(false)
  }

  const handleContinue = () => {
    if (!requiredComplete || !relationship) return

    const payload = {
      version: "2026-07-ownership-v2",
      acceptedAt: new Date().toISOString(),
      relationship,
      otherAuthority: relationship === "other" ? otherAuthority.trim() : null,
      identityTheftClaim: checks.identityTheftClaim,
      acknowledgments: {
        ownershipAuthority: checks.ownershipAuthority,
        retainAuthorization: actingForAnother ? checks.retainAuthorization : null,
        analysisAuthorization: checks.analysisAuthorization,
        truthfulness: checks.truthfulness,
        finalRead: checks.finalRead,
        finalAuthority: checks.finalAuthority,
        finalLawfulObtain: checks.finalLawfulObtain,
        finalNoCreateRights: checks.finalNoCreateRights,
        finalFalseCertRisk: checks.finalFalseCertRisk,
        finalProcessingAuth: checks.finalProcessingAuth,
      },
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
            <Shield className="h-3.5 w-3.5 text-primary" aria-hidden />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold leading-snug text-foreground">
              Credit Report Ownership, Authorization &amp; Identity Verification
            </p>
            <span className="rounded border border-destructive/30 bg-destructive/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-destructive">
              Required
            </span>
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            Required before uploading any credit report or using {GLADIC_BRAND.full} services.
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
        name={CREDIT_REPORT_OWNERSHIP_FIELD}
        value={accepted ? "true" : "false"}
      />
      <input type="hidden" name={CREDIT_REPORT_CONSENT_PAYLOAD_FIELD} value={payloadJson} />

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="flex max-h-[90vh] max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
          <DialogHeader className="shrink-0 border-b border-border px-5 py-4 pr-12 text-left">
            <DialogTitle className="text-base leading-snug">
              Credit Report Ownership, Authorization, and Identity-Verification Acknowledgment
            </DialogTitle>
            <DialogDescription className="text-[11px] leading-relaxed">
              Required before uploading any credit report or using {GLADIC_BRAND.full} services.
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-4">
            {/* 1. Ownership */}
            <section className="space-y-2.5">
              <SectionTitle>1. Ownership or Lawful Authority</SectionTitle>
              <BodyText>
                <p>
                  I acknowledge, certify, and agree that I am either the consumer personally
                  identified in the credit report, consumer disclosure, or related record being
                  uploaded; or a person possessing valid, current, and legally sufficient authority
                  from the identified consumer to possess, upload, access, review, and submit the
                  information for analysis through {GLADIC_BRAND.full}.
                </p>
                <p>
                  I certify that I obtained the report lawfully and possess the right and authority
                  to provide it to {GLADIC_BRAND.full} for the services requested.
                </p>
                <p>
                  I will not upload, access, submit, alter, disclose, or use another person&apos;s
                  credit report, identifying information, financial information, or consumer records
                  without that person&apos;s express authorization or other lawful authority.
                </p>
                <p>
                  I understand that federal law limits the furnishing and use of consumer reports to
                  legally recognized permissible purposes, including use in accordance with the
                  consumer&apos;s written instructions. Nothing in this acknowledgment grants me
                  authority that I do not otherwise lawfully possess. See 15 U.S.C. § 1681b.
                </p>
              </BodyText>
              <AckCheckbox
                id="ack-ownership"
                checked={checks.ownershipAuthority}
                onCheckedChange={(v) => setCheck("ownershipAuthority", v)}
              >
                <span className="font-medium">I acknowledge, certify, and agree</span> to the
                ownership or lawful authority terms above.
              </AckCheckbox>
            </section>

            {/* 2. Relationship */}
            <section className="space-y-2.5">
              <SectionTitle>2. Relationship to the Consumer</SectionTitle>
              <p className="text-[11px] text-muted-foreground">
                Select the relationship that applies:
              </p>
              <RadioGroup
                value={relationship}
                onValueChange={(value) => {
                  setRelationship(value as ConsumerRelationship)
                  if (accepted) onAcceptedChange(false)
                }}
                className="gap-2"
              >
                {RELATIONSHIP_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    htmlFor={`relationship-${option.value}`}
                    className={cn(
                      "flex cursor-pointer items-start gap-2.5 rounded-md border px-3 py-2.5 transition-colors",
                      relationship === option.value
                        ? "border-primary/30 bg-primary/5"
                        : "border-border bg-background hover:bg-muted/40"
                    )}
                  >
                    <RadioGroupItem
                      id={`relationship-${option.value}`}
                      value={option.value}
                      className="mt-0.5"
                    />
                    <span className="text-[11px] leading-relaxed text-foreground">
                      {option.label}
                    </span>
                  </label>
                ))}
              </RadioGroup>

              {relationship === "other" ? (
                <div className="space-y-1.5">
                  <Label htmlFor="other-authority" className="text-[11px]">
                    Describe your other lawful authority
                  </Label>
                  <Input
                    id="other-authority"
                    value={otherAuthority}
                    onChange={(e) => {
                      setOtherAuthority(e.target.value)
                      if (accepted) onAcceptedChange(false)
                    }}
                    placeholder="Describe your lawful authority…"
                    className="h-9 text-sm"
                  />
                </div>
              ) : null}

              {actingForAnother ? (
                <div className="space-y-2.5">
                  <BodyText>
                    <p className="font-medium text-foreground/80">
                      When acting for another consumer, I certify that:
                    </p>
                    <ul className="list-disc space-y-1 pl-4">
                      <li>
                        the consumer or applicable law authorizes my possession, upload, and
                        requested use of the report;
                      </li>
                      <li>
                        my authority has not expired, been revoked, or otherwise become invalid;
                      </li>
                      <li>
                        the authority is broad enough to permit the requested disclosure and
                        analysis; and
                      </li>
                      <li>
                        I will provide reasonable proof of authority if requested by{" "}
                        {GLADIC_BRAND.full}.
                      </li>
                    </ul>
                  </BodyText>
                  <AckCheckbox
                    id="ack-retain-auth"
                    checked={checks.retainAuthorization}
                    onCheckedChange={(v) => setCheck("retainAuthorization", v)}
                  >
                    I agree to retain the applicable authorization, power of attorney, court order,
                    guardianship record, representation agreement, or other supporting instrument and
                    provide it upon reasonable request.
                  </AckCheckbox>
                </div>
              ) : null}
            </section>

            {/* Identity theft */}
            <section className="space-y-2.5">
              <SectionTitle>Identity-Theft Acknowledgment</SectionTitle>
              <AckCheckbox
                id="ack-identity-theft"
                checked={checks.identityTheftClaim}
                onCheckedChange={(v) => setCheck("identityTheftClaim", v)}
              >
                This report contains information that I believe resulted from identity theft.
              </AckCheckbox>

              {checks.identityTheftClaim ? (
                <BodyText>
                  <p>
                    I acknowledge and certify that I am reporting information that I reasonably and
                    honestly believe resulted from the unauthorized or fraudulent use of my personal
                    identifying information.
                  </p>
                  <p>
                    To the best of my knowledge, the disputed accounts, transactions, inquiries,
                    addresses, names, identifying information, or other records were not opened,
                    initiated, authorized, approved, or knowingly received by me.
                  </p>
                  <p>
                    The Fair Credit Reporting Act defines identity theft generally as fraud
                    committed through the use of another person&apos;s identifying information. It
                    separately defines an identity-theft report for purposes of the Act&apos;s
                    identity-theft procedures. See 15 U.S.C. § 1681a.
                  </p>
                  <p className="font-medium text-foreground/80">
                    I understand that {GLADIC_BRAND.full} is not:
                  </p>
                  <ul className="list-disc space-y-1 pl-4">
                    <li>a law-enforcement agency;</li>
                    <li>a consumer reporting agency;</li>
                    <li>a creditor or furnisher;</li>
                    <li>a government identity-theft reporting agency;</li>
                    <li>a court, regulator, or arbitrator; or</li>
                    <li>a law firm or substitute for an attorney.</li>
                  </ul>
                  <p className="font-medium text-foreground/80">
                    I understand that uploading information to {GLADIC_BRAND.full} does not, by
                    itself:
                  </p>
                  <ul className="list-disc space-y-1 pl-4">
                    <li>create an official identity-theft report;</li>
                    <li>file a police or Federal Trade Commission report;</li>
                    <li>place a fraud alert or security freeze;</li>
                    <li>block information from a consumer report;</li>
                    <li>submit a dispute to a consumer reporting agency;</li>
                    <li>
                      notify a creditor, furnisher, regulator, or law-enforcement authority;
                    </li>
                    <li>
                      begin a lawsuit, arbitration, investigation, or administrative proceeding; or
                    </li>
                    <li>establish that identity theft legally occurred.</li>
                  </ul>
                </BodyText>
              ) : null}
            </section>

            {/* Analysis authorization */}
            <section className="space-y-2.5">
              <SectionTitle>Authorization for {GLADIC_BRAND.full} Analysis</SectionTitle>
              <BodyText>
                <p>
                  Subject to the {GLADIC_BRAND.full} Terms of Use and Privacy Policy, I authorize{" "}
                  {GLADIC_BRAND.full} to assist me in organizing information that may be used to
                  identify potentially inaccurate, incomplete, inconsistent, obsolete, or fraudulent
                  information; compare information appearing across consumer reports; identify
                  accounts, inquiries, addresses, public records, personal identifiers, and other
                  information requiring review; prepare consumer-directed notices, disputes,
                  requests, complaints, or supporting records; document suspected identity-theft
                  activity; preserve records and supporting materials submitted through the platform;
                  and prepare information that I may choose to provide to consumer reporting
                  agencies, furnishers, creditors, regulators, attorneys, courts, arbitrators, or
                  law-enforcement authorities.
                </p>
                <p>
                  This authorization does not appoint {GLADIC_BRAND.full} as my attorney, legal
                  representative, agent, fiduciary, credit bureau, government representative, or
                  law-enforcement agent.
                </p>
                <p>
                  {GLADIC_BRAND.full} may provide technology-assisted information, document
                  organization, issue identification, and self-help support. It does not
                  independently make legal filings, submit disputes, communicate with third parties,
                  or take action in my name unless a separate service expressly provides for that
                  action and I separately authorize it.
                </p>
              </BodyText>
              <AckCheckbox
                id="ack-analysis"
                checked={checks.analysisAuthorization}
                onCheckedChange={(v) => setCheck("analysisAuthorization", v)}
              >
                I authorize {GLADIC_BRAND.full} to receive, process, organize, compare, and analyze
                the information I voluntarily submit for the services I select.
              </AckCheckbox>
            </section>

            {/* Federal notice */}
            <section className="space-y-2.5">
              <SectionTitle>Federal Identity-Theft and Credit-Reporting Notice</SectionTitle>
              <BodyText>
                <p>
                  I understand that the Fair Credit Reporting Act establishes specific procedures
                  for information alleged to have resulted from identity theft.
                </p>
                <p>
                  Under 15 U.S.C. § 1681c-2, a consumer reporting agency generally must block
                  qualifying information identified by a consumer as resulting from alleged identity
                  theft after receiving the required materials. Those materials include appropriate
                  proof of the consumer&apos;s identity, a copy of an identity-theft report,
                  identification of the affected information, and a statement that the information
                  does not relate to a transaction by the consumer. The statute also permits a block
                  to be declined or rescinded under specified circumstances.
                </p>
                <ul className="list-disc space-y-1 pl-4">
                  <li>
                    15 U.S.C. § 1681c-1 addresses fraud alerts and certain identity-theft prevention
                    rights;
                  </li>
                  <li>
                    15 U.S.C. § 1681c-2 addresses blocking qualifying information resulting from
                    identity theft;
                  </li>
                  <li>
                    15 U.S.C. § 1681g(e) addresses access by identity-theft victims to certain
                    application and transaction records, subject to verification and statutory
                    requirements;
                  </li>
                  <li>
                    15 U.S.C. § 1681i addresses consumer-reporting-agency reinvestigation
                    procedures; and
                  </li>
                  <li>
                    15 U.S.C. § 1681s-2 establishes certain duties applicable to persons furnishing
                    information to consumer reporting agencies.
                  </li>
                </ul>
                <p>
                  I understand that {GLADIC_BRAND.full} cannot conclusively determine whether a
                  consumer reporting agency, creditor, furnisher, regulator, court, or other entity
                  is legally required to accept my position, block information, delete information,
                  correct a record, or provide a remedy.
                </p>
              </BodyText>
            </section>

            {/* Truthfulness */}
            <section className="space-y-2.5">
              <SectionTitle>Required Truthfulness and Non-Impersonation Certification</SectionTitle>
              <BodyText>
                <p className="font-medium text-foreground/80">I certify that I am not:</p>
                <ul className="list-disc space-y-1 pl-4">
                  <li>impersonating another person;</li>
                  <li>
                    using another person&apos;s identity or credit information without lawful
                    authority;
                  </li>
                  <li>
                    falsely representing that I am the consumer identified in the report;
                  </li>
                  <li>falsely representing that I am an authorized representative;</li>
                  <li>submitting a knowingly false identity-theft allegation;</li>
                  <li>concealing my participation in a transaction;</li>
                  <li>
                    falsely denying an account or transaction that I knowingly initiated or
                    authorized;
                  </li>
                  <li>
                    altering or fabricating a credit report, authorization, police report, FTC
                    report, affidavit, court record, or supporting document;
                  </li>
                  <li>
                    uploading information obtained through theft, deception, unauthorized access, or
                    unlawful interception; or
                  </li>
                  <li>
                    using {GLADIC_BRAND.full} to commit, facilitate, conceal, or further fraud or
                    another unlawful activity.
                  </li>
                </ul>
                <p>
                  Federal law prohibits specified fraudulent conduct involving identification
                  documents, authentication features, and identifying information. Federal criminal
                  liability depends on the particular conduct and all elements of the applicable
                  offense. See 18 U.S.C. §§ 1028 and 1028A.
                </p>
                <p>
                  I understand that a false statement made directly to {GLADIC_BRAND.full} is not
                  automatically a federal crime merely because it is false. However, false
                  statements, fabricated records, identity misuse, unauthorized computer access, or
                  fraudulent submissions may violate federal or state law when the required
                  statutory elements are present.
                </p>
              </BodyText>
              <AckCheckbox
                id="ack-truthfulness"
                checked={checks.truthfulness}
                onCheckedChange={(v) => setCheck("truthfulness", v)}
              >
                I certify that all information, documents, authorizations, selections, and
                statements I submit are true, complete, and accurate to the best of my knowledge and
                belief.
              </AckCheckbox>
            </section>

            {/* Platform protection */}
            <section className="space-y-2.5">
              <SectionTitle>Platform-Protection and Record-Preservation Notice</SectionTitle>
              <BodyText>
                <p>
                  I understand and agree that {GLADIC_BRAND.full} may, to the extent permitted by its
                  Terms of Use, Privacy Policy, and applicable law: deny, limit, or suspend access;
                  reject, restrict, or quarantine a submission; request additional identity or
                  authorization documentation; prevent further processing of information;
                  investigate suspected misuse of the platform; preserve relevant account, upload,
                  access, device, and system records; retain records reasonably necessary for
                  security, fraud prevention, legal compliance, or dispute resolution; respond to
                  valid subpoenas, warrants, court orders, or lawful government demands; and
                  cooperate with authorized investigations when legally required or permitted.
                </p>
                <p>
                  {GLADIC_BRAND.full} may refuse to process a report when ownership, consent, lawful
                  authority, authenticity, or permitted use cannot reasonably be established.
                </p>
              </BodyText>
            </section>

            {/* Final acceptance */}
            <section className="space-y-2.5">
              <SectionTitle>Required Final Acceptance</SectionTitle>
              <div className="space-y-2">
                <AckCheckbox
                  id="ack-final-read"
                  checked={checks.finalRead}
                  onCheckedChange={(v) => setCheck("finalRead", v)}
                >
                  I have read and agree to this Credit Report Ownership, Authorization,
                  Identity-Verification, Truthfulness, and Non-Impersonation Acknowledgment.
                </AckCheckbox>
                <AckCheckbox
                  id="ack-final-authority"
                  checked={checks.finalAuthority}
                  onCheckedChange={(v) => setCheck("finalAuthority", v)}
                >
                  I certify that I am the consumer identified in the uploaded report or possess
                  valid and lawful authority to act for that consumer.
                </AckCheckbox>
                <AckCheckbox
                  id="ack-final-lawful"
                  checked={checks.finalLawfulObtain}
                  onCheckedChange={(v) => setCheck("finalLawfulObtain", v)}
                >
                  I certify that the report and supporting records were obtained lawfully and may be
                  submitted to {GLADIC_BRAND.full} for the requested purpose.
                </AckCheckbox>
                <AckCheckbox
                  id="ack-final-no-create"
                  checked={checks.finalNoCreateRights}
                  onCheckedChange={(v) => setCheck("finalNoCreateRights", v)}
                >
                  I understand that selecting these boxes does not give me access rights or legal
                  authority that I do not already possess.
                </AckCheckbox>
                <AckCheckbox
                  id="ack-final-risk"
                  checked={checks.finalFalseCertRisk}
                  onCheckedChange={(v) => setCheck("finalFalseCertRisk", v)}
                >
                  I understand that false certification, impersonation, unauthorized access,
                  identity misuse, or submission of fabricated records may result in rejection or
                  termination of services and may expose the responsible person to civil or criminal
                  consequences when applicable.
                </AckCheckbox>
                <AckCheckbox
                  id="ack-final-process"
                  checked={checks.finalProcessingAuth}
                  onCheckedChange={(v) => setCheck("finalProcessingAuth", v)}
                >
                  I authorize {GLADIC_BRAND.full} to process and analyze the uploaded information in
                  accordance with the services selected, the Terms of Use, and the Privacy Policy.
                </AckCheckbox>
              </div>
            </section>
          </div>

          <DialogFooter className="shrink-0 flex-col gap-2 border-t border-border px-5 py-4 sm:flex-col sm:space-x-0">
            <Button
              type="button"
              className="w-full"
              disabled={!requiredComplete}
              onClick={handleContinue}
            >
              Continue to Secure Credit Report Upload
            </Button>
            <p className="text-[10px] leading-relaxed text-muted-foreground">
              By selecting “Continue to Secure Credit Report Upload,” you confirm that you have
              affirmatively checked and accepted each required acknowledgment above. You certify
              that you are the consumer identified in the report or possess valid lawful authority
              to act for that consumer. You authorize {GLADIC_BRAND.full} to process the information
              for the services you request, subject to the Terms of Use and Privacy Policy.{" "}
              {GLADIC_BRAND.full} provides technology-assisted credit-information analysis, rights
              intelligence, and document-support services. {GLADIC_BRAND.full} does not provide
              legal representation, determine official identity-theft victim status, or guarantee
              any investigation, dispute, correction, deletion, credit-score change, legal remedy,
              or outcome.
            </p>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
