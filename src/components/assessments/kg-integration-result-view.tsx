import { DevPassRateChart } from "@/components/assessments/dev-pass-rate-chart";
import { getPassRateColor } from "@/lib/assessments/map-assessment-to-iep";
import type { KgIntegrationResultData } from "@/lib/assessments/load-assessment-result";
import { KG_INTEGRATION_SECTION_LABELS } from "@/lib/types/assessment_types";

type KgIntegrationResultViewProps = {
  data: KgIntegrationResultData;
};

export function KgIntegrationResultView({ data }: KgIntegrationResultViewProps) {
  const { summary, behaviorRecords } = data;

  const activitySummary = summary.filter((r) => r.section === "activity");
  const skillSummary = summary.filter((r) => r.section === "skill");

  const chartData = summary.map((row) => ({
    name: row.domain_label_zh,
    rate: Number(row.pass_rate ?? 0),
  }));

  const behaviors = behaviorRecords.filter((b) => b.behavior_description?.trim());

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-4 text-lg font-medium text-zinc-100">
          各领域融合能力率
        </h2>
        {chartData.length > 0 && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
            <DevPassRateChart data={chartData} />
          </div>
        )}
      </section>

      {[activitySummary, skillSummary].map((rows, idx) => {
        const sectionKey = idx === 0 ? "activity" : "skill";
        if (rows.length === 0) return null;
        return (
          <section key={sectionKey}>
            <h2 className="mb-4 text-lg font-medium text-zinc-100">
              {KG_INTEGRATION_SECTION_LABELS[sectionKey]}
            </h2>
            <div className="overflow-x-auto rounded-xl border border-zinc-800">
              <table className="min-w-full text-sm">
                <thead className="bg-zinc-900 text-left text-zinc-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">领域</th>
                    <th className="px-4 py-3 font-medium">总数</th>
                    <th className="px-4 py-3 font-medium">独立(2)</th>
                    <th className="px-4 py-3 font-medium">部分(1)</th>
                    <th className="px-4 py-3 font-medium">大量辅助(0)</th>
                    <th className="px-4 py-3 font-medium">不适用</th>
                    <th className="px-4 py-3 font-medium">未测</th>
                    <th className="px-4 py-3 font-medium">能力率</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {rows.map((row) => {
                    const rate = Math.round(Number(row.pass_rate ?? 0));
                    return (
                      <tr key={row.domain} className="text-zinc-300">
                        <td className="px-4 py-3">{row.domain_label_zh}</td>
                        <td className="px-4 py-3">{row.total_items}</td>
                        <td className="px-4 py-3 text-emerald-400">
                          {row.score_2_count}
                        </td>
                        <td className="px-4 py-3 text-amber-400">
                          {row.score_1_count}
                        </td>
                        <td className="px-4 py-3 text-red-400">
                          {row.score_0_count}
                        </td>
                        <td className="px-4 py-3 text-zinc-500">{row.na_count}</td>
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
        );
      })}

      <section>
        <h2 className="mb-4 text-lg font-medium text-zinc-100">
          C. 融合问题行为评估
        </h2>
        {behaviors.length === 0 ? (
          <p className="rounded-lg border border-dashed border-zinc-700 px-4 py-6 text-center text-sm text-zinc-500">
            未记录问题行为
          </p>
        ) : (
          <div className="space-y-3">
            {behaviors.map((record, index) => (
              <div
                key={record.id}
                className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-sm text-zinc-300"
              >
                <p className="font-medium text-zinc-200">
                  #{index + 1} {record.behavior_description}
                </p>
                <dl className="mt-2 grid gap-1 text-xs text-zinc-500 sm:grid-cols-2">
                  {record.occurrence_time && (
                    <>
                      <dt>出现时间</dt>
                      <dd className="text-zinc-400">{record.occurrence_time}</dd>
                    </>
                  )}
                  {record.frequency_intensity && (
                    <>
                      <dt>频率或强度</dt>
                      <dd className="text-zinc-400">{record.frequency_intensity}</dd>
                    </>
                  )}
                  {record.location && (
                    <>
                      <dt>地点</dt>
                      <dd className="text-zinc-400">{record.location}</dd>
                    </>
                  )}
                  {record.duration && (
                    <>
                      <dt>持续时间</dt>
                      <dd className="text-zinc-400">{record.duration}</dd>
                    </>
                  )}
                  {record.measures_taken && (
                    <>
                      <dt>曾采取的措施</dt>
                      <dd className="text-zinc-400">{record.measures_taken}</dd>
                    </>
                  )}
                  {record.behavior_impact && (
                    <>
                      <dt>行为影响</dt>
                      <dd className="text-zinc-400">{record.behavior_impact}</dd>
                    </>
                  )}
                </dl>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
