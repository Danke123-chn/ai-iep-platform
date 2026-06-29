"use client";

import {
  computeDevDomainRates,
  computeDevStats,
  computePatDomainRates,
  computePatStats,
  type Cpep3Tab,
} from "@/lib/assessments/c-pep3-stats";
import type {
  Cpep3DevelopmentalItem,
  Cpep3PathologicalItem,
  DevScore,
  PatScore,
} from "@/lib/types/assessment_types";

type Cpep3StatsPanelProps = {
  activeTab: Cpep3Tab;
  devItems: Cpep3DevelopmentalItem[];
  patItems: Cpep3PathologicalItem[];
  devScores: Record<string, DevScore>;
  patScores: Record<string, PatScore>;
};

export function Cpep3StatsPanel({
  activeTab,
  devItems,
  patItems,
  devScores,
  patScores,
}: Cpep3StatsPanelProps) {
  const devStats = computeDevStats(devItems.length, devScores);
  const patStats = computePatStats(patItems.length, patScores);
  const devDomains = computeDevDomainRates(devItems, devScores);
  const patDomains = computePatDomainRates(patItems, patScores);

  return (
    <aside className="sticky top-20 rounded-xl border border-zinc-800 bg-zinc-900 p-5">
      <h3 className="text-sm font-medium text-zinc-300">评估统计</h3>

      {activeTab === "developmental" && (
        <div className="mt-4 space-y-4">
          <div>
            <p className="text-xs text-zinc-500">发展领域通过率</p>
            <p className="mt-1 text-2xl font-semibold text-emerald-300">
              {devStats.passRate}%
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              已测 {devStats.tested} 项 · 通过(P) {devStats.passed} · 中间(E){" "}
              {devStats.emerging} · 不通过(F) {devStats.failed}
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-medium text-zinc-500">各领域通过率</p>
            {devDomains.map((d) => (
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

      {activeTab === "pathological" && (
        <div className="mt-4 space-y-4">
          <div>
            <p className="text-xs text-zinc-500">病理领域异常比例</p>
            <p className="mt-1 text-2xl font-semibold text-amber-300">
              {patStats.abnormalRate}%
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              已测 {patStats.tested} 项 · 适当(A) {patStats.appropriate} · 轻度(M){" "}
              {patStats.mild} · 严重(S) {patStats.severe}
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-medium text-zinc-500">各领域异常比例</p>
            {patDomains.map((d) => (
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
                        d.rate <= 30
                          ? "#5DCAA5"
                          : d.rate <= 60
                            ? "#FAC775"
                            : "#E24B4A",
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
