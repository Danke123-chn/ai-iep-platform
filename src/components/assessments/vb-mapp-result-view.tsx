import { getPassRateColor, calcMilestonePassRate } from "@/lib/assessments/map-assessment-to-iep";
import { getVbMappSeverityLabel, isVbMappNt, VB_MAPP_LEVELS } from "@/lib/types/assessment_types";
import type { VbMappMilestoneSummary } from "@/lib/types/assessment_types";
import { BarrierRadarChart } from "@/components/assessments/barrier-radar-chart";
import type { VbMappResultData } from "@/lib/assessments/load-assessment-result";

type VbMappResultViewProps = {
  data: VbMappResultData;
};

export function VbMappResultView({ data }: VbMappResultViewProps) {
  const { milestoneSummary, barriers, transitions } = data;

  const radarData = barriers
    .filter((b) => !isVbMappNt(b.score) && Number(b.score) > 0)
    .sort((a, b) => Number(b.score) - Number(a.score))
    .slice(0, 12)
    .map((b) => ({
      name: b.barrier_name_zh.slice(0, 6),
      score: Number(b.score),
    }));

  const barrierUntestedCount = barriers.filter((b) => isVbMappNt(b.score)).length;

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-4 text-lg font-medium text-zinc-100">
          里程碑评估汇总
        </h2>
        <div className="overflow-x-auto rounded-xl border border-zinc-800">
          <table className="min-w-full text-sm">
            <thead className="bg-zinc-900 text-left text-zinc-400">
              <tr>
                <th className="px-4 py-3 font-medium">领域</th>
                <th className="px-4 py-3 font-medium">层级</th>
                <th className="px-4 py-3 font-medium">总数</th>
                <th className="px-4 py-3 font-medium">1分</th>
                <th className="px-4 py-3 font-medium">1/2分</th>
                <th className="px-4 py-3 font-medium">0分</th>
                <th className="px-4 py-3 font-medium">未测</th>
                <th className="px-4 py-3 font-medium">1分率</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {milestoneSummary.map((row) => {
                const rate = calcMilestonePassRate(row);
                return (
                  <MilestoneSummaryRow key={`${row.domain}-${row.level}`} row={row} rate={rate} />
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-medium text-zinc-100">
          障碍评估分布
        </h2>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <BarrierRadarChart
            data={radarData}
            totalCount={barriers.length}
            untestedCount={barrierUntestedCount}
          />
          <p className="mt-2 text-center text-xs text-zinc-500">
            显示前 12 项障碍评分（0=无问题，4=严重；未测项不参与分布图）
          </p>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-medium text-zinc-100">过渡评估得分</h2>
        <div className="overflow-x-auto rounded-xl border border-zinc-800">
          <table className="min-w-full text-sm">
            <thead className="bg-zinc-900 text-left text-zinc-400">
              <tr>
                <th className="px-4 py-3 font-medium">项目</th>
                <th className="px-4 py-3 font-medium">类别</th>
                <th className="px-4 py-3 font-medium">严重度</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {transitions.map((t) => (
                <tr key={t.id} className="text-zinc-300">
                  <td className="px-4 py-3">{t.transition_name_zh}</td>
                  <td className="px-4 py-3 text-zinc-500">{t.category}</td>
                  <td className="px-4 py-3 font-medium">
                    {getVbMappSeverityLabel(t.score)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function MilestoneSummaryRow({
  row,
  rate,
}: {
  row: VbMappMilestoneSummary;
  rate: number;
}) {
  const levelMeta = VB_MAPP_LEVELS[row.level as 1 | 2 | 3];

  return (
    <tr className="text-zinc-300">
      <td className="px-4 py-3">{row.domain_label_zh}</td>
      <td className="px-4 py-3">
        <span className="rounded-full px-2 py-0.5 text-xs" style={{ backgroundColor: `${levelMeta.color}33`, color: levelMeta.color }}>
          {levelMeta.label}
        </span>
      </td>
      <td className="px-4 py-3">{row.total_milestones}</td>
      <td className="px-4 py-3 text-emerald-400">{row.passed}</td>
      <td className="px-4 py-3 text-amber-400">{row.partial}</td>
      <td className="px-4 py-3 text-red-400">{row.not_passed}</td>
      <td className="px-4 py-3 text-zinc-500">{row.not_tested ?? 0}</td>
      <td className="px-4 py-3">
        <div className="flex min-w-[120px] items-center gap-2">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full"
              style={{ width: `${rate}%`, backgroundColor: getPassRateColor(rate) }}
            />
          </div>
          <span className="w-10 text-xs text-zinc-400">{rate}%</span>
        </div>
      </td>
    </tr>
  );
}
