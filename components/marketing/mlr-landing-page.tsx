import { MlrHeader } from "./mlr-header"
import { MlrHero } from "./mlr-hero"
import { MlrReportCards } from "./mlr-report-cards"
import { MlrAppPreview } from "./mlr-app-preview"
import { MlrPricingSection } from "./mlr-pricing-section"
import { MlrComparisonTable } from "./mlr-comparison-table"
import { MlrHowItWorks } from "./mlr-how-it-works"
import { MlrDashboardFeatures } from "./mlr-dashboard-features"
import { MlrAudience } from "./mlr-audience"
import { MlrSecurity } from "./mlr-security"
import { MlrFaq } from "./mlr-faq"
import { MlrNotices } from "./mlr-notices"
import { MlrFinalCta } from "./mlr-final-cta"
import { MlrFooter } from "./mlr-footer"

export function MlrLandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <MlrHeader />
      <MlrHero />
      <MlrReportCards />
      <MlrAppPreview />
      <MlrPricingSection />
      <MlrComparisonTable />
      <MlrHowItWorks />
      <MlrDashboardFeatures />
      <MlrAudience />
      <MlrSecurity />
      <MlrFaq />
      <MlrNotices />
      <MlrFinalCta />
      <MlrFooter />
    </div>
  )
}
