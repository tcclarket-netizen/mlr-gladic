import Link from "next/link"
import { MLR_COLORS } from "@/lib/marketing/mlr-brand"
import { FadeIn } from "./motion"

export function MlrFinalCta() {
  return (
    <section className="border-t border-[#D8DEE9] bg-white py-20">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <FadeIn>
          <h2 className="text-3xl font-bold tracking-tight text-[#0B1020]">
            Start Your Credit Rights Intelligence Membership
          </h2>
          <p className="mt-4 text-lg text-[#526174]">
            Choose a membership, enter the MLR workspace, and generate structured GLADIC AI™ reports from one secure
            dashboard.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/sign-up"
              className="inline-flex items-center rounded-lg px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:brightness-110"
              style={{ backgroundColor: MLR_COLORS.rightsBlue }}
            >
              Choose Membership
            </Link>
            <Link
              href="#memberships"
              className="inline-flex items-center rounded-lg border border-[#D8DEE9] bg-white px-6 py-3 text-sm font-medium text-[#0B1020] shadow-sm transition-colors hover:bg-[#F5F7FB]"
            >
              Compare Plans
            </Link>
          </div>
          <p className="mt-4 text-xs text-[#526174]">
            Membership access only · Cancel anytime · Secure document workflow
          </p>
        </FadeIn>
      </div>
    </section>
  )
}
