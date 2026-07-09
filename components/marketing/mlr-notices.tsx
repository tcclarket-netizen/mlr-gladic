import { FadeIn } from "./motion"

export function MlrNotices() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-4xl space-y-8 px-6">
        <FadeIn>
          <div className="rounded-xl border border-[#D8DEE9] bg-white p-8">
            <h2 className="mb-3 text-lg font-bold text-[#0B1020]">Consumer Notice</h2>
            <p className="text-sm leading-relaxed text-[#526174]">
              The Opposition Report™, My Legal Report™, and My Self Report™ are proprietary Credit Rights Intelligence™
              products that analyze consumer credit information using GLADIC AI&apos;s analytical methodologies, financial
              metrics, legal issue identification protocols, and IRAC-based analytical frameworks. They are designed to
              help consumers better understand their credit-related rights, reporting concerns, and potential
              administrative remedies.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="rounded-xl border border-[#D8DEE9] bg-white p-8">
            <h2 className="mb-3 text-lg font-bold text-[#0B1020]">Legal Disclaimer</h2>
            <p className="text-sm leading-relaxed text-[#526174]">
              GLADIC AI™ is not a law firm, not an attorney, and does not provide legal representation or establish an
              attorney-client relationship. All reports, dashboards, analyses, recommendations, and educational materials
              are provided solely for informational, educational, research, and self-help purposes. Users remain solely
              responsible for determining whether to pursue any administrative, regulatory, contractual, or legal action.
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
