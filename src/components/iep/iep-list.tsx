"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { getIepStatusColor } from "@/lib/iep-export/client";
import { getIepStatus } from "@/lib/iep-utils";
import type { IepListItem, IepStatus } from "@/types/iep";
import { IEP_STATUS_LABELS } from "@/types/iep";

type IepListProps = {
  items: IepListItem[];
  students: { id: string; name: string }[];
  schoolYears: string[];
};

export function IepList({ items, students, schoolYears }: IepListProps) {
  const [studentFilter, setStudentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<IepStatus | "">("");
  const [yearFilter, setYearFilter] = useState("");

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (studentFilter && item.student_id !== studentFilter) return false;
      if (yearFilter && item.school_year !== yearFilter) return false;
      if (statusFilter) {
        const status = getIepStatus({
          generated_at: item.generated_at,
          end_date: item.end_date,
        });
        if (status !== statusFilter) return false;
      }
      return true;
    });
  }, [items, studentFilter, statusFilter, yearFilter]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-zinc-100">IEP 列表</h1>
        <p className="mt-1 text-sm text-zinc-400">共 {filtered.length} 份计划</p>
      </div>

      <div className="mb-6 grid gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4 sm:grid-cols-3">
        <FilterSelect
          label="按学生"
          value={studentFilter}
          onChange={setStudentFilter}
          options={[
            { value: "", label: "全部学生" },
            ...students.map((s) => ({ value: s.id, label: s.name })),
          ]}
        />
        <FilterSelect
          label="按状态"
          value={statusFilter}
          onChange={(v) => setStatusFilter(v as IepStatus | "")}
          options={[
            { value: "", label: "全部状态" },
            { value: "draft", label: "草稿" },
            { value: "in_progress", label: "进行中" },
            { value: "completed", label: "已完成" },
          ]}
        />
        <FilterSelect
          label="按学年"
          value={yearFilter}
          onChange={setYearFilter}
          options={[
            { value: "", label: "全部学年" },
            ...schoolYears.map((y) => ({ value: y, label: y })),
          ]}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/50 px-6 py-16 text-center">
          <p className="text-zinc-400">暂无符合条件的 IEP</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => {
            const status = getIepStatus({
              generated_at: item.generated_at,
              end_date: item.end_date,
            });

            return (
              <Link
                key={item.id}
                href={`/dashboard/iep/${item.id}`}
                className="group rounded-xl border border-zinc-800 bg-zinc-900 p-5 transition-colors hover:border-zinc-700 hover:bg-zinc-800/50"
              >
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-medium text-zinc-100 group-hover:text-white">
                    {item.student_name}
                  </h2>
                  <span
                    className={`shrink-0 rounded-full border px-2 py-0.5 text-xs ${getIepStatusColor(status)}`}
                  >
                    {IEP_STATUS_LABELS[status]}
                  </span>
                </div>
                <p className="mt-1 text-sm text-zinc-400">
                  {item.school_year} · {item.semester}
                </p>
                <p className="mt-0.5 text-xs text-zinc-500">
                  {item.start_date} 至 {item.end_date}
                </p>
                <div className="mt-4 flex items-center gap-3 border-t border-zinc-800 pt-4 text-sm">
                  <span className="text-zinc-500">目标</span>
                  <span className="font-medium text-zinc-200">
                    {item.completed_count}/{item.total_goals}
                  </span>
                  <span className="text-xs text-emerald-400">已通过</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-zinc-500">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-500"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
