"use client";

import { useMemo, useState } from "react";
import { ScoreButtonRow } from "@/components/assessments/score-button-row";
import {
  VB_MAPP_LEVELS,
  VB_MAPP_MILESTONE_SCORE_OPTIONS,
  VB_MAPP_NT,
  type MilestoneScore,
  type VbMappMilestone,
} from "@/lib/types/assessment_types";

type MilestoneSectionProps = {
  milestones: VbMappMilestone[];
  scores: Record<string, string>;
  notes: Record<string, string>;
  onScore: (id: string, score: MilestoneScore) => void;
  onNotes: (id: string, notes: string) => void;
  savingId: string | null;
};

export function VbMappMilestoneSection({
  milestones,
  scores,
  notes,
  onScore,
  onNotes,
  savingId,
}: MilestoneSectionProps) {
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(["1-mand"]));

  const grouped = useMemo(() => {
    const levels: Record<
      number,
      { domain: string; label: string; items: VbMappMilestone[] }[]
    > = { 1: [], 2: [], 3: [] };

    const domainMap: Record<number, Map<string, { label: string; items: VbMappMilestone[] }>> = {
      1: new Map(),
      2: new Map(),
      3: new Map(),
    };

    for (const m of milestones) {
      const map = domainMap[m.level];
      if (!map.has(m.domain)) {
        map.set(m.domain, { label: m.domain_label_zh, items: [] });
      }
      map.get(m.domain)!.items.push(m);
    }

    for (const level of [1, 2, 3] as const) {
      levels[level] = [...domainMap[level].entries()].map(([domain, data]) => ({
        domain,
        label: data.label,
        items: data.items,
      }));
    }

    return levels;
  }, [milestones]);

  function toggle(key: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  if (milestones.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-zinc-700 px-4 py-8 text-center text-sm text-zinc-500">
        未加载里程碑数据。请在 Supabase 执行{" "}
        <code className="text-zinc-400">010_vb_mapp_schema.sql</code> 导入定义数据。
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {([1, 2, 3] as const).map((level) => {
        const meta = VB_MAPP_LEVELS[level];
        return (
          <section key={level}>
            <h3
              className="mb-4 flex items-center gap-3 text-lg font-semibold text-zinc-100"
            >
              <span
                className="size-3 rounded-full"
                style={{ backgroundColor: meta.color }}
              />
              {meta.label}（{meta.ageRange}）
            </h3>

            <div className="space-y-3">
              {grouped[level].map(({ domain, label, items }) => {
                const key = `${level}-${domain}`;
                const isOpen = expanded.has(key);

                return (
                  <div
                    key={key}
                    className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50"
                  >
                    <button
                      type="button"
                      onClick={() => toggle(key)}
                      className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-zinc-800/50"
                    >
                      <span className="font-medium text-zinc-200">{label}</span>
                      <span className="text-sm text-zinc-500">
                        {items.filter((i) => scores[i.id] === "1").length}/
                        {
                          items.filter(
                            (i) =>
                              scores[i.id] !== undefined &&
                              scores[i.id] !== VB_MAPP_NT,
                          ).length
                        }{" "}
                        1分 · {isOpen ? "−" : "+"}
                      </span>
                    </button>

                    {isOpen && (
                      <div className="divide-y divide-zinc-800 border-t border-zinc-800">
                        {items.map((item) => (
                          <div key={item.id} className="px-4 py-3">
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                              <div className="flex-1">
                                <p className="text-xs text-zinc-500">
                                  #{item.milestone_number}
                                </p>
                                <p className="mt-0.5 text-sm text-zinc-200">
                                  {item.description}
                                </p>
                              </div>
                              <ScoreButtonRow
                                options={VB_MAPP_MILESTONE_SCORE_OPTIONS}
                                value={scores[item.id] as MilestoneScore | undefined}
                                onChange={(v) => onScore(item.id, v as MilestoneScore)}
                                disabled={savingId === item.id}
                              />
                            </div>
                            <details className="mt-2">
                              <summary className="cursor-pointer text-xs text-zinc-500 hover:text-zinc-400">
                                备注
                              </summary>
                              <textarea
                                rows={2}
                                value={notes[item.id] ?? ""}
                                onChange={(e) => onNotes(item.id, e.target.value)}
                                onBlur={(e) => onNotes(item.id, e.target.value)}
                                className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs text-zinc-200 outline-none focus:border-zinc-500"
                                placeholder="可选备注…"
                              />
                            </details>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
