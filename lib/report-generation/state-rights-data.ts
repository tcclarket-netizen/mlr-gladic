/** State-specific consumer-rights reference data for Section 3A (educational templates). */

export type StateStatuteEntry = {
  name: string
  citation: string
  summary: string
  remedies: string
  authority: string
}

export type StateAuthorityRow = {
  type: "Statute/Act" | "Regulation" | "Policy" | "Ordinance"
  citation: string
  covers: string
  remedies: string
  recordBuilding: string
}

export type StateCaseLawEntry = {
  name: string
  court: string
  year: string
  citation: string
  holding: string
  practicalUse: string
  topic: string
}

export type StateRightsProfile = {
  stateName: string
  stateAbbr: string
  consumerProtection: {
    name: string
    citation: string
    scope: string
    remedies: string
    privateAction: string
    agEnforcement: string
  }
  debtCollection: {
    summary: string
    prohibited: string
    protections: string
    validation: string
    remedies: string
    enforcement: string
  }
  creditReporting: {
    freeze: string
    disclosure: string
    correction: string
    fraudAlert: string
    access: string
    remedies: string
  }
  identityTheft: {
    statutes: string
    fraud: string
    restoration: string
    reporting: string
    correction: string
  }
  privacy: {
    breach: string
    privacy: string
    security: string
    remedies: string
  }
  attorneyGeneral: {
    office: string
    complaint: string
    powers: string
    pathways: string
    oversight: string
  }
  specificStatutes: StateStatuteEntry[]
  authorityRows: StateAuthorityRow[]
  caseLaw: StateCaseLawEntry[]
  ordinancesNote: string
  regulatorNote: string
}

const STATE_TO_ABBR: Record<string, string> = {
  Alabama: "AL",
  Alaska: "AK",
  Arizona: "AZ",
  Arkansas: "AR",
  California: "CA",
  Colorado: "CO",
  Connecticut: "CT",
  Delaware: "DE",
  Florida: "FL",
  Georgia: "GA",
  Hawaii: "HI",
  Idaho: "ID",
  Illinois: "IL",
  Indiana: "IN",
  Iowa: "IA",
  Kansas: "KS",
  Kentucky: "KY",
  Louisiana: "LA",
  Maine: "ME",
  Maryland: "MD",
  Massachusetts: "MA",
  Michigan: "MI",
  Minnesota: "MN",
  Mississippi: "MS",
  Missouri: "MO",
  Montana: "MT",
  Nebraska: "NE",
  Nevada: "NV",
  "New Hampshire": "NH",
  "New Jersey": "NJ",
  "New Mexico": "NM",
  "New York": "NY",
  "North Carolina": "NC",
  "North Dakota": "ND",
  Ohio: "OH",
  Oklahoma: "OK",
  Oregon: "OR",
  Pennsylvania: "PA",
  "Rhode Island": "RI",
  "South Carolina": "SC",
  "South Dakota": "SD",
  Tennessee: "TN",
  Texas: "TX",
  Utah: "UT",
  Vermont: "VT",
  Virginia: "VA",
  Washington: "WA",
  "West Virginia": "WV",
  Wisconsin: "WI",
  Wyoming: "WY",
}

const ABBR_TO_NAME = Object.fromEntries(
  Object.entries(STATE_TO_ABBR).map(([name, abbr]) => [abbr, name])
) as Record<string, string>

export function normalizeConsumerState(input: string): { stateName: string; stateAbbr: string } {
  const trimmed = input.trim()
  if (!trimmed) {
    return { stateName: "Unknown", stateAbbr: "—" }
  }

  if (trimmed.length === 2) {
    const abbr = trimmed.toUpperCase()
    return {
      stateAbbr: abbr,
      stateName: ABBR_TO_NAME[abbr] ?? trimmed,
    }
  }

  const abbr = STATE_TO_ABBR[trimmed] ?? STATE_TO_ABBR[trimmed.replace(/\s+/g, " ")]
  return {
    stateName: trimmed,
    stateAbbr: abbr ?? trimmed.slice(0, 2).toUpperCase(),
  }
}

function genericProfile(stateName: string, stateAbbr: string): StateRightsProfile {
  return {
    stateName,
    stateAbbr,
    consumerProtection: {
      name: `${stateName} Consumer Protection Act (general reference)`,
      citation: `Applicable ${stateName} unfair/deceptive acts and practices (UDAP) statutes`,
      scope:
        "May apply to unfair, deceptive, or unconscionable acts in consumer transactions, including certain credit- and collection-related conduct when state law is not preempted by federal law.",
      remedies:
        "Educational remedies may include injunctive relief, actual damages, and statutory or enhanced remedies where expressly authorized by state statute and proven in a proper forum.",
      privateAction:
        "Many states authorize private actions by consumers; availability, standing, and remedies depend on the specific statute and facts.",
      agEnforcement:
        `The ${stateName} Attorney General may investigate and enforce applicable consumer-protection laws.`,
    },
    debtCollection: {
      summary: `${stateName} may provide supplemental debt-collection standards in addition to the federal Fair Debt Collection Practices Act (FDCPA), where applicable.`,
      prohibited:
        "Educational review: identify whether state law restricts harassment, false representations, unauthorized fees, or improper contact practices beyond federal baseline protections.",
      protections:
        "Consumers may have rights to dispute debts, request validation, and limit certain contact practices when state law applies to the collector and transaction.",
      validation:
        "Where applicable, consumers may request verification of the debt and identity of the creditor or collector using written, dated correspondence.",
      remedies:
        "Remedies may include administrative complaints, civil remedies, or injunctive relief as authorized by state statute; outcomes are not guaranteed.",
      enforcement:
        `State regulators, the ${stateName} Attorney General, and federal agencies (CFPB/FTC) may share enforcement roles depending on the entity and conduct.`,
    },
    creditReporting: {
      freeze:
        "Consumers generally may request security freezes under federal law; state law may provide additional freeze, lift, or fee-related rules.",
      disclosure:
        "Consumers may obtain disclosures of file information under the FCRA and applicable state consumer reporting laws.",
      correction:
        "Consumers may dispute inaccurate or incomplete information and request reinvestigation under federal procedures.",
      fraudAlert:
        "Initial and extended fraud alerts may be available under federal law; state law may supplement identity-fraud protections.",
      access:
        "Consumers may retain copies of reports, dispute responses, and correspondence for administrative record-building.",
      remedies:
        "State-specific remedies for reporting violations may exist where conduct is not preempted and a cognizable state claim is available.",
    },
    identityTheft: {
      statutes: `${stateName} may maintain identity-theft, impersonation, or financial fraud statutes complementing federal identity-theft remedies.`,
      fraud:
        "Consumers may report suspected fraud to law enforcement, the FTC, and state consumer protection authorities.",
      restoration:
        "Restoration may involve fraud alerts, freezes, creditor notifications, and documented dispute trails on credit files.",
      reporting:
        "Maintain police reports, FTC IdentityTheft.gov reports, and agency confirmation numbers where applicable.",
      correction:
        "Identity-theft blocking and suppression procedures may be available under federal law when proper documentation is submitted.",
    },
    privacy: {
      breach:
        `${stateName} may require notice to consumers following certain data breaches involving personal information.`,
      privacy:
        "State privacy laws may regulate collection, use, and disclosure of personal data by certain businesses.",
      security:
        "Reasonable security requirements may apply to holders of sensitive consumer data under state law.",
      remedies:
        "Consumers may file regulatory complaints; private remedies depend on statute, preemption, and proof.",
    },
    attorneyGeneral: {
      office: `${stateName} Attorney General`,
      complaint: `Consumer complaint division or online portal maintained by the ${stateName} Attorney General`,
      powers:
        "Investigation, civil enforcement, injunctive relief, and coordination with other regulators for pattern practices.",
      pathways:
        "Written complaints with exhibits (reports, letters, proof of mailing, agency responses) support administrative record-building.",
      oversight:
        "Oversight may extend to debt collection, credit reporting, and unfair trade practices within state jurisdiction.",
    },
    specificStatutes: [
      {
        name: `${stateName} Unfair/Deceptive Trade Practices (UDAP) framework`,
        citation: "Verification Required — official state code title/chapter",
        summary: "General consumer fairness standards for commercial conduct.",
        remedies: "Varies by statute; consult current code and agency guidance.",
        authority: `${stateName} Attorney General`,
      },
    ],
    authorityRows: buildAuthorityRowsFromProfile({
      stateName,
      stateAbbr,
      cpName: `${stateName} consumer-protection act (UDAP framework)`,
      cpCitation: "Verification Required — official state code",
      dcCitation: "Verification Required — state debt collection code (if any)",
      crCitation: "Verification Required — state mini-FCRA or reporting act (if any)",
      freezeCitation: "15 U.S.C. § 1681c-1 et seq. (federal); state supplement Verification Required",
      privacyCitation: "Verification Required — state breach/privacy act",
      agOffice: `${stateName} Attorney General`,
    }),
    caseLaw: [],
    ordinancesNote:
      "Local ordinances are not typically the controlling authority for credit reporting disputes; none identified as directly applicable for this state without municipal verification.",
    regulatorNote: `Consult ${stateName} financial regulator publications (if applicable) for debt collection and consumer finance oversight.`,
  }
}

function buildAuthorityRowsFromProfile(input: {
  stateName: string
  stateAbbr: string
  cpName: string
  cpCitation: string
  dcCitation: string
  crCitation: string
  freezeCitation: string
  privacyCitation: string
  agOffice: string
}): StateAuthorityRow[] {
  return [
    {
      type: "Statute/Act",
      citation: input.cpCitation,
      covers: `${input.cpName} — deceptive/unfair consumer practices`,
      remedies: "Actual/statutory damages, injunction, AG civil penalties (where authorized)",
      recordBuilding: "AG complaint exhibits; demand letters documenting commercial conduct",
    },
    {
      type: "Statute/Act",
      citation: input.dcCitation,
      covers: "State debt-collection conduct standards (if applicable)",
      remedies: "Statutory damages, fees, injunctive relief (Verification Required per statute)",
      recordBuilding: "Collection letters, call logs, validation requests, regulator complaints",
    },
    {
      type: "Statute/Act",
      citation: input.crCitation,
      covers: "State consumer reporting / file rights (if enacted)",
      remedies: "Verification Required",
      recordBuilding: "State reporting disputes where not preempted by FCRA",
    },
    {
      type: "Statute/Act",
      citation: input.freezeCitation,
      covers: "Security freeze / fraud alert / identity restoration",
      remedies: "Administrative correction pathways; federal blocking procedures",
      recordBuilding: "Freeze confirmations, fraud alerts, police/FTC reports",
    },
    {
      type: "Statute/Act",
      citation: input.privacyCitation,
      covers: "Data breach notice and privacy/security duties",
      remedies: "Regulatory enforcement; private rights vary",
      recordBuilding: "Breach notices, privacy complaints to AG/regulators",
    },
    {
      type: "Policy",
      citation: `${input.agOffice} — consumer complaint intake (official website)`,
      covers: "Administrative enforcement and consumer complaint processing",
      remedies: "Investigation, injunctive relief, civil penalties in AG actions",
      recordBuilding: "Complaint confirmation numbers and agency correspondence",
    },
    {
      type: "Ordinance",
      citation: "Verification Required",
      covers: "Municipal consumer affairs ordinances (if any)",
      remedies: "Verification Required",
      recordBuilding: "Generally secondary to state/federal frameworks for CRA disputes",
    },
  ]
}

const FL_CASE_LAW: StateCaseLawEntry[] = [
  {
    topic: "UDAP / consumer deception",
    name: "Rollins v. Butland",
    court: "Fla. 2006",
    year: "2006",
    citation: "951 So. 2d 860 (Fla. 2006)",
    holding:
      "Addresses FDUTPA reliance and injury in deceptive-practice analysis (educational reference).",
    practicalUse: "Frame consumer reliance and injury documentation in UDAP-oriented complaints.",
  },
  {
    topic: "UDAP / consumer deception",
    name: "Macias v. HBC of Florida, Inc.",
    court: "Fla. 2002",
    year: "2002",
    citation: "809 So. 2d 91 (Fla. 2002)",
    holding: "Discusses deceptive act or practice standards under Florida consumer law themes.",
    practicalUse: "Support procedural framing of deceptive conduct without liability conclusions.",
  },
  {
    topic: "Debt collection",
    name: "Cacace v. Lucas, Ex Rel. Staats",
    court: "Fla. Dist. Ct. App. 2004",
    year: "2004",
    citation: "810 So. 2d 315 (Fla. 4th DCA 2004)",
    holding: "Addresses Florida collection-practice themes and statutory interpretation.",
    practicalUse: "Document collection communications and compare to FCCPA prohibitions.",
  },
]

const CA_CASE_LAW: StateCaseLawEntry[] = [
  {
    topic: "UDAP / unfair competition",
    name: "Cel-Tech Communications, Inc. v. Los Angeles Cellular Telephone Co.",
    court: "Cal. 1999",
    year: "1999",
    citation: "20 Cal. 4th 163 (1999)",
    holding: "Explains unfairness prong under California Unfair Competition Law.",
    practicalUse: "Educational framing for unfair business practices in administrative complaints.",
  },
  {
    topic: "UDAP / unfair competition",
    name: "Korea Supply Co. v. Lockheed Martin Corp.",
    court: "Cal. 2004",
    year: "2004",
    citation: "29 Cal. 4th 1134 (2004)",
    holding: "Discusses unlawful and unfair competition standards.",
    practicalUse: "Support record-building on business-practice unfairness (non-FCRA).",
  },
  {
    topic: "Debt collection",
    name: "Davidson v. Seterus, Inc.",
    court: "Cal. Ct. App. 2019",
    year: "2019",
    citation: "43 Cal. App. 5th 388 (2019)",
    holding: "Rosenthal Act / collection communication themes (educational).",
    practicalUse: "Compare collector letters and calls to Rosenthal/FCCPA-style standards.",
  },
]

const PA_CASE_LAW: StateCaseLawEntry[] = [
  {
    topic: "UDAP",
    name: "Farnsworth v. Draper",
    court: "Pa. Super. 1991",
    year: "1991",
    citation: "588 A.2d 578 (Pa. Super. 1991)",
    holding: "Addresses UTPCPL private-action and deceptive-practice elements.",
    practicalUse: "Document transaction facts and reliance in UTPCPL complaint drafts.",
  },
  {
    topic: "UDAP",
    name: "Yocca v. Pittsburgh Steelers Sports, Inc.",
    court: "Pa. 2005",
    year: "2005",
    citation: "578 Pa. 479, 854 A.2d 425 (2004)",
    holding: "Supreme Court discussion of UTPCPL scope and remedies.",
    practicalUse: "Support procedural exhaustion and damages framing in state forums.",
  },
]

const TX_CASE_LAW: StateCaseLawEntry[] = [
  {
    topic: "UDAP / DTPA",
    name: "Am. States Water Servs. Co. v. Texas State Bd. of Plumbing Examiners",
    court: "Tex. App. 2012",
    year: "2012",
    citation: "372 S.W.3d 480 (Tex. App.—Austin 2012)",
    holding: "Discusses DTPA standards and remedies in consumer-protection context.",
    practicalUse: "Frame DTPA notice and damages documentation.",
  },
  {
    topic: "UDAP / DTPA",
    name: "Buck v. Palmer",
    court: "Tex. App. 2000",
    year: "2000",
    citation: "42 S.W.3d 90 (Tex. App.—San Antonio 2000)",
    holding: "Addresses DTPA reliance and injury themes.",
    practicalUse: "Maintain transaction records and reliance chronology.",
  },
]

const NY_CASE_LAW: StateCaseLawEntry[] = [
  {
    topic: "UDAP / GBL 349",
    name: "Oswego Laborers' Local 214 Pension Fund v. Marine Midland Bank, N.A.",
    court: "N.Y. 1996",
    year: "1996",
    citation: "85 N.Y.2d 20, 623 N.Y.S.2d 529 (1996)",
    holding: "Discusses deceptive act standards under General Business Law themes.",
    practicalUse: "Support deceptive-practice framing in AG complaints.",
  },
  {
    topic: "Privacy / data",
    name: "Golde v. Goldman Sachs & Co.",
    court: "N.Y. App. Div. 2021",
    year: "2021",
    citation: "187 A.D.3d 562 (1st Dep't 2021)",
    holding: "Data-privacy and consumer-information handling themes (educational).",
    practicalUse: "Document data-handling complaints where privacy statutes apply.",
  },
]

const STATE_OVERRIDES: Partial<Record<string, Partial<StateRightsProfile>>> = {
  FL: {
    consumerProtection: {
      name: "Florida Deceptive and Unfair Trade Practices Act (FDUTPA)",
      citation: "Fla. Stat. §§ 501.201–501.213",
      scope:
        "Unfair methods of competition, unconscionable practices, deception, and unfairness in trade or commerce affecting consumers.",
      remedies:
        "Actual damages, attorney's fees in certain cases, civil penalties in AG actions, and injunctive relief as authorized by law.",
      privateAction: "Private actions may be available; consult current statute and Florida case law.",
      agEnforcement: "Florida Attorney General — Division of Consumer Protection.",
    },
    debtCollection: {
      summary:
        "Florida Consumer Collection Practices Act (FCCPA) supplements federal FDCPA for in-state collectors and certain conduct.",
      prohibited: "Harassment, misrepresentation, and unfair collection practices as defined by Florida law.",
      protections: "Validation and dispute rights may apply in parallel with federal procedures.",
      validation: "Written validation requests should be dated and sent with proof of mailing.",
      remedies: "Statutory damages and fees may apply where authorized; no outcome is guaranteed.",
      enforcement: "Florida AG, DBPR where applicable, and federal CFPB/FTC.",
    },
    attorneyGeneral: {
      office: "Florida Attorney General",
      complaint: "MyFloridaLegal.com — consumer protection complaint intake",
      powers: "Civil enforcement under FDUTPA and related statutes.",
      pathways: "Online complaint, mail, and supporting documentation uploads where available.",
      oversight: "Consumer protection, debt collection, and unfair trade practices.",
    },
    specificStatutes: [
      {
        name: "Florida Deceptive and Unfair Trade Practices Act (FDUTPA)",
        citation: "Fla. Stat. §§ 501.201–501.213",
        summary: "Primary Florida UDAP framework.",
        remedies: "Actual damages; fees in certain private actions; AG civil penalties.",
        authority: "Florida Attorney General",
      },
      {
        name: "Florida Consumer Collection Practices Act (FCCPA)",
        citation: "Fla. Stat. §§ 559.55–559.785",
        summary: "State debt-collection standards.",
        remedies: "Statutory and actual damages where applicable.",
        authority: "Florida AG / courts",
      },
      {
        name: "Florida Security Freeze Law",
        citation: "Fla. Stat. § 501.005",
        summary: "Security freeze rights for consumer reports.",
        remedies: "Administrative and statutory remedies as provided.",
        authority: "Florida AG / CRAs under federal coordination",
      },
      {
        name: "Florida Information Protection Act",
        citation: "Fla. Stat. §§ 501.171–501.173",
        summary: "Data breach notification and safeguards.",
        remedies: "AG enforcement; private remedies per statute.",
        authority: "Florida Attorney General",
      },
    ],
    authorityRows: [
      {
        type: "Statute/Act",
        citation: "Fla. Stat. §§ 501.201–501.213",
        covers: "FDUTPA — deceptive/unfair/unconscionable practices",
        remedies: "Actual damages; fees; AG civil penalties",
        recordBuilding: "AG complaint + transaction proof + reliance chronology",
      },
      {
        type: "Statute/Act",
        citation: "Fla. Stat. §§ 559.55–559.785",
        covers: "FCCPA — debt collection conduct",
        remedies: "Statutory/actual damages; fees where authorized",
        recordBuilding: "Validation letters; call logs; collector correspondence",
      },
      {
        type: "Statute/Act",
        citation: "Fla. Stat. § 501.005",
        covers: "Security freeze on consumer reports",
        remedies: "Administrative freeze remedies",
        recordBuilding: "Freeze confirmation letters",
      },
      {
        type: "Statute/Act",
        citation: "Fla. Stat. §§ 501.171–501.173",
        covers: "Breach notification and data safeguards",
        remedies: "AG enforcement",
        recordBuilding: "Breach notices; regulator complaints",
      },
      {
        type: "Policy",
        citation: "Florida AG — Division of Consumer Protection (MyFloridaLegal.com)",
        covers: "Consumer complaint intake and civil enforcement",
        remedies: "Investigation; injunction; penalties",
        recordBuilding: "Complaint ID + agency responses",
      },
      {
        type: "Ordinance",
        citation: "Verification Required",
        covers: "Municipal consumer affairs codes",
        remedies: "Verification Required",
        recordBuilding: "Secondary to state/federal frameworks",
      },
    ],
    caseLaw: FL_CASE_LAW,
    ordinancesNote:
      "Local ordinances are not typically the controlling authority for credit reporting disputes; none identified as directly applicable for Florida without municipal verification.",
    regulatorNote:
      "Florida Office of Financial Regulation — consumer finance oversight (where applicable).",
  },
  CA: {
    consumerProtection: {
      name: "California Unfair Competition Law (UCL)",
      citation: "Cal. Bus. & Prof. Code §§ 17200–17209",
      scope: "Unlawful, unfair, or fraudulent business acts or practices.",
      remedies: "Injunctive relief, restitution, and civil penalties in AG actions.",
      privateAction: "Representative actions possible in certain circumstances; consult counsel.",
      agEnforcement: "California Attorney General and local prosecutors (limited).",
    },
    debtCollection: {
      summary:
        "Rosenthal Fair Debt Collection Practices Act (Rosenthal FDCPA) extends federal FDCPA standards to original creditors in California.",
      prohibited: "Harassment, false statements, and unfair practices as defined.",
      protections: "Enhanced alignment with federal validation and dispute concepts.",
      validation: "Use written, dated validation and dispute letters; retain proof of mailing.",
      remedies: "State and federal remedies may overlap; preemption analysis may be required.",
      enforcement: "California AG, DFPI, CFPB, and FTC.",
    },
    specificStatutes: [
      {
        name: "California Unfair Competition Law (UCL)",
        citation: "Cal. Bus. & Prof. Code §§ 17200–17209",
        summary: "Broad unfair competition authority.",
        remedies: "Restitution, injunction, penalties (AG).",
        authority: "California Attorney General",
      },
      {
        name: "California Consumer Credit Reporting Agencies Act",
        citation: "Cal. Civ. Code § 1785.1 et seq.",
        summary: "State credit-reporting disclosures and duties.",
        remedies: "Statutory damages and injunctive relief where applicable.",
        authority: "California AG / courts",
      },
      {
        name: "California Consumer Privacy Act (CCPA), as amended (CPRA)",
        citation: "Cal. Civ. Code § 1798.100 et seq.",
        summary: "Consumer privacy rights for covered businesses.",
        remedies: "Private action for data breaches (limited), regulatory enforcement.",
        authority: "California Privacy Protection Agency / AG",
      },
      {
        name: "Rosenthal Fair Debt Collection Practices Act",
        citation: "Cal. Civ. Code § 1788 et seq.",
        summary: "State debt collection standards including original creditors.",
        remedies: "Statutory damages; injunctive relief where authorized.",
        authority: "California AG / DFPI",
      },
    ],
    authorityRows: buildAuthorityRowsFromProfile({
      stateName: "California",
      stateAbbr: "CA",
      cpName: "Unfair Competition Law (UCL)",
      cpCitation: "Cal. Bus. & Prof. Code §§ 17200–17209",
      dcCitation: "Cal. Civ. Code § 1788 et seq. (Rosenthal FDCPA)",
      crCitation: "Cal. Civ. Code § 1785.1 et seq.",
      freezeCitation: "Cal. Civ. Code § 1785.11; 15 U.S.C. § 1681c-1 (federal)",
      privacyCitation: "Cal. Civ. Code §§ 1798.100–1798.199",
      agOffice: "California Attorney General",
    }),
    caseLaw: CA_CASE_LAW,
    ordinancesNote:
      "Local ordinances are not typically the controlling authority for credit reporting disputes; none identified as directly applicable for California without municipal verification.",
    regulatorNote: "California Department of Financial Protection and Innovation (DFPI).",
  },
  PA: {
    consumerProtection: {
      name: "Pennsylvania Unfair Trade Practices and Consumer Protection Law (UTPCPL)",
      citation: "73 P.S. §§ 201-1–201-9.3",
      scope: "Unfair or deceptive acts in consumer transactions.",
      remedies: "Treble damages in certain private actions, attorney's fees, injunctive relief.",
      privateAction: "Private right of action with notice requirements in some cases.",
      agEnforcement: "Pennsylvania Office of Attorney General — Bureau of Consumer Protection.",
    },
    specificStatutes: [
      {
        name: "Pennsylvania UTPCPL",
        citation: "73 P.S. §§ 201-1–201-9.3",
        summary: "Primary Pennsylvania consumer-protection statute.",
        remedies: "Treble damages (where authorized), fees, injunction.",
        authority: "Pennsylvania Attorney General",
      },
      {
        name: "Pennsylvania Credit Reporting Privacy Act",
        citation: "73 P.S. § 3801 et seq.",
        summary: "State reporting privacy and security themes.",
        remedies: "As provided by statute.",
        authority: "Pennsylvania AG",
      },
    ],
    authorityRows: buildAuthorityRowsFromProfile({
      stateName: "Pennsylvania",
      stateAbbr: "PA",
      cpName: "UTPCPL",
      cpCitation: "73 P.S. §§ 201-1–201-9.3",
      dcCitation: "Verification Required — Pennsylvania Fair Credit Extension Uniformity Act themes",
      crCitation: "73 P.S. § 3801 et seq.",
      freezeCitation: "73 P.S. § 3801 et seq.; 15 U.S.C. § 1681c-1 (federal)",
      privacyCitation: "73 P.S. § 2301 et seq. (Breach of Personal Information Notification Act)",
      agOffice: "Pennsylvania Office of Attorney General",
    }),
    caseLaw: PA_CASE_LAW,
    ordinancesNote:
      "Local ordinances are not typically the controlling authority for credit reporting disputes; none identified as directly applicable for Pennsylvania without municipal verification.",
    regulatorNote: "Pennsylvania Department of Banking and Securities (where applicable).",
  },
  TX: {
    consumerProtection: {
      name: "Texas Deceptive Trade Practices Act (DTPA)",
      citation: "Tex. Bus. & Com. Code §§ 17.41–17.63",
      scope: "False, misleading, or deceptive acts in trade or commerce.",
      remedies: "Economic and mental-anguish damages, multiples in certain cases, attorney's fees.",
      privateAction: "Broad private enforcement with notice and cure provisions in some cases.",
      agEnforcement: "Texas Attorney General — Consumer Protection Division.",
    },
    specificStatutes: [
      {
        name: "Texas Deceptive Trade Practices Act (DTPA)",
        citation: "Tex. Bus. & Com. Code §§ 17.41–17.63",
        summary: "Core Texas consumer-protection framework.",
        remedies: "Damages multipliers and fees where authorized.",
        authority: "Texas Attorney General",
      },
      {
        name: "Texas Finance Code — Credit Reporting",
        citation: "Tex. Fin. Code Ch. 20 (as applicable)",
        summary: "State themes on reporting and identity theft.",
        remedies: "Per current Texas code.",
        authority: "Texas AG / regulators",
      },
    ],
    authorityRows: buildAuthorityRowsFromProfile({
      stateName: "Texas",
      stateAbbr: "TX",
      cpName: "DTPA",
      cpCitation: "Tex. Bus. & Com. Code §§ 17.41–17.63",
      dcCitation: "Tex. Fin. Code § 392.001 et seq. (Debt Collection)",
      crCitation: "Tex. Fin. Code Ch. 20",
      freezeCitation: "Tex. Bus. & Com. Code § 20.35; 15 U.S.C. § 1681c-1 (federal)",
      privacyCitation: "Tex. Bus. & Com. Code Ch. 521 (Identity Theft)",
      agOffice: "Texas Attorney General",
    }),
    caseLaw: TX_CASE_LAW,
    ordinancesNote:
      "Local ordinances are not typically the controlling authority for credit reporting disputes; none identified as directly applicable for Texas without municipal verification.",
    regulatorNote: "Texas Office of Consumer Credit Commissioner (where applicable).",
  },
  NY: {
    consumerProtection: {
      name: "New York General Business Law § 349 (Deceptive Acts)",
      citation: "N.Y. Gen. Bus. Law § 349",
      scope: "Deceptive acts in consumer-oriented commerce.",
      remedies: "Actual damages, injunctive relief, and civil penalties in AG actions.",
      privateAction: "Private actions available subject to statutory requirements.",
      agEnforcement: "New York Attorney General — Consumer Frauds Bureau.",
    },
    specificStatutes: [
      {
        name: "GBL § 349 — Deceptive Acts",
        citation: "N.Y. Gen. Bus. Law § 349",
        summary: "Deceptive practices in consumer transactions.",
        remedies: "Damages and injunction.",
        authority: "New York Attorney General",
      },
      {
        name: "New York SHIELD Act",
        citation: "N.Y. Gen. Bus. Law § 899-bb",
        summary: "Data security requirements for certain businesses.",
        remedies: "AG enforcement; private rights limited.",
        authority: "New York Attorney General",
      },
    ],
    authorityRows: buildAuthorityRowsFromProfile({
      stateName: "New York",
      stateAbbr: "NY",
      cpName: "GBL § 349",
      cpCitation: "N.Y. Gen. Bus. Law § 349",
      dcCitation: "N.Y. Gen. Bus. Law § 600 et seq. (debt collection themes)",
      crCitation: "N.Y. Gen. Bus. Law § 380-t (consumer report disclosure)",
      freezeCitation: "N.Y. Gen. Bus. Law § 380-t; 15 U.S.C. § 1681c-1 (federal)",
      privacyCitation: "N.Y. Gen. Bus. Law §§ 899-aa, 899-bb (SHIELD)",
      agOffice: "New York Attorney General",
    }),
    caseLaw: NY_CASE_LAW,
    ordinancesNote:
      "Local ordinances are not typically the controlling authority for credit reporting disputes; none identified as directly applicable for New York without municipal verification.",
    regulatorNote: "New York Department of Financial Services (DFS) — consumer complaint portal.",
  },
}

function mergeProfile(base: StateRightsProfile, patch?: Partial<StateRightsProfile>): StateRightsProfile {
  if (!patch) return base
  return {
    ...base,
    ...patch,
    consumerProtection: { ...base.consumerProtection, ...patch.consumerProtection },
    debtCollection: { ...base.debtCollection, ...patch.debtCollection },
    creditReporting: { ...base.creditReporting, ...patch.creditReporting },
    identityTheft: { ...base.identityTheft, ...patch.identityTheft },
    privacy: { ...base.privacy, ...patch.privacy },
    attorneyGeneral: { ...base.attorneyGeneral, ...patch.attorneyGeneral },
    specificStatutes: patch.specificStatutes ?? base.specificStatutes,
    authorityRows: patch.authorityRows ?? base.authorityRows,
    caseLaw: patch.caseLaw ?? base.caseLaw,
    ordinancesNote: patch.ordinancesNote ?? base.ordinancesNote,
    regulatorNote: patch.regulatorNote ?? base.regulatorNote,
  }
}

export function getStateRightsProfile(stateInput: string): StateRightsProfile {
  const { stateName, stateAbbr } = normalizeConsumerState(stateInput)
  const base = genericProfile(stateName, stateAbbr)
  return mergeProfile(base, STATE_OVERRIDES[stateAbbr])
}
