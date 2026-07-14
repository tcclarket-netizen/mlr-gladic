"use client"

import { useState } from "react"
import { ArrowUpRight, ChevronDown } from "lucide-react"
import { MLR_FAQS } from "@/lib/marketing/mlr-pricing"
import { FadeIn } from "./motion"

const HELP_CENTER_URL = "https://gladic.ai/help"

export function MlrFaq() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="faq" className="bg-white py-24">
      <div className="mx-auto max-w-3xl px-6">
        <FadeIn className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-[#0B1020]">Frequently Asked Questions</h2>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="space-y-3">
            {MLR_FAQS.map((faq, i) => (
              <div key={faq.q} className="overflow-hidden rounded-xl border border-[#D8DEE9] bg-white">
                <button
                  type="button"
                  className="flex w-full items-center justify-between px-5 py-4 text-left"
                  onClick={() => setOpen(open === i ? null : i)}
                >
                  <span className="pr-4 text-sm font-semibold text-[#0B1020]">{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-[#526174] transition-transform ${open === i ? "rotate-180" : ""}`}
                  />
                </button>
                {open === i && (
                  <div className="border-t border-[#D8DEE9] px-5 py-4">
                    <p className="text-sm leading-relaxed text-[#526174]">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={0.2} className="mt-8 text-center">
          <p className="text-sm text-[#526174]">
            Looking for more detail?{" "}
            <a
              href={HELP_CENTER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-[#2454FF] transition-colors hover:text-[#0B1020]"
            >
              Visit the Help Center
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            </a>{" "}
            for guides, policies, and additional answers.
          </p>
        </FadeIn>
      </div>
    </section>
  )
}
