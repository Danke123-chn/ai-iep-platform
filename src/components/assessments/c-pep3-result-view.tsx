import { DevPassRateChart } from "@/components/assessments/dev-pass-rate-chart.lazy";
import { getPassRateColor } from "@/lib/assessments/map-assessment-to-iep";
import type { Cpep3ResultData } from "@/lib/assessments/load-assessment-result";

type Cpep3ResultViewProps = {
  data: Cpep3ResultData;
};

export function Cpep3ResultView({ data }: Cpep3ResultViewProps) {
  const { devSummary, patSummary } = data;

  const chartData = devSummary.map((row) => ({
    name: row.domain_label_zh,
    rate: row.pass_rate ?? 0,
  }));

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-4 text-lg font-medium text-zinc-100">
          发展领域通过率
        </h2>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <DevPassRateChart data={chartData} />
        </div>

        <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-800">
          <table className="min-w-full text-sm">
            <thead className="bg-zinc-900 text-left text-zinc-400">
              <tr>
                <th className="px-4 py-3 font-medium">领域</th>
                <th className="px-4 py-3 font-medium">总数</th>
                <th className="px-4 py-3 font-medium">通过(P)</th>
                <th className="px-4 py-3 font-medium">中间(E)</th>
                <th className="px-4 py-3 font-medium">不通过(F)</th>
                <th className="px-4 py-3 font-medium">未测(NT)</th>
                <th className="px-4 py-3 font-medium">通过率</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {devSummary.map((row) => {
                const rate = Math.round(Number(row.pass_rate ?? 0));
                return (
                  <tr key={row.domain} className="text-zinc-300">
                    <td className="px-4 py-3">{row.domain_label_zh}</td>
                    <td className="px-4 py-3">{row.total_items}</td>
                    <td className="px-4 py-3 text-emerald-400">{row.passed_count}</td>
                    <td className="px-4 py-3 text-amber-400">{row.emerging_count}</td>
                    <td className="px-4 py-3 text-red-400">{row.failed_count}</td>
                    <td className="px-4 py-3 text-zinc-500">{row.not_tested_count}</td>
                    <td className="px-4 py-3">
                      <div className="flex min-w-[100px] items-center gap-2">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-800">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${rate}%`,
                              backgroundColor: getPassRateColor(rate),
                            }}
                          />
                        </div>
                        <span className="text-xs text-zinc-400">{rate}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-medium text-zinc-100">
          病理领域分布
        </h2>
        <div className="overflow-x-auto rounded-xl border border-zinc-800">
          <table className="min-w-full text-sm">
            <thead className="bg-zinc-900 text-left text-zinc-400">
              <tr>
                <th className="px-4 py-3 font-medium">领域</th>
                <th className="px-4 py-3 font-medium">总数</th>
                <th className="px-4 py-3 font-medium">适当(A)</th>
                <th className="px-4 py-3 font-medium">轻度(M)</th>
                <th className="px-4 py-3 font-medium">严重(S)</th>
                <th className="px-4 py-3 font-medium">未测(NT)</th>
                <th className="px-4 py-3 font-medium">异常比例</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {patSummary.map((row) => {
                const tested =
                  Number(row.appropriate_count) +
                  Number(row.mild_count) +
                  Number(row.severe_count);
                const abnormal =
                  Number(row.mild_count) + Number(row.severe_count);
                const rate =
                  tested > 0 ? Math.round((abnormal / tested) * 100) : 0;

                return (
                  <tr key={row.domain} className="text-zinc-300">
                    <td className="px-4 py-3">{row.domain_label_zh}</td>
                    <td className="px-4 py-3">{row.total_items}</td>
                    <td className="px-4 py-3 text-emerald-400">
                      {row.appropriate_count}
                    </td>
                    <td className="px-4 py-3 text-amber-400">{row.mild_count}</td>
                    <td className="px-4 py-3 text-red-400">{row.severe_count}</td>
                    <td className="px-4 py-3 text-zinc-500">
                      {row.not_tested_count}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex min-w-[100px] items-center gap-2">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-800">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${rate}%`,
                              backgroundColor:
                                rate <= 30
                                  ? "#5DCAA5"
                                  : rate <= 60
                                    ? "#FAC775"
                                    : "#E24B4A",
                            }}
                          />
                        </div>
                        <span className="text-xs text-zinc-400">{rate}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
