import { MLR_COMPARISON_ROWS } from "@/lib/marketing/mlr-pricing"
import { FadeIn } from "./motion"

const columns = ["basic_i", "basic_ii", "basic_iii", "accuracy", "dispute", "resolute"] as const
const columnLabels = ["Basic I", "Basic II", "Basic III", "Accuracy", "Dispute", "Resolute"]

export function MlrComparisonTable() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <FadeIn className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-[#0B1020]">Compare Memberships</h2>
          <p className="mt-3 text-lg text-[#526174]">Find the membership level that fits your reporting needs.</p>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="overflow-x-auto rounded-xl border border-[#D8DEE9]">
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="border-b border-[#D8DEE9] bg-[#F5F7FB]">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-[#526174]">
                    Feature
                  </th>
                  {columnLabels.map((label) => (
                    <th
                      key={label}
                      className="px-3 py-3 text-center text-xs font-semibold text-[#0B1020]"
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MLR_COMPARISON_ROWS.map((row, i) => (
                  <tr key={row.feature} className={i % 2 === 0 ? "bg-white" : "bg-[#F5F7FB]/50"}>
                    <td className="px-4 py-3 font-medium text-[#0B1020]">{row.feature}</td>
                    {columns.map((col) => (
                      <td key={col} className="px-3 py-3 text-center text-[#526174]">
                        {row[col] === "✓" ? (
                          <span className="text-[#12B981]">✓</span>
                        ) : (
                          row[col]
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-5 text-center text-xs leading-relaxed text-[#526174]">
            Report access resets according to the active membership billing cycle. Users who need higher report volume
            should upgrade to a higher membership.
          </p>
        </FadeIn>
      </div>
    </section>
  )
}
