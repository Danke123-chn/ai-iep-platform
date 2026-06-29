"use client";

import type { KgIntegrationBehaviorRecord } from "@/lib/types/assessment_types";

const FIELDS: {
  key: keyof Omit<KgIntegrationBehaviorRecord, "id" | "session_id" | "sort_order" | "created_at">;
  label: string;
  placeholder: string;
}[] = [
  { key: "behavior_description", label: "行为描述", placeholder: "描述问题行为…" },
  { key: "occurrence_time", label: "出现时间", placeholder: "如：晨间入园、午餐前后…" },
  { key: "frequency_intensity", label: "频率或强度", placeholder: "如：每天 2-3 次…" },
  { key: "location", label: "地点", placeholder: "如：教室、操场…" },
  { key: "duration", label: "持续时间", placeholder: "如：5-10 分钟…" },
  { key: "measures_taken", label: "曾采取的措施", placeholder: "已尝试的干预措施…" },
  { key: "behavior_impact", label: "行为影响", placeholder: "对融合活动的影响…" },
];

type KgIntegrationBehaviorSectionProps = {
  sessionId: string;
  records: KgIntegrationBehaviorRecord[];
  onChange: (records: KgIntegrationBehaviorRecord[]) => void;
  onSaveRecord: (record: KgIntegrationBehaviorRecord) => Promise<boolean>;
  onDeleteRecord: (id: string) => Promise<boolean>;
  disabled?: boolean;
};

function emptyRecord(sessionId: string, sortOrder: number): KgIntegrationBehaviorRecord {
  return {
    id: `temp-${Date.now()}-${sortOrder}`,
    session_id: sessionId,
    behavior_description: "",
    occurrence_time: "",
    frequency_intensity: "",
    location: "",
    duration: "",
    measures_taken: "",
    behavior_impact: "",
    sort_order: sortOrder,
  };
}

export function KgIntegrationBehaviorSection({
  sessionId,
  records,
  onChange,
  onSaveRecord,
  onDeleteRecord,
  disabled = false,
}: KgIntegrationBehaviorSectionProps) {
  async function handleFieldBlur(
    record: KgIntegrationBehaviorRecord,
    key: (typeof FIELDS)[number]["key"],
    value: string,
  ) {
    const updated = { ...record, [key]: value || null };
    onChange(records.map((r) => (r.id === record.id ? updated : r)));
    await onSaveRecord(updated);
  }

  async function handleAdd() {
    const next = emptyRecord(sessionId, records.length);
    onChange([...records, next]);
    await onSaveRecord(next);
  }

  async function handleRemove(id: string) {
    if (id.startsWith("temp-")) {
      onChange(records.filter((r) => r.id !== id));
      return;
    }
    const ok = await onDeleteRecord(id);
    if (ok) onChange(records.filter((r) => r.id !== id));
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-400">
        C. 融合问题行为评估 — 记录影响融合的问题行为（可添加多条）
      </p>

      {records.length === 0 && (
        <p className="rounded-lg border border-dashed border-zinc-700 px-4 py-8 text-center text-sm text-zinc-500">
          暂无行为记录，点击下方按钮添加
        </p>
      )}

      {records.map((record, index) => (
        <div
          key={record.id}
          className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4"
        >
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-sm font-medium text-zinc-200">
              行为记录 #{index + 1}
            </h4>
            {!disabled && (
              <button
                type="button"
                onClick={() => handleRemove(record.id)}
                className="text-xs text-red-400 hover:text-red-300"
              >
                删除
              </button>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {FIELDS.map((field) => (
              <label
                key={field.key}
                className="block sm:col-span-2 first:sm:col-span-2"
              >
                <span className="text-xs text-zinc-500">{field.label}</span>
                <textarea
                  rows={field.key === "behavior_description" ? 2 : 1}
                  value={(record[field.key] as string | null) ?? ""}
                  disabled={disabled}
                  onChange={(e) =>
                    onChange(
                      records.map((r) =>
                        r.id === record.id
                          ? { ...r, [field.key]: e.target.value }
                          : r,
                      ),
                    )
                  }
                  onBlur={(e) =>
                    handleFieldBlur(record, field.key, e.target.value)
                  }
                  placeholder={field.placeholder}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-zinc-500 disabled:opacity-60"
                />
              </label>
            ))}
          </div>
        </div>
      ))}

      {!disabled && (
        <button
          type="button"
          onClick={handleAdd}
          className="rounded-lg border border-dashed border-zinc-600 px-4 py-3 text-sm text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-300"
        >
          + 添加行为记录
        </button>
      )}
    </div>
  );
}
