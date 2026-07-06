"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ASSESSMENT_TOOL_COLORS } from "@/lib/assessments/assessment-tool-config";
import {
  formatAssessmentReportTitle,
  getAssessmentReportPath,
  type AssessmentReportListItem,
} from "@/lib/assessments/assessment-report-utils";
import { ASSESSMENT_TOOLS, type AssessmentTool } from "@/lib/types/assessment_types";

type AssessmentReportListProps = {
  items: AssessmentReportListItem[];
  students: { id: string; name: string }[];
};

export function AssessmentReportList({
  items,
  students,
}: AssessmentReportListProps) {
  const [studentFilter, setStudentFilter] = useState("");
  const [toolFilter, setToolFilter] = useState<AssessmentTool | "">("");

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (studentFilter && item.student_id !== studentFilter) return false;
      if (toolFilter && item.tool_type !== toolFilter) return false;
      return true;
    });
  }, [items, studentFilter, toolFilter]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-zinc-100">评估报告列表</h1>
        <p className="mt-1 text-sm text-zinc-400">
          共 {filtered.length} 份已完成评估报告
        </p>
      </div>

      <div className="mb-6 grid gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4 sm:grid-cols-2">
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
          label="按评估工具"
          value={toolFilter}
          onChange={(v) => setToolFilter(v as AssessmentTool | "")}
          options={[
            { value: "", label: "全部工具" },
            ...ASSESSMENT_TOOLS.map((tool) => ({
              value: tool.value,
              label: tool.label,
            })),
          ]}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/50 px-6 py-16 text-center">
          <p className="text-zinc-400">暂无符合条件的评估报告</p>
          <p className="mt-2 text-sm text-zinc-500">
            完成评估后，报告将出现在此列表
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => {
            const accent = ASSESSMENT_TOOL_COLORS[item.tool_type];

            return (
              <Link
                key={item.id}
                href={getAssessmentReportPath(item.student_id, item.id)}
                className="group rounded-xl border border-zinc-800 bg-zinc-900 p-5 transition-colors hover:border-zinc-700 hover:bg-zinc-800/50"
                style={{
                  background: `linear-gradient(135deg, ${accent}18 0%, rgb(24 24 27) 55%)`,
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-medium text-zinc-100 group-hover:text-white">
                    {item.student_name}
                  </h2>
                  <span
                    className="shrink-0 rounded-full border px-2 py-0.5 text-xs"
                    style={{
                      borderColor: `${accent}66`,
                      color: accent,
                      backgroundColor: `${accent}22`,
                    }}
                  >
                    {item.tool_label}
                  </span>
                </div>
                <p className="mt-2 text-sm text-zinc-300">
                  {formatAssessmentReportTitle(item)}
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  评估日期 {item.session_date}
                </p>
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
