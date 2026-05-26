import Link from "next/link"
import {
  Shield,
  FileText,
  Mail,
  Building2,
  FolderOpen,
  Search,
  Lock,
  ArrowRight,
  CheckCircle,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const features = [
  {
    icon: FileText,
    title: "Bureau Report Extraction",
    description:
      "Parse and normalize Experian, Equifax, and TransUnion PDF reports into structured, searchable data.",
  },
  {
    icon: Shield,
    title: "MY LEGAL REPORT™ Generation",
    description:
      "Auto-generate comprehensive legal-ready case interpretation documents from your extracted report data.",
  },
  {
    icon: Mail,
    title: "Dispute Letter Packs",
    description:
      "Generate targeted dispute letters for CRAs and furnishers based on verification status and applicable statutes.",
  },
  {
    icon: Building2,
    title: "Agency Filing Workflow",
    description:
      "Build complete filing packets for the CFPB, FTC, State AG, and state regulatory agencies.",
  },
  {
    icon: FolderOpen,
    title: "Case Tracking",
    description:
      "Monitor the status of every case, document, and correspondence from a single organized dashboard.",
  },
  {
    icon: Search,
    title: "Evidence Indexing",
    description:
      "Organize exhibits, supporting documents, and correspondence into a structured evidence index.",
  },
]

const trustItems = [
  "256-bit AES encryption at rest",
  "Reports are never sold or shared",
  "Role-based access control",
  "SOC 2 compliant infrastructure",
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-primary">
              <Shield className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-foreground">TurnKey</span>
            <span className="hidden text-[11px] text-muted-foreground sm:block">Credit Report Intelligence</span>
          </div>
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#security" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Security
            </Link>
            <Link href="/billing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 pb-24 pt-20 text-center">
        <Badge variant="outline" className="mb-6 gap-1.5 px-3 py-1 text-xs font-medium">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-status-success" />
          Now available for consumers, credit consultants, and law offices
        </Badge>
        <h1 className="mx-auto max-w-3xl text-balance text-5xl font-semibold leading-tight tracking-tight text-foreground">
          Turn credit reports into structured, legal-ready case files.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
          Upload Experian, Equifax, and TransUnion reports. Extract tradelines. Generate MY LEGAL REPORT™ documents,
          dispute packs, and agency filing packets — all in one secure platform.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" asChild>
            <Link href="/sign-up">
              Get Started <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/reports">View Sample Report</Link>
          </Button>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">Free trial available. No credit card required.</p>
      </section>

      {/* Features */}
      <section id="features" className="bg-secondary/40 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Everything you need to build a strong case record
            </h2>
            <p className="mt-3 text-muted-foreground">
              Structured tools for procedural review, record-building, and self-help document generation.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-lg border border-border bg-card p-6 transition-shadow hover:shadow-sm"
              >
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
                  <Icon className="h-[1.125rem] w-[1.125rem] text-primary" />
                </div>
                <h3 className="mb-2 text-sm font-semibold text-foreground">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security / Trust */}
      <section id="security" className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-4xl rounded-xl border border-border bg-card px-10 py-12">
            <div className="flex flex-col gap-8 md:flex-row md:items-center">
              <div className="flex-1">
                <div className="mb-3 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-accent" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-accent">
                    Security &amp; Privacy
                  </span>
                </div>
                <h2 className="text-xl font-semibold tracking-tight text-foreground">
                  Your reports stay private. Always.
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Your credit data is among the most sensitive information you own. TurnKey is built from the ground
                  up to protect it with enterprise-grade security practices.
                </p>
              </div>
              <ul className="flex-1 space-y-3">
                {trustItems.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-foreground">
                    <CheckCircle className="h-4 w-4 shrink-0 text-status-success" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-16">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h2 className="text-2xl font-semibold text-primary-foreground">Ready to build your case record?</h2>
          <p className="mt-3 text-primary-foreground/70">Start with a free trial. No credit card required.</p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/sign-up">
                Create Free Account <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              asChild
            >
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Disclaimer strip */}
      <div className="border-t border-border bg-secondary/30 py-4">
        <p className="px-6 text-center text-[11px] leading-relaxed text-muted-foreground">
          TurnKey Credit is an educational and self-help document platform. It is not a law firm and does not provide
          legal advice, legal representation, or guarantee the deletion of any credit item or the approval of any
          credit application. All documents generated are for educational and procedural reference only.
        </p>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
              <Shield className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">TurnKey Credit Report Intelligence</span>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="text-xs text-muted-foreground hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="text-xs text-muted-foreground hover:text-foreground">
              Terms
            </Link>
            <Link href="/sign-in" className="text-xs text-muted-foreground hover:text-foreground">
              Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
