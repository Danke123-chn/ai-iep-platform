"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { InProgressSessions } from "@/components/assessments/in-progress-sessions";
import { getAssessmentFormPath } from "@/lib/assessments/assessment-session-utils";
import type { InProgressSessionSummary } from "@/lib/assessments/assessment-session-utils";
import { createClient } from "@/lib/supabase/client";
import { getDbErrorMessage } from "@/lib/supabase/db-errors";
import { calculateStudentAge } from "@/lib/student-utils";
import {
  ASSESSMENT_TOOLS,
  type AssessmentTool,
} from "@/lib/types/assessment_types";
import { formatDisabilityTypes, type Student } from "@/lib/types/student";

type AssessmentToolSelectorProps = {
  student: Student;
  inProgressSessions?: InProgressSessionSummary[];
};

export function AssessmentToolSelector({
  student,
  inProgressSessions = [],
}: AssessmentToolSelectorProps) {
  const router = useRouter();
  const [selectedTool, setSelectedTool] = useState<AssessmentTool | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSelectTool(toolType: AssessmentTool, forceNew = false) {
    if (loading) return;

    const existing = inProgressSessions.find((s) => s.tool_type === toolType);
    if (existing && !forceNew) {
      router.push(
        getAssessmentFormPath(student.id, existing.id, toolType),
      );
      return;
    }

    setSelectedTool(toolType);
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("请先登录");
      setLoading(false);
      setSelectedTool(null);
      return;
    }

    const { data: session, error: insertError } = await supabase
      .from("assessment_sessions")
      .insert({
        student_id: student.id,
        assessor_id: user.id,
        tool_type: toolType,
        status: "in_progress",
      })
      .select("id")
      .single();

    if (insertError || !session) {
      setError(getDbErrorMessage(insertError?.message ?? "创建评估会话失败"));
      setLoading(false);
      setSelectedTool(null);
      return;
    }

    const formPath = getAssessmentFormPath(student.id, session.id, toolType);

    router.push(formPath);
  }

  function getExistingSession(toolType: AssessmentTool) {
    return inProgressSessions.find((s) => s.tool_type === toolType);
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500">
          学生信息
        </h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs text-zinc-500">姓名</dt>
            <dd className="mt-1 text-lg font-semibold text-zinc-100">
              {student.name}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500">年龄</dt>
            <dd className="mt-1 text-zinc-200">
              {calculateStudentAge(student.birth_date)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500">障碍类别</dt>
            <dd className="mt-1 text-zinc-200">
              {formatDisabilityTypes(student.disability_types)}
            </dd>
          </div>
        </dl>
      </div>

      <InProgressSessions
        studentId={student.id}
        initialSessions={inProgressSessions}
      />

      {error && (
        <div
          role="alert"
          className="mb-6 rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400"
        >
          {error}
          {error.includes("assessment_sessions") && (
            <p className="mt-2 text-xs text-red-300/80">
              请先在 Supabase SQL Editor 执行{" "}
              <code className="rounded bg-red-950/50 px-1">
                supabase/migrations/009_assessment_sessions.sql
              </code>{" "}
              中的 SQL 创建评估表。
            </p>
          )}
        </div>
      )}

      <div>
        <h2 className="text-lg font-medium text-zinc-100">选择评估工具</h2>
        <p className="mt-1 text-sm text-zinc-400">
          请选择适合该学生的标准化评估量表
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ASSESSMENT_TOOLS.map((tool) => {
            const isSelected = selectedTool === tool.value;
            const isLoading = loading && isSelected;
            const existing = getExistingSession(tool.value);

            return (
              <div
                key={tool.value}
                className={`group relative flex flex-col rounded-xl border-2 p-6 text-left transition-all ${
                  isSelected
                    ? "border-white/40 ring-2 ring-white/20"
                    : "border-zinc-800 hover:border-zinc-600 hover:shadow-lg hover:shadow-black/20"
                }`}
                style={{
                  background: `linear-gradient(135deg, ${tool.color}22 0%, rgb(24 24 27) 60%)`,
                }}
              >
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleSelectTool(tool.value)}
                  className="flex flex-1 flex-col text-left disabled:cursor-not-allowed disabled:opacity-60"
                >
                <div
                  className={`mb-4 inline-flex size-12 items-center justify-center rounded-lg font-bold text-white ${
                    tool.iconLabel.length > 2 ? "text-[10px] leading-tight" : "text-lg"
                  }`}
                  style={{ backgroundColor: tool.color }}
                >
                  {tool.iconLabel}
                </div>

                <h3 className="text-xl font-semibold text-zinc-100">
                  {tool.label}
                </h3>
                <p className="mt-1 text-sm font-medium text-zinc-300">
                  {tool.fullNameZh}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                  {tool.description}
                </p>

                <ul className="mt-4 space-y-1">
                  {tool.sections.map((section) => (
                    <li
                      key={section}
                      className="flex items-center gap-2 text-xs text-zinc-500"
                    >
                      <span
                        className="size-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: tool.color }}
                      />
                      {section}
                    </li>
                  ))}
                </ul>

                <p className="mt-4 text-xs text-zinc-500">
                  适用年龄：{tool.ageRange}
                </p>

                {isLoading && (
                  <span className="absolute right-4 top-4 text-xs text-zinc-400">
                    创建中…
                  </span>
                )}

                <span
                  className={`mt-6 inline-flex items-center text-sm font-medium transition-colors ${
                    isSelected ? "text-white" : "text-zinc-300 group-hover:text-white"
                  }`}
                  style={{ color: isSelected ? tool.color : undefined }}
                >
                  {isLoading
                    ? "正在进入…"
                    : existing
                      ? "继续评估 →"
                      : "开始评估 →"}
                </span>
                </button>

                {existing && (
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleSelectTool(tool.value, true)}
                    className="mt-3 text-left text-xs text-zinc-500 underline-offset-2 hover:text-zinc-300 hover:underline disabled:opacity-50"
                  >
                    新建一份评估（保留当前进度）
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
