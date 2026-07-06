"use client";

import dynamic from "next/dynamic";

export const DevPassRateChart = dynamic(
  () =>
    import("@/components/assessments/dev-pass-rate-chart").then(
      (mod) => mod.DevPassRateChart,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-72 w-full items-center justify-center">
        <p className="text-sm text-zinc-500">加载图表中…</p>
      </div>
    ),
  },
);
