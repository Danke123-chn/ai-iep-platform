"use client";

import dynamic from "next/dynamic";

export const BarrierRadarChart = dynamic(
  () =>
    import("@/components/assessments/barrier-radar-chart").then(
      (mod) => mod.BarrierRadarChart,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-80 w-full items-center justify-center">
        <p className="text-sm text-zinc-500">加载图表中…</p>
      </div>
    ),
  },
);
