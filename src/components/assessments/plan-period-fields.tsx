"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  type AssessmentPlanPeriod,
  resolvePlanPeriodFromSession,
} from "@/lib/assessments/plan-period";
import { saveAssessmentPlanPeriod } from "@/lib/assessments/save-assessment-plan-period";
import { getDefaultDates } from "@/lib/iep-utils";
import { createClient } from "@/lib/supabase/client";
import type { AssessmentSession } from "@/lib/types/assessment_types";

type AssessmentPlanPeriodFieldsProps = {
  session: AssessmentSession;
  className?: string;
};

const inputClass =
  "w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-500";

export function AssessmentPlanPeriodFields({
  session,
  className = "",
}: AssessmentPlanPeriodFieldsProps) {
  const initial = resolvePlanPeriodFromSession(session);
  const [schoolYear, setSchoolYear] = useState(initial.schoolYear);
  const [semester, setSemester] = useState<"上学期" | "下学期">(initial.semester);
  const [planStartDate, setPlanStartDate] = useState(initial.planStartDate);
  const [planEndDate, setPlanEndDate] = useState(initial.planEndDate);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [saveError, setSaveError] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const next = resolvePlanPeriodFromSession(session);
    setSchoolYear(next.schoolYear);
    setSemester(next.semester);
    setPlanStartDate(next.planStartDate);
    setPlanEndDate(next.planEndDate);
  }, [
    session.id,
    session.school_year,
    session.semester,
    session.plan_start_date,
    session.plan_end_date,
  ]);

  const persist = useCallback(
    async (plan: AssessmentPlanPeriod) => {
      setSaveStatus("saving");
      setSaveError(null);

      const supabase = createClient();
      const { error, usedNotesFallback } = await saveAssessmentPlanPeriod(
        supabase,
        session.id,
        plan,
        session.notes,
      );

      if (error) {
        setSaveStatus("error");
        setSaveError(error);
        return;
      }

      if (usedNotesFallback) {
        setSaveError(
          "计划周期已暂存。建议在 CloudBase 执行 migration 010 以启用专用字段。",
        );
      } else {
        setSaveError(null);
      }

      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    },
    [session.id, session.notes],
  );

  const scheduleSave = useCallback(
    (plan: AssessmentPlanPeriod) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        void persist(plan);
      }, 400);
    },
    [persist],
  );

  function emitUpdate(plan: AssessmentPlanPeriod) {
    scheduleSave(plan);
  }

  function handleSemesterChange(value: "上学期" | "下学期") {
    const dates = getDefaultDates(value);
    const plan: AssessmentPlanPeriod = {
      schoolYear,
      semester: value,
      planStartDate: dates.startDate,
      planEndDate: dates.endDate,
    };
    setSemester(value);
    setPlanStartDate(dates.startDate);
    setPlanEndDate(dates.endDate);
    emitUpdate(plan);
  }

  return (
    <section
      className={`rounded-xl border border-zinc-800 bg-zinc-900 p-5 ${className}`.trim()}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-medium text-zinc-300">计划周期</h2>
          <p className="mt-1 text-xs text-zinc-500">
            学年、学期与 IEP 计划起止日期可根据实际情况填写，生成 IEP 时将自动带入
          </p>
        </div>
        <div className="text-xs">
          {saveStatus === "saving" && (
            <span className="text-zinc-500">保存中…</span>
          )}
          {saveStatus === "saved" && (
            <span className="text-emerald-400">已保存</span>
          )}
          {saveStatus === "error" && saveError && (
            <span className="text-red-400">{saveError}</span>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="学年">
          <input
            type="text"
            value={schoolYear}
            onChange={(e) => {
              const value = e.target.value;
              setSchoolYear(value);
              emitUpdate({
                schoolYear: value,
                semester,
                planStartDate,
                planEndDate,
              });
            }}
            placeholder="2025-2026"
            className={inputClass}
          />
        </Field>
        <Field label="学期">
          <select
            value={semester}
            onChange={(e) =>
              handleSemesterChange(e.target.value as "上学期" | "下学期")
            }
            className={inputClass}
          >
            <option value="上学期">上学期</option>
            <option value="下学期">下学期</option>
          </select>
        </Field>
        <Field label="计划起始">
          <input
            type="date"
            value={planStartDate}
            onChange={(e) => {
              const value = e.target.value;
              setPlanStartDate(value);
              emitUpdate({
                schoolYear,
                semester,
                planStartDate: value,
                planEndDate,
              });
            }}
            className={inputClass}
          />
        </Field>
        <Field label="计划结束">
          <input
            type="date"
            value={planEndDate}
            onChange={(e) => {
              const value = e.target.value;
              setPlanEndDate(value);
              emitUpdate({
                schoolYear,
                semester,
                planStartDate,
                planEndDate: value,
              });
            }}
            className={inputClass}
          />
        </Field>
      </div>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-zinc-400">
        {label}
      </label>
      {children}
    </div>
  );
}
