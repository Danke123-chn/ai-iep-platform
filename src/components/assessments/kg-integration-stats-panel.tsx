"use client";

import {
  computeKgDomainRates,
  computeKgStats,
  type KgIntegrationTab,
} from "@/lib/assessments/kg-integration-stats";
import type {
  KgIntegrationBehaviorRecord,
  KgIntegrationItem,
  KgIntegrationScore,
} from "@/lib/types/assessment_types";

type KgIntegrationStatsPanelProps = {
  activeTab: KgIntegrationTab;
  activityItems: KgIntegrationItem[];
  skillItems: KgIntegrationItem[];
  scores: Record<string, KgIntegrationScore>;
  behaviorCount: number;
};

export function KgIntegrationStatsPanel({
  activeTab,
  activityItems,
  skillItems,
  scores,
  behaviorCount,
}: KgIntegrationStatsPanelProps) {
  const items =
    activeTab === "activity" ? activityItems : activeTab === "skill" ? skillItems : [];
  const stats = computeKgStats(items.length, scores);
  const domainRates = computeKgDomainRates(items, scores);

  return (
    <aside className="sticky top-20 rounded-xl border border-zinc-800 bg-zinc-900 p-5">
      <h3 className="text-sm font-medium text-zinc-300">评估统计</h3>

      {activeTab === "behavior" ? (
        <div className="mt-4">
          <p className="text-xs text-zinc-500">问题行为记录</p>
          <p className="mt-1 text-2xl font-semibold text-amber-300">
            {behaviorCount} 条
          </p>
          <p className="mt-2 text-xs text-zinc-500">
            记录影响幼儿园融合活动的问题行为，用于制定行为支持目标
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          <div>
            <p className="text-xs text-zinc-500">融合能力率</p>
            <p className="mt-1 text-2xl font-semibold text-emerald-300">
              {stats.passRate}%
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              已测 {stats.tested} 项 · 独立(2) {stats.full} · 部分(1){" "}
              {stats.partial} · 大量辅助(0) {stats.fail}
              {stats.na > 0 ? ` · 不适用 ${stats.na}` : ""}
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-medium text-zinc-500">各领域能力率</p>
            {domainRates.map((d) => (
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
    </aside>
  );
}
