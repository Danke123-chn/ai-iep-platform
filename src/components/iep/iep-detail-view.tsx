"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import "./iep-detail.css";
import {
  buildTeachingSuggestions,
  downloadExportFile,
  exportIepToPdf,
  getIepStatusColor,
} from "@/lib/iep-export/client";
import {
  computeProgressStats,
  getProgressStatusColor,
  getShortTermGoalProgress,
} from "@/lib/iep-progress";
import { getIepStatus } from "@/lib/iep-utils";
import { useToast } from "@/components/ui/toast";
import { ProgressStatsBar } from "@/components/iep/progress-stats-bar";
import { ProgressUpdateModal } from "@/components/iep/progress-update-modal";
import {
  RegenerateIepDialog,
  RegenerateLoadingOverlay,
} from "@/components/iep/regenerate-iep-dialog";
import { formatDisabilityTypes, formatPlacementTypes } from "@/lib/types/student";
import type { Student } from "@/lib/types/student";
import {
  ASSESSMENT_LEVEL_LABELS,
  GOAL_PROGRESS_LABELS,
  IEP_STATUS_LABELS,
  type GoalProgressStatus,
  type IepGenerateRequest,
  type IepGoalRecord,
  type IepRecord,
  type ShortTermGoal,
} from "@/types/iep";

type IepDetailViewProps = {
  iep: IepRecord;
  student: Student | null;
  goals: IepGoalRecord[];
};

function calculateAge(birthDate: string | null): string {
  if (!birthDate) return "—";
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return "—";
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age -= 1;
  return `${age} 岁`;
}

function LevelBar({ level }: { level: number }) {
  const percent = (level / 5) * 100;
  return (
    <div className="mt-2">
      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span>1 级</span>
        <span className="font-medium text-zinc-300">{level} 级</span>
        <span>5 级</span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function StatusBadge({
  status,
  label,
  className,
}: {
  status: string;
  label: string;
  className: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${className}`}
    >
      {status} · {label}
    </span>
  );
}

export function IepDetailView({ iep, student, goals: initialGoals }: IepDetailViewProps) {
  const router = useRouter();
  const documentRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();
  const assessment = iep.assessment_data as IepGenerateRequest;
  const iepStatus = getIepStatus(iep);
  const [goals, setGoals] = useState(initialGoals);
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(
    () => new Set(initialGoals.map((g) => g.id)),
  );
  const [exporting, setExporting] = useState<"pdf" | "word" | "progress" | null>(
    null,
  );
  const [regenerating, setRegenerating] = useState(false);
  const [regenerateDialogOpen, setRegenerateDialogOpen] = useState(false);
  const [regenerateError, setRegenerateError] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTarget, setModalTarget] = useState<{
    goalId: string;
    goalIndex: number;
    content: string;
    stg: ShortTermGoal;
  } | null>(null);

  const progressStats = computeProgressStats(goals);
  const teachingSuggestions = buildTeachingSuggestions({ iep, student, goals });

  function toggleGoal(id: string) {
    setExpandedGoals((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleExportPdf() {
    if (!documentRef.current) return;
    setExportError(null);
    setExporting("pdf");
    try {
      await exportIepToPdf(documentRef.current, { iep, student, goals });
    } catch {
      setExportError("PDF 导出失败，请稍后重试");
    } finally {
      setExporting(null);
    }
  }

  async function handleExportWord() {
    setExportError(null);
    setExporting("word");
    try {
      await downloadExportFile(iep.id, "word");
    } catch (err) {
      setExportError(
        err instanceof Error ? err.message : "Word 导出失败，请稍后重试",
      );
    } finally {
      setExporting(null);
    }
  }

  async function handleProgressReport() {
    setExportError(null);
    setExporting("progress");
    try {
      await downloadExportFile(iep.id, "progress");
    } catch (err) {
      setExportError(
        err instanceof Error ? err.message : "进度报告生成失败，请稍后重试",
      );
    } finally {
      setExporting(null);
    }
  }

  function handlePrint() {
    window.print();
  }

  function openProgressModal(
    goalId: string,
    goalIndex: number,
    content: string,
    stg: ShortTermGoal,
  ) {
    setModalTarget({ goalId, goalIndex, content, stg });
    setModalOpen(true);
  }

  async function handleProgressSave(data: {
    progress: GoalProgressStatus;
    progress_notes: string;
    progress_updated_at: string;
  }) {
    if (!modalTarget) return;

    const response = await fetch("/api/iep/progress", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        iepGoalId: modalTarget.goalId,
        shortTermGoalIndex: modalTarget.goalIndex,
        progress: data.progress,
        progress_notes: data.progress_notes,
        progress_updated_at: data.progress_updated_at,
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error ?? "更新失败");
    }

    setGoals((prev) =>
      prev.map((goal) => {
        if (goal.id !== modalTarget.goalId) return goal;
        const updatedStgs = [...goal.short_term_goals];
        updatedStgs[modalTarget.goalIndex] = result.short_term_goal;
        return { ...goal, short_term_goals: updatedStgs };
      }),
    );

    showToast(`进度已更新为 ${data.progress}（${GOAL_PROGRESS_LABELS[data.progress]}）`);
  }

  async function handleRegenerate() {
    setRegenerateError(null);
    setRegenerating(true);

    try {
      const response = await fetch(`/api/iep/${iep.id}/regenerate`, {
        method: "POST",
      });
      const result = await response.json();

      if (!response.ok) {
        setRegenerateError(result.error ?? "再次生成失败，请稍后再试");
        return;
      }

      const newGoals = result.goals as IepGoalRecord[];
      setGoals(newGoals);
      setExpandedGoals(new Set(newGoals.map((g) => g.id)));
      setRegenerateDialogOpen(false);
      showToast("IEP 已重新生成");
      router.refresh();
    } catch {
      setRegenerateError("网络错误，请检查连接后重试");
    } finally {
      setRegenerating(false);
    }
  }

  const canRegenerate =
    Array.isArray(assessment?.domains) && assessment.domains.length > 0;

  return (
    <div>
      {/* 顶部操作栏 */}
      <div className="no-print mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Link
            href="/dashboard/iep"
            className="text-sm text-zinc-500 transition-colors hover:text-zinc-300"
          >
            ← 返回 IEP 列表
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold text-zinc-100">
              {student?.name ?? "未知学生"}
            </h1>
            <span
              className={`rounded-full border px-3 py-1 text-xs font-medium ${getIepStatusColor(iepStatus)}`}
            >
              {IEP_STATUS_LABELS[iepStatus]}
            </span>
          </div>
          <p className="mt-1 text-sm text-zinc-400">
            {iep.school_year} · {iep.semester} · {iep.start_date} 至{" "}
            {iep.end_date}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setRegenerateDialogOpen(true)}
            disabled={regenerating || !canRegenerate}
            className="rounded-lg border border-amber-800/60 bg-amber-950/30 px-4 py-2 text-sm font-medium text-amber-300 transition-colors hover:bg-amber-950/50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            再次生成
          </button>
          <Link
            href={
              assessment?.assessmentSessionId
                ? `/dashboard/iep/new?studentId=${iep.student_id}&sessionId=${assessment.assessmentSessionId}`
                : `/dashboard/iep/new?studentId=${iep.student_id}`
            }
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
          >
            编辑评估
          </Link>
          <button
            type="button"
            onClick={handleExportPdf}
            disabled={!!exporting}
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800 disabled:opacity-50"
          >
            {exporting === "pdf" ? "导出中…" : "导出 PDF"}
          </button>
          <button
            type="button"
            onClick={handleExportWord}
            disabled={!!exporting}
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800 disabled:opacity-50"
          >
            {exporting === "word" ? "导出中…" : "导出 Word"}
          </button>
          <button
            type="button"
            onClick={handleProgressReport}
            disabled={!!exporting}
            className="rounded-lg border border-emerald-800/60 bg-emerald-950/30 px-4 py-2 text-sm font-medium text-emerald-300 transition-colors hover:bg-emerald-950/50 disabled:opacity-50"
          >
            {exporting === "progress" ? "生成中…" : "生成进度报告"}
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-white"
          >
            打印
          </button>
        </div>
      </div>

      {exportError && (
        <div
          role="alert"
          className="no-print mb-4 rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400"
        >
          {exportError}
        </div>
      )}

      {regenerateError && (
        <div
          role="alert"
          className="no-print mb-4 rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400"
        >
          {regenerateError}
        </div>
      )}

      {regenerating && <RegenerateLoadingOverlay />}

      <RegenerateIepDialog
        open={regenerateDialogOpen}
        loading={regenerating}
        onConfirm={handleRegenerate}
        onCancel={() => setRegenerateDialogOpen(false)}
      />

      <div className="no-print mb-6">
        <ProgressStatsBar stats={progressStats} />
      </div>

      {modalTarget && (
        <ProgressUpdateModal
          open={modalOpen}
          goalContent={modalTarget.content}
          initialGoal={modalTarget.stg}
          onClose={() => setModalOpen(false)}
          onSave={handleProgressSave}
        />
      )}

      {/* 可导出/打印的文档区域 */}
      <div ref={documentRef} className="iep-document space-y-6">
        <header className="pdf-export-header hidden text-center">
          <h1 className="text-2xl font-bold text-black">个别化教育计划（IEP）</h1>
          <p className="mt-2 text-sm text-zinc-700">
            {student?.name ?? "未知学生"} · {iep.school_year} · {iep.semester}
          </p>
        </header>

        {/* 基本信息 */}
        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-zinc-500">
            基本信息
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <InfoItem label="姓名" value={student?.name ?? "—"} />
            <InfoItem label="性别" value={student?.gender ?? "—"} />
            <InfoItem label="年龄" value={calculateAge(student?.birth_date ?? null)} />
            <InfoItem label="学校" value={student?.school ?? "—"} />
            <InfoItem label="年级" value={student?.grade ?? "—"} />
            <InfoItem label="班级" value={student?.class_name ?? "—"} />
            <InfoItem
              label="安置方式"
              value={student ? formatPlacementTypes(student.placement_types) : "—"}
            />
            <InfoItem label="学年" value={iep.school_year} />
            <InfoItem label="学期" value={iep.semester} />
            <InfoItem label="计划起始" value={iep.start_date} />
            <InfoItem label="计划结束" value={iep.end_date} />
            <InfoItem
              label="障碍类型"
              value={
                student
                  ? formatDisabilityTypes(student.disability_types)
                  : "—"
              }
              className="sm:col-span-2"
            />
            {student?.parent_name && (
              <InfoItem label="家长姓名" value={student.parent_name} />
            )}
          </div>
        </section>

        {/* 发展现状评估摘要 */}
        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-zinc-500">
            发展现状评估摘要
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {(assessment.domains ?? []).map((domain) => (
              <div
                key={domain.key}
                className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium text-zinc-100">{domain.name}</h3>
                  {domain.level && (
                    <span className="shrink-0 rounded-full border border-zinc-700 bg-zinc-900 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
                      {domain.level} 级
                    </span>
                  )}
                </div>
                {domain.level && (
                  <>
                    <p className="mt-1 text-xs text-zinc-500">
                      {ASSESSMENT_LEVEL_LABELS[domain.level]}
                    </p>
                    <LevelBar level={domain.level} />
                  </>
                )}
                {domain.description && (
                  <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                    {domain.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 长短期目标 */}
        <section className="space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500">
            长短期目标
          </h2>

          {goals.map((goal) => (
              <article
                key={goal.id}
                className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 print-expand"
              >
                <button
                  type="button"
                  onClick={() => toggleGoal(goal.id)}
                  className="no-print flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-zinc-800/60"
                >
                  <div>
                    <h3 className="font-medium text-zinc-100">
                      {goal.domain_name}
                    </h3>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      现状：{goal.current_level} ·{" "}
                      {goal.short_term_goals.length} 项短期目标
                    </p>
                  </div>
                  <span className="text-zinc-500">
                    {expandedGoals.has(goal.id) ? "−" : "+"}
                  </span>
                </button>

                <div
                  className={`border-t border-zinc-800 px-5 py-4 ${expandedGoals.has(goal.id) ? "block" : "hidden print:block"}`}
                >
                  <p className="hidden text-lg font-medium text-zinc-100 print:block">
                    {goal.domain_name}
                  </p>

                  <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                      长期目标
                    </p>
                    <p className="mt-1 text-sm font-semibold leading-relaxed text-zinc-100">
                      {goal.long_term_goal}
                    </p>
                  </div>

                  <div className="mt-4 space-y-3">
                    {goal.short_term_goals.map((stg, index) => {
                      const progressStatus = getShortTermGoalProgress(stg);

                      return (
                        <div
                          key={index}
                          className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 pl-6"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <p className="flex-1 text-sm text-zinc-200">
                              <span className="mr-2 text-zinc-600">
                                {index + 1}.
                              </span>
                              {stg.content}
                            </p>
                            <div className="flex shrink-0 items-center gap-2">
                              {progressStatus ? (
                                <StatusBadge
                                  status={progressStatus}
                                  label={GOAL_PROGRESS_LABELS[progressStatus]}
                                  className={getProgressStatusColor(progressStatus)}
                                />
                              ) : (
                                <span className="rounded-full border border-zinc-700 px-2.5 py-0.5 text-xs text-zinc-500">
                                  未更新
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() =>
                                  openProgressModal(
                                    goal.id,
                                    index,
                                    stg.content,
                                    stg,
                                  )
                                }
                                className="no-print rounded-lg border border-zinc-700 px-2.5 py-1 text-xs text-zinc-300 transition-colors hover:bg-zinc-800"
                              >
                                更新进度
                              </button>
                            </div>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 pl-5 text-xs text-zinc-500">
                            <span>评量：{stg.assessmentMethod}</span>
                            <span>
                              {stg.startDate} → {stg.endDate}
                            </span>
                            {stg.progress_updated_at && (
                              <span>更新：{stg.progress_updated_at}</span>
                            )}
                          </div>
                          {stg.progress_notes && (
                            <p className="mt-2 pl-5 text-xs italic text-zinc-400">
                              备注：{stg.progress_notes}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </article>
          ))}
        </section>

        {/* 教学决定建议 */}
        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-zinc-500">
            教学决定建议
          </h2>
          <ul className="space-y-2 text-sm leading-relaxed text-zinc-300">
            {teachingSuggestions.map((item, index) => (
              <li key={index} className="flex gap-2">
                <span className="shrink-0 text-zinc-500">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* 签名区域 */}
        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="mb-6 text-sm font-medium uppercase tracking-wide text-zinc-500">
            签名确认
          </h2>
          <div className="grid gap-8 sm:grid-cols-2">
            <SignatureBlock title="班主任签名" />
            <SignatureBlock title="家长签名" />
          </div>
        </section>
      </div>
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

function SignatureBlock({ title }: { title: string }) {
  return (
    <div>
      <p className="text-sm font-medium text-zinc-300">{title}</p>
      <div className="mt-4 border-b border-zinc-700 pb-8" />
      <p className="mt-3 text-xs text-zinc-500">日期：________________</p>
    </div>
  );
}
