import Link from "next/link"
import { CheckCircle } from "lucide-react"
import { MLR_COLORS } from "@/lib/marketing/mlr-brand"
import {
  MLR_MONTHLY_PLANS,
  MLR_ANNUAL_PLANS,
  membershipSignUpHref,
  type MlrPricingPlan,
} from "@/lib/marketing/mlr-pricing"
import { FadeIn, Stagger, StaggerItem } from "./motion"

export function MlrPricingSection() {
  return (
    <section id="memberships" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <FadeIn className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-[#0B1020]">Choose Your Membership</h2>
          <p className="mx-auto mt-3 max-w-2xl text-lg text-[#526174]">
            GLADIC AI™ products are now available through membership access only. Select the level that matches your
            reporting volume, support needs, and dashboard requirements.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <span className="rounded-full border border-[#D8DEE9] bg-white px-3 py-1 text-xs font-medium text-[#526174]">
              No pay-per-report options
            </span>
            <span className="rounded-full border border-[#2454FF]/30 bg-[#2454FF]/5 px-3 py-1 text-xs font-medium text-[#2454FF]">
              Membership-based reporting access
            </span>
          </div>
        </FadeIn>

        <FadeIn className="mb-8">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#526174]">
            Monthly Basic Memberships
          </h3>
          <Stagger className="grid gap-5 md:grid-cols-3">
            {MLR_MONTHLY_PLANS.map((plan) => (
              <StaggerItem key={plan.key}>
                <PricingCard plan={plan} />
              </StaggerItem>
            ))}
          </Stagger>
        </FadeIn>

        <FadeIn>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#526174]">
            Annual Value Memberships
          </h3>
          <Stagger className="grid gap-5 lg:grid-cols-3">
            {MLR_ANNUAL_PLANS.map((plan) => (
              <StaggerItem key={plan.key}>
                <PricingCard plan={plan} />
              </StaggerItem>
            ))}
          </Stagger>
        </FadeIn>
      </div>
    </section>
  )
}

function PricingCard({ plan }: { plan: MlrPricingPlan }) {
  const isHighlighted = plan.highlighted
  const isPremium = plan.premium

  return (
    <div
      className={`relative flex h-full flex-col rounded-xl border p-6 transition-shadow hover:shadow-lg ${
        isHighlighted
          ? "border-[#D6A13A] bg-white shadow-md ring-2 ring-[#D6A13A]/30"
          : isPremium
            ? "border-[#0B1020]/20 bg-[#0B1020] text-white"
            : "border-[#D8DEE9] bg-white"
      }`}
    >
      {isHighlighted && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#D6A13A] px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
          Most Popular
        </span>
      )}
      {isPremium && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#D6A13A] px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
          Premium
        </span>
      )}

      <p
        className={`text-[11px] font-bold uppercase tracking-widest ${
          isPremium ? "text-white/60" : "text-[#526174]"
        }`}
      >
        {plan.name}
      </p>

      <div className="mt-3">
        <span className={`text-3xl font-bold ${isPremium ? "text-white" : "text-[#0B1020]"}`}>{plan.price}</span>
        <span className={`ml-1 text-sm ${isPremium ? "text-white/60" : "text-[#526174]"}`}>{plan.billingTerm}</span>
      </div>

      {plan.monthlyAlt && (
        <p className={`mt-1 text-xs ${isPremium ? "text-white/50" : "text-[#526174]"}`}>{plan.monthlyAlt}</p>
      )}

      {plan.savingsBadge && (
        <span className="mt-2 inline-block rounded-full bg-[#12B981]/10 px-2.5 py-0.5 text-[10px] font-medium text-[#12B981]">
          {plan.savingsBadge}
        </span>
      )}

      <p className={`mt-4 text-[10px] font-semibold uppercase tracking-widest ${isPremium ? "text-white/50" : "text-[#526174]"}`}>
        Includes monthly:
      </p>
      <ul className="mt-2 flex-1 space-y-1.5">
        {plan.features.map((f) => (
          <li key={f} className={`flex items-start gap-2 text-xs ${isPremium ? "text-white/80" : "text-[#526174]"}`}>
            <CheckCircle className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${isPremium ? "text-[#5DE1FF]" : "text-[#12B981]"}`} />
            {f}
          </li>
        ))}
      </ul>

      <p className={`mt-4 text-xs ${isPremium ? "text-white/50" : "text-[#526174]"}`}>
        <span className="font-semibold">Best for: </span>
        {plan.bestFor}
      </p>

      <Link
        href={membershipSignUpHref(plan.key)}
        className={`mt-5 block rounded-lg px-4 py-2.5 text-center text-sm font-semibold transition-all hover:brightness-110 ${
          isPremium ? "text-[#0B1020]" : "text-white"
        }`}
        style={{
          backgroundColor: isPremium ? MLR_COLORS.casefileGold : MLR_COLORS.rightsBlue,
        }}
      >
        {plan.cta}
      </Link>
    </div>
  )
}
