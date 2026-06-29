"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import {
  getDefaultDates,
  getDefaultSchoolYear,
  getDefaultSemester,
} from "@/lib/iep-utils";
import type { AssessmentIepPrefill } from "@/lib/assessments/load-assessment-for-iep";
import { createGenericIepDomains } from "@/lib/assessments/map-assessment-to-iep";
import { formatPlacementTypes, type Student } from "@/lib/types/student";
import {
  ASSESSMENT_LEVEL_LABELS,
  IEP_DOMAIN_MODE_LABELS,
  type AssessmentLevel,
  type IepDomainMode,
  type IepFormDomain,
} from "@/types/iep";

type IepAssessmentFormProps = {
  students: Student[];
  defaultStudentId?: string;
  assessmentPrefill?: AssessmentIepPrefill | null;
};

function createEmptyDomains(): IepFormDomain[] {
  return createGenericIepDomains();
}

function getDomainModeLabel(mode: IepDomainMode): string {
  return IEP_DOMAIN_MODE_LABELS[mode];
}

function getFormSubtitle(mode: IepDomainMode): string {
  switch (mode) {
    case "vb_mapp":
      return "基于 VB-MAPP 评估结果，由 AI 生成与里程碑、障碍及过渡相匹配的 IEP";
    case "c_pep3":
      return "基于 C-PEP-3 评估结果，由 AI 生成与发展及病理领域相匹配的 IEP";
    case "kg_integration":
      return "基于幼儿园融合能力评估结果，由 AI 生成与融合学期计划 8 大领域相匹配的 IEP";
    case "elem_integration":
      return "基于小学融合能力评估结果，由 AI 生成与融合学期计划 7 大领域相匹配的 IEP";
    default:
      return "填写各评估领域后，由 AI 生成与评估相匹配的个别化教育计划";
  }
}

function DomainCard({
  domain,
  expanded,
  onToggle,
  onChange,
}: {
  domain: IepFormDomain;
  expanded: boolean;
  onToggle: () => void;
  onChange: (updated: IepFormDomain) => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-zinc-800/60"
      >
        <div>
          <h3 className="font-medium text-zinc-100">{domain.name}</h3>
          {domain.level && (
            <p className="mt-0.5 text-xs text-zinc-500">
              已选 {domain.level} 级 · {ASSESSMENT_LEVEL_LABELS[domain.level]}
            </p>
          )}
        </div>
        <span className="text-zinc-500">{expanded ? "−" : "+"}</span>
      </button>

      {expanded && (
        <div className="space-y-4 border-t border-zinc-800 px-5 py-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              评估等级
            </label>
            <div className="grid gap-2 sm:grid-cols-5">
              {([1, 2, 3, 4, 5] as AssessmentLevel[]).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => onChange({ ...domain, level })}
                  className={`rounded-lg border px-3 py-2 text-left text-xs transition-colors ${
                    domain.level === level
                      ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                      : "border-zinc-700 bg-zinc-950 text-zinc-400 hover:border-zinc-600"
                  }`}
                >
                  <span className="block font-semibold">{level} 级</span>
                  <span className="mt-1 block leading-snug text-zinc-500">
                    {ASSESSMENT_LEVEL_LABELS[level]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor={`desc-${domain.key}`}
              className="mb-1.5 block text-sm font-medium text-zinc-300"
            >
              具体描述
            </label>
            <textarea
              id={`desc-${domain.key}`}
              rows={3}
              value={domain.description}
              onChange={(e) =>
                onChange({ ...domain, description: e.target.value })
              }
              placeholder="描述该领域的能力现状、优势与需支持之处…"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/20"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl">
        <div className="flex justify-center">
          <div className="size-10 animate-spin rounded-full border-2 border-zinc-700 border-t-emerald-400" />
        </div>
        <p className="mt-6 text-center text-sm font-medium text-zinc-200">
          AI 正在生成 IEP，预计需要 1-3 分钟…
        </p>
        <p className="mt-2 text-center text-xs text-zinc-500">
          VB-MAPP / C-PEP-3 评估领域较多，生成时间可能更长，请勿关闭页面
        </p>
        <div className="mt-6 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse space-y-2">
              <div className="h-3 w-1/3 rounded bg-zinc-800" />
              <div className="h-10 rounded-lg bg-zinc-800/80" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function IepAssessmentForm({
  students,
  defaultStudentId,
  assessmentPrefill,
}: IepAssessmentFormProps) {
  const router = useRouter();
  const defaultSemester = getDefaultSemester();
  const defaultDates = getDefaultDates(defaultSemester);

  const initialStudentId =
    (assessmentPrefill?.studentId &&
      students.some((s) => s.id === assessmentPrefill.studentId) &&
      assessmentPrefill.studentId) ||
    (defaultStudentId && students.some((s) => s.id === defaultStudentId)
      ? defaultStudentId
      : (students[0]?.id ?? ""));

  const [studentId, setStudentId] = useState(initialStudentId);
  const [schoolYear, setSchoolYear] = useState(getDefaultSchoolYear());
  const [semester, setSemester] = useState<"上学期" | "下学期">(defaultSemester);
  const [startDate, setStartDate] = useState(defaultDates.startDate);
  const [endDate, setEndDate] = useState(defaultDates.endDate);
  const domainMode: IepDomainMode = assessmentPrefill?.domainMode ?? "generic";
  const assessmentSessionId = assessmentPrefill?.sessionId;
  const toolType = assessmentPrefill?.toolType;
  const [domains, setDomains] = useState<IepFormDomain[]>(
    () => assessmentPrefill?.domains ?? createEmptyDomains(),
  );
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(
    () => new Set([assessmentPrefill?.domains[0]?.key ?? "sensory_motor"]),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedStudent = useMemo(
    () => students.find((s) => s.id === studentId),
    [students, studentId],
  );

  function handleSemesterChange(value: "上学期" | "下学期") {
    setSemester(value);
    const dates = getDefaultDates(value);
    setStartDate(dates.startDate);
    setEndDate(dates.endDate);
  }

  function toggleDomain(key: string) {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function updateDomain(key: string, updated: IepFormDomain) {
    setDomains((prev) => prev.map((d) => (d.key === key ? updated : d)));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!studentId) {
      setError("请先选择学生");
      return;
    }

    const incomplete = domains.find((d) => d.level === null);
    if (incomplete) {
      setError(`请为「${incomplete.name}」选择评估等级`);
      setExpandedKeys((prev) => new Set(prev).add(incomplete.key));
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/iep/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          schoolYear,
          semester,
          startDate,
          endDate,
          domainMode,
          assessmentSessionId,
          toolType,
          domains,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error ?? "生成 IEP 失败，请稍后再试");
        setLoading(false);
        return;
      }

      router.push(`/dashboard/iep/${result.iep_id}`);
      router.refresh();
    } catch {
      setError("网络错误，请检查连接后重试");
      setLoading(false);
    }
  }

  if (students.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/50 px-6 py-16 text-center">
        <p className="text-zinc-400">还没有学生档案，请先添加学生后再创建 IEP</p>
        <Link
          href="/dashboard/students/new"
          className="mt-4 inline-block rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-white"
        >
          添加学生
        </Link>
      </div>
    );
  }

  return (
    <>
      {loading && <LoadingOverlay />}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">新建 IEP 评估</h1>
          <p className="mt-1 text-sm text-zinc-400">
            {getFormSubtitle(domainMode)}
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400"
          >
            {error}
          </div>
        )}

        {assessmentPrefill && (
          <div className="rounded-lg border border-emerald-900/40 bg-emerald-950/20 px-4 py-3 text-sm text-emerald-300">
            已根据 {assessmentPrefill.toolLabel} 评估（
            {assessmentPrefill.sessionDate}）自动填充
            {getDomainModeLabel(assessmentPrefill.domainMode)}领域，您可修改后再生成
            IEP。
          </div>
        )}

        {/* 学生选择 */}
        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <label
            htmlFor="student"
            className="mb-2 block text-sm font-medium text-zinc-300"
          >
            选择学生
          </label>
          <select
            id="student"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-100 outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/20"
          >
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name}
                {student.grade ? ` · ${student.grade}` : ""}
                {student.class_name ? ` ${student.class_name}` : ""}
              </option>
            ))}
          </select>
        </section>

        {/* 基本信息 */}
        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="mb-4 text-sm font-medium text-zinc-300">基本信息</h2>

          {selectedStudent && (
            <div className="mb-5 grid gap-3 rounded-lg border border-zinc-800 bg-zinc-950/50 p-4 sm:grid-cols-2 lg:grid-cols-4">
              <InfoItem label="姓名" value={selectedStudent.name} />
              <InfoItem
                label="性别"
                value={selectedStudent.gender ?? "未填写"}
              />
              <InfoItem label="学校" value={selectedStudent.school ?? "未填写"} />
              <InfoItem label="年级" value={selectedStudent.grade ?? "未填写"} />
              <InfoItem
                label="班级"
                value={selectedStudent.class_name ?? "未填写"}
              />
              <InfoItem
                label="安置方式"
                value={
                  selectedStudent
                    ? formatPlacementTypes(selectedStudent.placement_types)
                    : "未填写"
                }
              />
              <InfoItem
                label="障碍类型"
                value={
                  selectedStudent.disability_types.length
                    ? selectedStudent.disability_types.join("、")
                    : "未填写"
                }
                className="sm:col-span-2"
              />
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="学年">
              <input
                type="text"
                value={schoolYear}
                onChange={(e) => setSchoolYear(e.target.value)}
                placeholder="2025-2026"
                required
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
            <Field label="起始日期">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className={inputClass}
              />
            </Field>
            <Field label="结束日期">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className={inputClass}
              />
            </Field>
          </div>
        </section>

        {/* 评估领域 */}
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-zinc-300">
            {getDomainModeLabel(domainMode)}
          </h2>
          {domains.map((domain) => (
            <DomainCard
              key={domain.key}
              domain={domain}
              expanded={expandedKeys.has(domain.key)}
              onToggle={() => toggleDomain(domain.key)}
              onChange={(updated) => updateDomain(domain.key, updated)}
            />
          ))}
        </section>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/dashboard"
            className="text-sm text-zinc-500 transition-colors hover:text-zinc-300"
          >
            ← 返回控制台
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-emerald-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "生成中…" : "生成 IEP"}
          </button>
        </div>
      </form>
    </>
  );
}

const inputClass =
  "w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-100 outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/20";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-zinc-500">
        {label}
      </label>
      {children}
    </div>
  );
}

function InfoItem({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-0.5 text-sm text-zinc-200">{value}</p>
    </div>
  );
}
