"use client";

import { useMemo, useState } from "react";
import { ScoreButtonRow } from "@/components/assessments/score-button-row";

type ItemRow = {
  id: string;
  domain: string;
  domain_label_zh: string;
  item_number: number;
  description: string;
};

type ScoreOption = {
  value: string;
  label: string;
  color: string;
};

type Cpep3ItemSectionProps = {
  items: ItemRow[];
  scores: Record<string, string>;
  notes: Record<string, string>;
  scoreOptions: readonly ScoreOption[];
  emptyMessage: string;
  onScore: (id: string, score: string) => void;
  onNotes: (id: string, notes: string) => void;
  savingId: string | null;
  countLabel?: (domainItems: ItemRow[]) => string;
};

export function Cpep3ItemSection({
  items,
  scores,
  notes,
  scoreOptions,
  emptyMessage,
  onScore,
  onNotes,
  savingId,
  countLabel,
}: Cpep3ItemSectionProps) {
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    if (items.length === 0) return new Set();
    return new Set([items[0].domain]);
  });

  const grouped = useMemo(() => {
    const map = new Map<string, { label: string; items: ItemRow[] }>();
    for (const item of items) {
      if (!map.has(item.domain)) {
        map.set(item.domain, { label: item.domain_label_zh, items: [] });
      }
      map.get(item.domain)!.items.push(item);
    }
    return [...map.entries()].map(([domain, data]) => ({
      domain,
      label: data.label,
      items: data.items,
    }));
  }, [items]);

  function toggle(domain: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(domain)) next.delete(domain);
      else next.add(domain);
      return next;
    });
  }

  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-zinc-700 px-4 py-8 text-center text-sm text-zinc-500">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {grouped.map(({ domain, label, items: domainItems }) => {
        const isOpen = expanded.has(domain);
        const summary = countLabel?.(domainItems) ?? `${domainItems.length} 项`;

        return (
          <div
            key={domain}
            className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50"
          >
            <button
              type="button"
              onClick={() => toggle(domain)}
              className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-zinc-800/50"
            >
              <span className="font-medium text-zinc-200">{label}</span>
              <span className="text-sm text-zinc-500">
                {summary} · {isOpen ? "−" : "+"}
              </span>
            </button>

            {isOpen && (
              <div className="divide-y divide-zinc-800 border-t border-zinc-800">
                {domainItems.map((item) => (
                  <div key={item.id} className="px-4 py-3">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex-1">
                        <p className="text-xs text-zinc-500">#{item.item_number}</p>
                        <p className="mt-0.5 text-sm text-zinc-200">
                          {item.description}
                        </p>
                      </div>
                      <ScoreButtonRow
                        options={scoreOptions}
                        value={scores[item.id]}
                        onChange={(v) => onScore(item.id, v)}
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
  );
}
