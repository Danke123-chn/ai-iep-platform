"use client";

import {
  computeBarrierStats,
  computeDomainPassRates,
  computeMilestoneStats,
  computeTransitionStats,
  type VbMappTab,
} from "@/lib/assessments/vb-mapp-stats";
import {
  VB_MAPP_MILESTONE_SCORE_OPTIONS,
  type VbMappBarrier,
  type VbMappMilestone,
  type VbMappTransition,
} from "@/lib/types/assessment_types";

type VbMappStatsPanelProps = {
  activeTab: VbMappTab;
  milestones: VbMappMilestone[];
  barriers: VbMappBarrier[];
  transitions: VbMappTransition[];
  milestoneScores: Record<string, string>;
  barrierScores: Record<string, string>;
  transitionScores: Record<string, string>;
};

export function VbMappStatsPanel({
  activeTab,
  milestones,
  barriers,
  transitions,
  milestoneScores,
  barrierScores,
  transitionScores,
}: VbMappStatsPanelProps) {
  const msStats = computeMilestoneStats(
    milestones.length,
    milestoneScores,
  );
  const domainRates = computeDomainPassRates(milestones, milestoneScores);
  const brStats = computeBarrierStats(barrierScores, barriers.length);
  const trStats = computeTransitionStats(transitionScores, transitions.length);
  const msScoreLabels = Object.fromEntries(
    VB_MAPP_MILESTONE_SCORE_OPTIONS.map((o) => [o.value, o.label]),
  ) as Record<string, string>;

  return (
    <aside className="sticky top-20 rounded-xl border border-zinc-800 bg-zinc-900 p-5">
      <h3 className="text-sm font-medium text-zinc-300">评估统计</h3>

      {activeTab === "milestones" && (
        <div className="mt-4 space-y-4">
          <div>
            <p className="text-xs text-zinc-500">1分 项数</p>
            <p className="mt-1 text-2xl font-semibold text-emerald-300">
              {msStats.passed}
              <span className="text-base font-normal text-zinc-500">
                {" "}
                / {msStats.total}
              </span>
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              已评 {msStats.scored} 项 · {msScoreLabels["1"]}{" "}
              {msStats.passed} · {msScoreLabels["0.5"]} {msStats.partial} ·{" "}
              {msScoreLabels["0"]} {msStats.notPassed} · {msScoreLabels.NT}{" "}
              {msStats.notTested}
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-medium text-zinc-500">各领域 1分 率</p>
            {domainRates.slice(0, 8).map((d) => (
              <div key={d.domain}>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">{d.label}</span>
                  <span className="text-zinc-500">{d.rate}%</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${d.rate}%`,
                      backgroundColor:
                        d.rate >= 70
                          ? "#5DCAA5"
                          : d.rate >= 30
                            ? "#FAC775"
                            : "#F09595",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "barriers" && (
        <div className="mt-4 space-y-2">
          <p className="text-xs text-zinc-500">已评障碍项</p>
          <p className="text-2xl font-semibold text-zinc-100">
            {brStats.scored}
            <span className="text-base font-normal text-zinc-500">
              {" "}
              / {brStats.total}
            </span>
          </p>
          <p className="text-xs text-zinc-500">
            平均严重度：{brStats.avg}（0=无问题，4=严重）
            {brStats.notTested > 0 ? ` · 未测 ${brStats.notTested}` : ""}
          </p>
        </div>
      )}

      {activeTab === "transitions" && (
        <div className="mt-4 space-y-2">
          <p className="text-xs text-zinc-500">已评过渡项</p>
          <p className="text-2xl font-semibold text-zinc-100">
            {trStats.scored}
            <span className="text-base font-normal text-zinc-500">
              {" "}
              / {trStats.total}
            </span>
          </p>
          <p className="text-xs text-zinc-500">
            平均严重度：{trStats.avg}（0=无问题，4=严重）
            {trStats.notTested > 0 ? ` · 未测 ${trStats.notTested}` : ""}
          </p>
        </div>
      )}
    </aside>
  );
}
