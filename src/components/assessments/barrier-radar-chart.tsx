"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";

type BarrierRadarChartProps = {
  data: { name: string; score: number }[];
  /** 障碍项总数 */
  totalCount?: number;
  /** 未测（NT）项数量 */
  untestedCount?: number;
};

function EmptyState({
  totalCount = 0,
  untestedCount = 0,
}: {
  totalCount?: number;
  untestedCount?: number;
}) {
  const allUntested = totalCount > 0 && untestedCount === totalCount;
  const mostlyUntested = totalCount > 0 && untestedCount > 0;

  if (allUntested) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm font-medium text-zinc-400">障碍评估均为未测</p>
        <p className="mt-2 text-xs text-zinc-500">
          共 {totalCount} 项障碍尚未评分，请返回评估表单完成「障碍评估」后再查看分布图
        </p>
      </div>
    );
  }

  if (mostlyUntested) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm font-medium text-zinc-400">
          暂无可展示的障碍分布
        </p>
        <p className="mt-2 text-xs text-zinc-500">
          {untestedCount}/{totalCount} 项为
          <span className="mx-1 font-medium text-zinc-400">未测</span>
          ，其余为无问题（0 分）；仅显示 1–4 分的障碍项
        </p>
      </div>
    );
  }

  return (
    <div className="py-8 text-center">
      <p className="text-sm text-zinc-500">各项障碍均为无问题（0 分）</p>
      <p className="mt-2 text-xs text-zinc-600">暂无显著障碍需展示</p>
    </div>
  );
}

export function BarrierRadarChart({
  data,
  totalCount = 0,
  untestedCount = 0,
}: BarrierRadarChartProps) {
  if (data.length === 0) {
    return <EmptyState totalCount={totalCount} untestedCount={untestedCount} />;
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="#3f3f46" />
          <PolarAngleAxis
            dataKey="name"
            tick={{ fill: "#a1a1aa", fontSize: 10 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 4]}
            tick={{ fill: "#71717a", fontSize: 10 }}
          />
          <Radar
            name="严重度"
            dataKey="score"
            stroke="#534AB7"
            fill="#534AB7"
            fillOpacity={0.35}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
