import "server-only"
import {
  AlignmentType,
  Document,
  Footer,
  ImageRun,
  LevelFormat,
  Packer,
  PageBreak,
  PageNumber,
  Paragraph,
  Tab,
  TabStopPosition,
  TabStopType,
  TextRun,
} from "docx"
import type { LegalReportContent } from "@/types/legal-report"
import { sectionHeading } from "@/lib/report-generation/report-template"
import {
  GLADIC_LOGO_DISPLAY,
  readGladicLogo,
} from "@/lib/report-generation/gladic-branding"

/** Primary: legal body / sections. Secondary: cover & marketing lines. */
const FONT_COURIER = "Courier New"
const FONT_TIMES = "Times New Roman"

const SIZE_BODY = 22 // 11pt
const SIZE_FOOTER = 18 // 9pt
/** Heading 1 — 16pt (cover title, primary headings) */
const SIZE_HEADING1 = 32
/** Heading 2 — 13pt (section titles, notice, TOC) */
const SIZE_HEADING2 = 26
const HEADING_COLOR = "000000"

const BULLET_LIST_REF = "gladic-bullet-list"

/** Full-width rule under marketing intro — underscores, not hyphens */
const INTRO_SECTION_RULE = "_".repeat(80)

const GLADIC_EVALUATES_LIST = [
  "Reporting authority",
  "Contractual liability",
  "Permissible purpose",
  "Investigation procedures",
  "Verification standards",
  "Identity integrity",
  "Consumer-protection compliance",
  "State and federal legal authorities",
] as const

const GLADIC_METHODOLOGY_ISSUES = [
  "Verification deficiencies",
  "Identity contamination",
  "Reporting inconsistencies",
  "Liability classification issues",
  "Permissible-purpose concerns",
  "Procedural compliance questions",
] as const

const GLADIC_METHODOLOGY_RULES = [
  "Fair Credit Reporting Act (FCRA)",
  "State consumer-protection laws",
  "Civil-rights protections",
  "Administrative guidance",
  "Regulatory requirements",
  "Relevant case law",
] as const

const RESTORING_BALANCE_VISIBILITY_LIST = [
  "Reporting procedures",
  "Verification methods",
  "Furnisher communications",
  "Internal dispute processes",
  "Documentary support underlying reported information",
] as const

const MORE_THAN_CREDIT_REPORT_LIST = [
  "Why it is reported",
  "Whether it is supported",
  "Whether reporting authority exists",
  "Whether investigation requirements appear satisfied",
  "Whether documentation may be requested",
  "What rights may exist under federal and state law",
] as const

const MY_LEGAL_REPORT_INCLUDES = [
  "Credit Profile Analysis",
  "Opposition Report Metrics™",
  "GLADIC AI™ Legal Intelligence Review",
  "Account-Level Legal Findings",
  "Federal Statutory Analysis",
  "State-Specific Legal Authorities",
  "Civil Rights & Contract Execution Review",
  "Compliance Assessment",
  "Rights Preservation Strategy",
  "Administrative Enforcement Roadmap",
  "Agency Filing Directives",
  "Evidence Index",
  "Generated Accountability Directives (G.A.D.™)",
] as const

const GLADIC_METHODOLOGY_APPLICATION = [
  "Credit cards",
  "Auto loans",
  "Mortgages",
  "Student loans",
  "Business credit",
  "Personal guarantees",
  "Collections",
  "Public records",
  "Inquiries",
  "Tradelines",
] as const

type ReportFont = typeof FONT_COURIER | typeof FONT_TIMES

type ParagraphOptions = {
  bold?: boolean
  italics?: boolean
  center?: boolean
  size?: number
  color?: string
  after?: number
  /** Defaults to Courier New */
  font?: ReportFont
}

type ImageParagraphOptions = {
  width: number
  height: number
  center?: boolean
  after?: number
  type?: "png" | "jpg" | "gif" | "bmp"
}

function formatReportDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

function heading1Paragraph(text: string, opts?: Omit<ParagraphOptions, "size">) {
  return paragraph(text, { ...opts, bold: opts?.bold ?? false, size: SIZE_HEADING1 })
}

function heading2Paragraph(text: string, opts?: Omit<ParagraphOptions, "size">) {
  return paragraph(text, { ...opts, bold: opts?.bold ?? false, size: SIZE_HEADING2 })
}

function paragraph(text: string, opts?: ParagraphOptions) {
  return new Paragraph({
    alignment: opts?.center ? AlignmentType.CENTER : undefined,
    spacing: { after: opts?.after ?? 160, line: 276 },
    children: [
      new TextRun({
        text: text || " ",
        font: opts?.font ?? FONT_COURIER,
        size: opts?.size ?? SIZE_BODY,
        bold: opts?.bold,
        italics: opts?.italics,
        color: opts?.color,
      }),
    ],
  })
}

function paragraphWithTrailingRule(text: string, opts?: ParagraphOptions) {
  const font = opts?.font ?? FONT_COURIER
  const size = opts?.size ?? SIZE_BODY
  return new Paragraph({
    alignment: opts?.center ? AlignmentType.CENTER : undefined,
    spacing: { after: opts?.after ?? 160, line: 276 },
    children: [
      new TextRun({
        text,
        font,
        size,
        bold: opts?.bold,
        italics: opts?.italics,
        color: opts?.color,
      }),
      new TextRun({ break: 1 }),
      new TextRun({
        text: INTRO_SECTION_RULE,
        font,
        size,
      }),
    ],
  })
}

/** Insert an image block — mirror of `paragraph()` for logos and figures. */
function imageParagraph(data: Buffer, opts: ImageParagraphOptions) {
  return new Paragraph({
    alignment: opts.center ? AlignmentType.CENTER : undefined,
    spacing: { after: opts.after ?? 160, line: 276 },
    children: [
      new ImageRun({
        type: opts.type ?? "png",
        data,
        transformation: {
          width: opts.width,
          height: opts.height,
        },
      }),
    ],
  })
}

function pageBreakParagraph() {
  return new Paragraph({ children: [new PageBreak()] })
}

function methodologySectionParagraphs(
  title: string,
  intro: string,
  items: readonly string[],
  opts?: { font?: ReportFont }
) {
  const font = opts?.font ?? FONT_TIMES
  return [
    paragraph(title, { font, bold: true }),
    paragraph(intro, { font }),
    ...bulletListParagraphs(items, { font }),
  ]
}

function bulletListParagraphs(
  items: readonly string[],
  opts?: { font?: ReportFont; size?: number }
) {
  return items.map(
    (item) =>
      new Paragraph({
        numbering: { reference: BULLET_LIST_REF, level: 0 },
        spacing: { after: 80, line: 276 },
        children: [
          new TextRun({
            text: item,
            font: opts?.font ?? FONT_TIMES,
            size: opts?.size ?? SIZE_BODY,
          }),
        ],
      })
  )
}

function paragraphsFromBlock(
  text: string,
  opts?: { italics?: boolean; font?: ReportFont }
) {
  return text
    .split("\n")
    .map((line) => paragraph(line, { italics: opts?.italics, font: opts?.font }))
}

function sectionTitleParagraph(number: number | string, title: string) {
  return heading2Paragraph(sectionHeading(number, title), {
    color: HEADING_COLOR,
    bold: true,
  })
}

function buildReportFooter(caseReference: string, reportDate: string) {
  return new Footer({
    children: [
      new Paragraph({
        tabStops: [
          {
            type: TabStopType.CENTER,
            position: TabStopPosition.MAX / 2,
          },
          {
            type: TabStopType.RIGHT,
            position: TabStopPosition.MAX,
          },
        ],
        children: [
          new TextRun({
            text: `Case: ${caseReference}`,
            font: FONT_COURIER,
            size: SIZE_FOOTER,
          }),
          new TextRun({
            children: [new Tab(), reportDate],
            font: FONT_COURIER,
            size: SIZE_FOOTER,
          }),
          new TextRun({
            children: [new Tab(), "GLADIC AI™ — Page ", PageNumber.CURRENT],
            font: FONT_COURIER,
            size: SIZE_FOOTER,
          }),
        ],
      }),
    ],
  })
}

export async function generateLegalReportDocx(
  content: LegalReportContent,
  referenceCode: string
): Promise<Buffer> {
  const cover = content.cover
  const reference = content.case_reference || referenceCode
  const reportDate = formatReportDate(content.generated_at)
  const children: Paragraph[] = []

  const topLogoSize = GLADIC_LOGO_DISPLAY.top
  const mascotLogoSize = GLADIC_LOGO_DISPLAY.mascot

  // First section - fixed one
  children.push(
    imageParagraph(readGladicLogo("top"), {
      width: topLogoSize.width,
      height: topLogoSize.height,
      center: true,
    }),
    heading1Paragraph("MY LEGAL REPORT™", { center: true, font: FONT_TIMES }),
    heading2Paragraph("Powered by GLADIC AI™ Legal Research & Credit Rights Intelligence Engine", { center: true, font: FONT_TIMES }),
    heading2Paragraph("Take Control of Your Credit. Know Your Rights. Fight Back with Facts.", { center: true, font: FONT_TIMES }),
    paragraph("For decades, consumers have been expected to accept what appears on their credit reports without fully understanding whether the information is accurate, verifiable, procedurally compliant, or lawfully reported. Critical financial decisions involving mortgages, vehicle financing, credit cards, business loans, insurance, employment screening, and commercial opportunities are often influenced by information maintained by credit reporting agencies and data furnishers.", { font: FONT_TIMES }),
    paragraph("The reality is simple: most consumers never receive a detailed explanation of how information is reported, why it is reported, whether it has been independently verified, or what rights exist when questions arise regarding accuracy, liability, ownership, contractual obligations, or reporting authority.", { font: FONT_TIMES }),
    paragraph("My Legal Report™ changes that.", { font: FONT_TIMES, bold: true }),
    paragraph("Powered by the GLADIC AI™ Legal Research & Credit Rights Intelligence Engine,", { font: FONT_TIMES, bold: true }),
    paragraph("Legal Report™ transforms raw credit-report data into actionable legal-rights intelligence using a structured legal-analysis methodology designed to identify issues, apply governing law, evaluate compliance, and generate educational directives that help consumers understand and protect their rights.", { font: FONT_TIMES }),
    paragraph("The GLADIC AI™ Advantage", { font: FONT_TIMES, size: 28 }),
    paragraph("Generated Legal Analysis, Data, Intelligence & Compliance™", {font: FONT_TIMES}),
    paragraph("GLADIC AI™ is the proprietary legal-intelligence framework that powers every My Legal Report™.", {font: FONT_TIMES}),
    paragraph("Unlike traditional credit monitoring services that simply display information, GLADIC AI™ evaluates:", {
      font: FONT_TIMES,
    }),
    ...bulletListParagraphs(GLADIC_EVALUATES_LIST, { font: FONT_TIMES }),
    paragraphWithTrailingRule(
      "The result is a comprehensive legal-rights analysis designed to help consumers understand what is reported, why it is reported, how it is supported, and what lawful remedies may be available.",
      { font: FONT_TIMES }
    ),
    paragraph("The GLADIC AI™ Methodology", { font: FONT_TIMES, size: 28 }),
    ...methodologySectionParagraphs(
      "I — Issues",
      "Identify potential reporting concerns including:",
      GLADIC_METHODOLOGY_ISSUES
    ),
    ...methodologySectionParagraphs(
      "R — Rules",
      "Apply governing authorities including:",
      GLADIC_METHODOLOGY_RULES
    ),
    ...methodologySectionParagraphs(
      "A — Application",
      "Analyze how those laws apply to:",
      GLADIC_METHODOLOGY_APPLICATION
    ),
    paragraph("C — Conclusion", { font: FONT_TIMES, bold: true }),
    paragraphWithTrailingRule(
      "Generate findings, observations, rights assessments, documentation requests, administrative remedies, and educational self-help directives designed to help consumers make informed decisions regarding their credit profile.",
      { font: FONT_TIMES }
    ),
    paragraph("More Than a Credit Report", { font: FONT_TIMES, size: 28 }),
    paragraph("A traditional credit report tells you what is reported.", { font: FONT_TIMES }),
    paragraph("My Legal Report™ helps you understand:", { font: FONT_TIMES }),
    ...bulletListParagraphs(MORE_THAN_CREDIT_REPORT_LIST, { font: FONT_TIMES }),
    paragraph("Every account is reviewed individually through a legal-rights lens.", {
      font: FONT_TIMES,
    }),
    paragraph("Every inquiry is evaluated.", { font: FONT_TIMES }),
    paragraph("Every liability classification is analyzed.", { font: FONT_TIMES }),
    paragraphWithTrailingRule(
      "Every reporting event is examined for procedural compliance.",
      { font: FONT_TIMES }
    ),
    paragraph("Restoring Balance to the Credit Reporting Process", {
      font: FONT_TIMES,
      size: 28,
    }),
    paragraph(
      "Credit reporting agencies play an important role in the American financial system. However, the information they report is largely supplied by creditors, lenders, debt buyers, collection agencies, and other furnishers of information.",
      { font: FONT_TIMES }
    ),
    paragraph(
      "Consumers frequently find themselves at a disadvantage because they often have limited visibility into:",
      { font: FONT_TIMES }
    ),
    ...bulletListParagraphs(RESTORING_BALANCE_VISIBILITY_LIST, { font: FONT_TIMES }),
    paragraph(
      "My Legal Report™ was created to help restore transparency by providing consumers with structured legal analysis, documentation review, and rights-preservation strategies designed to level the informational playing field.",
      { font: FONT_TIMES }
    ),
    paragraph("Our mission is not to attack the credit reporting system.", {
      font: FONT_TIMES,
    }),
    paragraphWithTrailingRule(
      "Our mission is to ensure consumers understand their rights within it.",
      { font: FONT_TIMES }
    ),
    paragraph("Fight Back With Facts", { font: FONT_TIMES, size: 28 }),
    paragraph("When questions arise regarding your credit profile, facts matter.", {
      font: FONT_TIMES,
    }),
    paragraph("Documentation matters.", { font: FONT_TIMES }),
    paragraph("Procedures matter.", { font: FONT_TIMES }),
    paragraph("Rights matter.", { font: FONT_TIMES }),
    paragraph(
      "My Legal Report™ helps consumers move beyond assumptions and focus on evidence, compliance, and lawful remedies.",
      { font: FONT_TIMES }
    ),
    paragraph(
      "Rather than relying solely on a credit score, consumers gain access to a structured legal-rights review designed to identify opportunities for clarification, correction, verification, and accountability.",
      { font: FONT_TIMES }
    ),
    paragraph("Because informed consumers make better financial decisions.", {
      font: FONT_TIMES,
    }),
    paragraphWithTrailingRule(
      "And consumers who understand their rights are better equipped to protect them.",
      { font: FONT_TIMES }
    ),
    paragraph("What Every My Legal Report™ Includes", { font: FONT_TIMES, size: 28 }),
    ...MY_LEGAL_REPORT_INCLUDES.map((item, index) =>
      index === MY_LEGAL_REPORT_INCLUDES.length - 1
        ? paragraphWithTrailingRule(`📌 ${item}`, { font: FONT_TIMES })
        : paragraph(`📌 ${item}`, { font: FONT_TIMES })
    ),
    paragraph("GLADIC AI™ Mission Statement", { font: FONT_TIMES, size: 28 }),
    paragraph(
      "GLADIC AI™ (Generated Legal Analysis, Data, Intelligence & Compliance) is a legal-intelligence engine designed to transform credit-report data into actionable consumer-rights intelligence.",
      { font: FONT_TIMES }
    ),
    paragraphWithTrailingRule(
      "By combining legal research, data analysis, regulatory guidance, compliance review, and rights-preservation methodologies, GLADIC AI™ empowers consumers with knowledge, supports informed decision-making, and helps individuals understand, protect, and exercise their credit rights.",
      { font: FONT_TIMES }
    ),
    heading1Paragraph("My Legal Report™", { center: true, font: FONT_TIMES }),
    paragraph("Credit Rights • Civil Rights • Contract Execution", {
      center: true,
      font: FONT_TIMES,
    }),
    paragraph("Truth. Rights. Remedy. Results.", {
      center: true,
      font: FONT_TIMES,
      bold: true,
    }),
    paragraph("Know Your Rights.", { center: true, font: FONT_TIMES }),
    paragraph("Protect Your Future.", { center: true, font: FONT_TIMES }),
    paragraph("Control Your Credit.", { center: true, font: FONT_TIMES }),
    paragraph("[ GENERATE MY LEGAL REPORT™ ]", {
      center: true,
      font: FONT_TIMES,
      bold: true,
    }),
    pageBreakParagraph(),
  )

  children.push(
    heading1Paragraph(cover.title, { center: true, font: FONT_TIMES }),
    paragraph(cover.subtitle, { center: true, font: FONT_TIMES }),
    paragraph(""),
    paragraph(`Prepared By: ${cover.prepared_by}`),
    paragraph(`Report Classification: ${cover.classification}`),
    paragraph(`Client Capacity: ${cover.client_capacity}`),
    paragraph(`Scope: ${cover.scope}`),
    paragraph(`Delivery Format: ${cover.delivery_format}`),
    paragraph(`Record Type: ${cover.record_type}`),
    paragraph(""),
    paragraph(`Client: ${content.client_name}`),
    paragraph(`State: ${content.case_state}`),
    paragraph(`Case: ${reference}`),
    paragraph(`Generated: ${reportDate}`),
    paragraph(""),
    heading2Paragraph("NOTICE OF LIMITATION & NON-REPRESENTATION"),
    ...paragraphsFromBlock(content.notice_of_limitation, { italics: true }),
    pageBreakParagraph(),
    heading2Paragraph("TABLE OF CONTENTS")
  )

  content.sections.forEach((section) => {
    children.push(paragraph(`${section.number}. ${section.title}`))
  })

  children.push(pageBreakParagraph())

  content.sections.forEach((section, index) => {
    children.push(sectionTitleParagraph(section.number, section.title))
    children.push(...paragraphsFromBlock(section.body))
  })

  children.push(pageBreakParagraph())

  // Last section - fixed one
  children.push(
    imageParagraph(readGladicLogo("mascot"), {
      width: mascotLogoSize.width,
      height: mascotLogoSize.height,
      center: true,
    }),
    paragraph("GLADIC AI™ TERMS OF USE & DISCLOSURE", { font: FONT_TIMES, size: SIZE_FOOTER, bold: true, center: true }),
    paragraph("GLADIC AI™ (Generated Legal Analysis, Data, Intelligence & Compliance™) and My Legal Report™ are educational, informational, research, and self-help tools designed to assist consumers in understanding credit reporting practices, consumer rights, credit laws, civil rights protections, regulatory guidance, and available procedural remedies. The information generated by GLADIC AI™ is intended to help consumers become more informed regarding their credit profiles and available rights under applicable federal and state laws.", { font: FONT_TIMES, size: SIZE_FOOTER }),
    paragraph("GLADIC AI™ is not a law firm, does not provide legal advice, and does not provide legal representation. No attorney-client relationship, fiduciary relationship, agency relationship, or professional representation agreement is created through the use of GLADIC AI™, My Legal Report™, or any related services. All content generated by the system is provided solely for educational and informational purposes.", { font: FONT_TIMES, size: SIZE_FOOTER }),
    paragraph("All actions discussed herein are performed solely by the consumer, acting in their own name and under their own lawful self-representation authority. Any decision to dispute information, communicate with a creditor, furnish information to a credit reporting agency, file a regulatory complaint, seek legal counsel, initiate litigation, negotiate a settlement, or pursue any other course of action remains solely the responsibility of the user.", { font: FONT_TIMES, size: SIZE_FOOTER }),
    paragraph("GLADIC AI™ analyzes information supplied by the user and may reference statutes, regulations, administrative guidance, public records, case law, regulatory materials, and other legal authorities. While every effort is made to provide useful and relevant information, GLADIC AI™ does not guarantee the accuracy, completeness, current validity, applicability, enforceability, or legal effect of any authority cited. Laws change, regulations evolve, and judicial interpretations vary by jurisdiction and circumstance. Users are solely responsible for independently verifying any information before relying upon it.", { font: FONT_TIMES, size: SIZE_FOOTER }),
    paragraph("My Legal Report™ does not determine liability, wrongdoing, discrimination, legal violations, entitlement to damages, or legal success. Any findings, observations, analyses, recommendations, or directives generated by GLADIC AI™ represent educational interpretations and compliance-focused observations only. They are not judicial findings, legal opinions, or guarantees of any outcome.", { font: FONT_TIMES, size: SIZE_FOOTER }),
    paragraph("Users acknowledge that they assume all risks associated with the use of GLADIC AI™, My Legal Report™, and any related materials. This includes, without limitation, risks associated with disputes, investigations, administrative proceedings, regulatory complaints, negotiations, settlements, litigation, credit decisions, lending decisions, business decisions, and financial decisions. No guarantee is made regarding credit score improvements, account deletions, tradeline corrections, inquiry removals, regulatory actions, settlements, financing approvals, litigation outcomes, or any other desired result.", { font: FONT_TIMES, size: SIZE_FOOTER }),
    paragraph("GLADIC AI™, My Legal Report™, their owners, operators, affiliates, licensors, employees, contractors, agents, successors, and assigns shall not be liable for any direct, indirect, incidental, consequential, special, exemplary, punitive, financial, business, credit-related, regulatory, or litigation-related damages arising from or relating to the use of the Services. Use of the Services is entirely voluntary and at the user's sole risk.", { font: FONT_TIMES, size: SIZE_FOOTER }),
    paragraph("Credit reporting agencies, furnishers, lenders, creditors, collection agencies, government agencies, regulators, courts, and third parties operate independently of GLADIC AI™. GLADIC AI™ does not control their decisions, actions, policies, procedures, investigations, reporting practices, or outcomes and assumes no responsibility for any action taken or not taken by such entities.", { font: FONT_TIMES, size: SIZE_FOOTER }),
    paragraph("By using GLADIC AI™, My Legal Report™, or any related service, the user acknowledges and agrees that the Services are educational and informational in nature, that no legal advice or legal representation is being provided, that all actions are undertaken solely by the user, that no results are guaranteed, and that the user assumes full responsibility for any use of the information provided.", { font: FONT_TIMES, size: SIZE_FOOTER }),
    pageBreakParagraph(),
    paragraph("GLADIC AI™", { font: FONT_TIMES, size: SIZE_FOOTER, bold: true }),
    paragraph("Generated Legal Analysis, Data, Intelligence & Compliance™", { font: FONT_TIMES, size: SIZE_FOOTER, bold: true }),
    paragraph(""),
    paragraph("My Legal Report™", { font: FONT_TIMES, size: SIZE_FOOTER, bold: true }),
    paragraph("Know Your Rights. Protect Your Future. Control Your Credit.   ", { font: FONT_TIMES, size: SIZE_FOOTER, bold: true }),
    paragraph(""),
    paragraph(""),
    paragraph("© GLADIC AI, LLC. 2026", { font: FONT_TIMES, size: SIZE_FOOTER, bold: true, center: true }),
  );

  const doc = new Document({
    numbering: {
      config: [
        {
          reference: BULLET_LIST_REF,
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: "\u2022",
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: { left: 720, hanging: 360 },
                },
              },
            },
          ],
        },
      ],
    },
    styles: {
      default: {
        document: {
          run: {
            font: FONT_COURIER,
            size: SIZE_BODY,
          },
        },
      },
      paragraphStyles: [
        {
          id: "Heading1",
          name: "Heading 1",
          basedOn: "Normal",
          next: "Normal",
          run: {
            font: FONT_TIMES,
            size: SIZE_HEADING1,
            bold: true,
          },
        },
        {
          id: "Heading2",
          name: "Heading 2",
          basedOn: "Normal",
          next: "Normal",
          run: {
            font: FONT_COURIER,
            size: SIZE_HEADING2,
            bold: true,
            color: HEADING_COLOR,
          },
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertMarginInches(1),
              right: convertMarginInches(1),
              bottom: convertMarginInches(1),
              left: convertMarginInches(1),
              footer: 720,
            },
          },
        },
        footers: {
          default: buildReportFooter(reference, reportDate),
        },
        children,
      },
    ],
  })

  return Buffer.from(await Packer.toBuffer(doc))
}

function convertMarginInches(inches: number) {
  return Math.round(inches * 1440)
}
