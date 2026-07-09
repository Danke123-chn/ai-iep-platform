"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { getAssessmentFormPath } from "@/lib/assessments/assessment-session-utils";
import { createClient } from "@/lib/supabase/client";
import type { AssessmentTool } from "@/lib/types/assessment_types";
import {
  DISABILITY_TYPES,
  EMPTY_STUDENT_FORM,
  GENDER_OPTIONS,
  PLACEMENT_TYPES,
  validateStudentForm,
  type DisabilityType,
  type PlacementType,
  type StudentFormData,
} from "@/lib/types/student";

import { getDbErrorMessage } from "@/lib/supabase/db-errors";

type StudentFormProps = {
  mode: "create" | "edit";
  studentId?: string;
  initialData?: StudentFormData;
  afterCreateTool?: AssessmentTool;
  cancelHref?: string;
};

function formDataToPayload(data: StudentFormData) {
  return {
    name: data.name.trim(),
    gender: data.gender || null,
    birth_date: data.birth_date || null,
    disability_types: data.disability_types,
    school: data.school.trim() || null,
    grade: data.grade.trim() || null,
    class_name: data.class_name.trim() || null,
    placement_types: data.placement_types,
    parent_name: data.parent_name.trim() || null,
    parent_phone: data.parent_phone.trim() || null,
    family_notes: data.family_notes.trim() || null,
    updated_at: new Date().toISOString(),
  };
}

export function StudentForm({
  mode,
  studentId,
  initialData,
  afterCreateTool,
  cancelHref = "/dashboard/students",
}: StudentFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<StudentFormData>(
    initialData ?? EMPTY_STUDENT_FORM,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function updateField<K extends keyof StudentFormData>(
    key: K,
    value: StudentFormData[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }

  function toggleDisability(type: DisabilityType) {
    setForm((prev) => {
      const types = prev.disability_types.includes(type)
        ? prev.disability_types.filter((t) => t !== type)
        : [...prev.disability_types, type];
      return { ...prev, disability_types: types };
    });
  }

  function togglePlacement(type: PlacementType) {
    setForm((prev) => {
      const types = prev.placement_types.includes(type)
        ? prev.placement_types.filter((t) => t !== type)
        : [...prev.placement_types, type];
      return { ...prev, placement_types: types };
    });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitError(null);

    const validationErrors = validateStudentForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const payload = formDataToPayload(form);

    if (mode === "create") {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setSubmitError("请先登录");
        setLoading(false);
        return;
      }

      const { data: created, error } = await supabase
        .from("students")
        .insert({
          ...payload,
          user_id: user.id,
        })
        .select("id")
        .single();

      if (error || !created) {
        setSubmitError(getDbErrorMessage(error?.message ?? "创建失败"));
        setLoading(false);
        return;
      }

      if (afterCreateTool) {
        const { data: session, error: sessionError } = await supabase
          .from("assessment_sessions")
          .insert({
            student_id: created.id,
            assessor_id: user.id,
            tool_type: afterCreateTool,
            status: "in_progress",
          })
          .select("id")
          .single();

        if (sessionError || !session) {
          setSubmitError(
            getDbErrorMessage(sessionError?.message ?? "创建评估会话失败"),
          );
          setLoading(false);
          return;
        }

        router.push(
          getAssessmentFormPath(created.id, session.id, afterCreateTool),
        );
        router.refresh();
        return;
      }
    } else if (studentId) {
      const { error } = await supabase
        .from("students")
        .update(payload)
        .eq("id", studentId);

      if (error) {
        setSubmitError(getDbErrorMessage(error.message));
        setLoading(false);
        return;
      }
    }

    router.push("/dashboard/students");
    router.refresh();
  }

  const inputClass =
    "w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3.5 py-2.5 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-500 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/20";
  const labelClass = "mb-1.5 block text-sm font-medium text-zinc-300";
  const errorClass = "mt-1 text-xs text-red-400";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {submitError && (
        <div
          role="alert"
          className="rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400"
        >
          {submitError}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={labelClass}>
            姓名 <span className="text-red-400">*</span>
          </label>
          <input
            id="name"
            type="text"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            className={inputClass}
            placeholder="请输入学生姓名"
          />
          {errors.name && <p className={errorClass}>{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="gender" className={labelClass}>
            性别
          </label>
          <select
            id="gender"
            value={form.gender}
            onChange={(e) =>
              updateField("gender", e.target.value as StudentFormData["gender"])
            }
            className={inputClass}
          >
            <option value="">请选择</option>
            {GENDER_OPTIONS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="birth_date" className={labelClass}>
            出生日期
          </label>
          <input
            id="birth_date"
            type="date"
            value={form.birth_date}
            onChange={(e) => updateField("birth_date", e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <fieldset>
        <legend className={labelClass}>安置形式</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {PLACEMENT_TYPES.map((type) => (
            <label
              key={type}
              className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2.5 text-sm text-zinc-300 transition-colors hover:border-zinc-700 has-[:checked]:border-zinc-500 has-[:checked]:bg-zinc-800"
            >
              <input
                type="checkbox"
                checked={form.placement_types.includes(type)}
                onChange={() => togglePlacement(type)}
                className="size-4 rounded border-zinc-600 bg-zinc-800 text-zinc-100 focus:ring-zinc-500/30"
              />
              {type}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className={labelClass}>障碍类型</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {DISABILITY_TYPES.map((type) => (
            <label
              key={type}
              className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2.5 text-sm text-zinc-300 transition-colors hover:border-zinc-700 has-[:checked]:border-zinc-500 has-[:checked]:bg-zinc-800"
            >
              <input
                type="checkbox"
                checked={form.disability_types.includes(type)}
                onChange={() => toggleDisability(type)}
                className="size-4 rounded border-zinc-600 bg-zinc-800 text-zinc-100 focus:ring-zinc-500/30"
              />
              {type}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="school" className={labelClass}>
            就读学校
          </label>
          <input
            id="school"
            type="text"
            value={form.school}
            onChange={(e) => updateField("school", e.target.value)}
            className={inputClass}
            placeholder="请输入学校名称"
          />
        </div>

        <div>
          <label htmlFor="grade" className={labelClass}>
            年级
          </label>
          <input
            id="grade"
            type="text"
            value={form.grade}
            onChange={(e) => updateField("grade", e.target.value)}
            className={inputClass}
            placeholder="如：三年级"
          />
        </div>

        <div>
          <label htmlFor="class_name" className={labelClass}>
            班级
          </label>
          <input
            id="class_name"
            type="text"
            value={form.class_name}
            onChange={(e) => updateField("class_name", e.target.value)}
            className={inputClass}
            placeholder="如：1班"
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="parent_name" className={labelClass}>
            家长姓名
          </label>
          <input
            id="parent_name"
            type="text"
            value={form.parent_name}
            onChange={(e) => updateField("parent_name", e.target.value)}
            className={inputClass}
            placeholder="请输入家长姓名"
          />
        </div>

        <div>
          <label htmlFor="parent_phone" className={labelClass}>
            家长电话
          </label>
          <input
            id="parent_phone"
            type="tel"
            value={form.parent_phone}
            onChange={(e) => updateField("parent_phone", e.target.value)}
            className={inputClass}
            placeholder="11位手机号码"
          />
          {errors.parent_phone && (
            <p className={errorClass}>{errors.parent_phone}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="family_notes" className={labelClass}>
          家庭情况备注
        </label>
        <textarea
          id="family_notes"
          rows={4}
          value={form.family_notes}
          onChange={(e) => updateField("family_notes", e.target.value)}
          className={inputClass}
          placeholder="可填写家庭背景、特殊情况等"
        />
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-zinc-800 pt-6 sm:flex-row sm:justify-end">
        <Link
          href={cancelHref}
          className="inline-flex items-center justify-center rounded-lg border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
        >
          取消
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-lg bg-zinc-100 px-4 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "保存中…" : "保存"}
        </button>
      </div>
    </form>
  );
}
