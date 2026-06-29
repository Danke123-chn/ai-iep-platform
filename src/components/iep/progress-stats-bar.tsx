"use client";

import type { ProgressStats } from "@/types/iep";

type ProgressStatsBarProps = {
  stats: ProgressStats;
};

function StatPill({
  label,
  value,
  colorClass,
}: {
  label: string;
  value: number;
  colorClass: string;
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${colorClass}`}
    >
      <span className="text-lg font-semibold">{value}</span>
      <span className="text-xs">{label}</span>
    </div>
  );
}

export function ProgressStatsBar({ stats }: ProgressStatsBarProps) {
  return (
    <div className="no-print rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
        进度统计
      </p>
      <div className="flex flex-wrap gap-2">
        <StatPill
          label="总目标"
          value={stats.total}
          colorClass="border-zinc-700 bg-zinc-950 text-zinc-300"
        />
        <StatPill
          label="通过 (P)"
          value={stats.P}
          colorClass="border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
        />
        <StatPill
          label="继续 (C)"
          value={stats.C}
          colorClass="border-blue-500/30 bg-blue-500/10 text-blue-300"
        />
        <StatPill
          label="放弃 (D)"
          value={stats.D}
          colorClass="border-red-500/30 bg-red-500/10 text-red-300"
        />
        <StatPill
          label="简化 (S)"
          value={stats.S}
          colorClass="border-orange-500/30 bg-orange-500/10 text-orange-300"
        />
        <StatPill
          label="加深 (E)"
          value={stats.E}
          colorClass="border-purple-500/30 bg-purple-500/10 text-purple-300"
        />
        {stats.unset > 0 && (
          <StatPill
            label="未更新"
            value={stats.unset}
            colorClass="border-zinc-600 bg-zinc-800 text-zinc-400"
          />
        )}
      </div>
    </div>
  );
}
