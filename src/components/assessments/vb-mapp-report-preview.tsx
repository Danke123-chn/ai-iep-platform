"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import type { VbMappReportData } from "@/lib/vbmapp-report/types";
import { formatDisabilityTypes, formatPlacementTypes } from "@/lib/types/student";
import { levelLabelZh } from "@/lib/vbmapp-report/score-data";

type VbMappReportPreviewProps = {
  studentId: string;
  sessionId: string;
  initialData: VbMappReportData;
};

function formatDateZh(dateStr: string): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`;
}

export function VbMappReportPreview({
  studentId,
  sessionId,
  initialData,
}: VbMappReportPreviewProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState(initialData);
  const [content, setContent] = useState(initialData.reportContent);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState<"word" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const { student, session, domainScores } = data;

  const saveContent = useCallback(async () => {
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/assessments/${sessionId}/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId,
        action: "save",
        content,
      }),
    });
    const result = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setError(result.error ?? "保存失败");
      return;
    }
    setMessage("已保存");
    setTimeout(() => setMessage(null), 2000);
  }, [content, sessionId, studentId]);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    const res = await fetch(`/api/assessments/${sessionId}/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, action: "generate" }),
    });
    const result = await res.json().catch(() => ({}));
    setGenerating(false);
    if (!res.ok) {
      setError(result.error ?? "AI 生成失败");
      return;
    }
    setContent(result.content);
    setData((prev) => ({ ...prev, reportContent: result.content }));
    setMessage("AI 报告解读已生成");
    setTimeout(() => setMessage(null), 3000);
  }

  async function downloadWord() {
    setExporting("word");
    setError(null);
    await saveContent();
    const res = await fetch(
      `/api/assessments/${sessionId}/report?studentId=${studentId}&format=word`,
    );
    setExporting(null);
    if (!res.ok) {
      const result = await res.json().catch(() => ({}));
      setError(result.error ?? "导出失败");
      return;
    }
    const disposition = res.headers.get("Content-Disposition") ?? "";
    const match = disposition.match(/filename\*=UTF-8''(.+)/);
    const filename = match ? decodeURIComponent(match[1]) : "VB-MAPP评估报告.docx";
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating}
          className="rounded-lg bg-[#534AB7] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {generating ? "AI 生成中…" : "AI 生成报告解读"}
        </button>
        <button
          type="button"
          onClick={saveContent}
          disabled={saving}
          className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800 disabled:opacity-50"
        >
          {saving ? "保存中…" : "保存修改"}
        </button>
        <button
          type="button"
          onClick={downloadWord}
          disabled={exporting !== null}
          className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800 disabled:opacity-50"
        >
          {exporting === "word" ? "导出中…" : "导出 Word"}
        </button>
        <Link
          href={`/dashboard/iep/new?studentId=${studentId}&sessionId=${sessionId}`}
          className="rounded-lg border border-emerald-800/50 bg-emerald-950/30 px-4 py-2 text-sm font-medium text-emerald-300 hover:bg-emerald-950/50"
        >
          下一步：生成 IEP →
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}
      {message && (
        <div className="mb-4 rounded-lg border border-emerald-900/50 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-400">
          {message}
        </div>
      )}

      <div
        ref={printRef}
        className="mx-auto max-w-3xl rounded-xl border border-zinc-200 bg-white p-10 text-zinc-900 shadow-lg print:shadow-none"
      >
        <h1 className="text-center text-3xl font-bold tracking-[0.5em] text-zinc-900">
          评 估 报 告
        </h1>
        <div className="mt-8 space-y-3 text-sm leading-relaxed">
          <label className="block">
            <span className="text-zinc-700">评 估 人：</span>
            <input
              type="text"
              value={content.assessorName}
              onChange={(e) =>
                setContent((c) => ({ ...c, assessorName: e.target.value }))
              }
              placeholder="请填写评估人姓名"
              className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-[#534AB7]"
            />
          </label>
          <p>儿童姓名：{student.name}</p>
          <p>评估日期：{formatDateZh(session.session_date)}</p>
        </div>

        <h2 className="mt-10 text-base font-bold" data-pdf-keep-together>
          第一部分  学生基本信息
        </h2>
        <table
          className="mt-3 w-full border-collapse border border-zinc-400 text-xs"
        >
          <tbody>
            <tr>
              <td className="border border-zinc-400 bg-zinc-50 px-2 py-1.5 font-medium">学生姓名</td>
              <td className="border border-zinc-400 px-2 py-1.5">{student.name}</td>
              <td className="border border-zinc-400 bg-zinc-50 px-2 py-1.5 font-medium">学生性别</td>
              <td className="border border-zinc-400 px-2 py-1.5">{student.gender ?? ""}</td>
            </tr>
            <tr>
              <td className="border border-zinc-400 bg-zinc-50 px-2 py-1.5 font-medium">诊断结果</td>
              <td className="border border-zinc-400 px-2 py-1.5" colSpan={3}>
                {formatDisabilityTypes(student.disability_types)}
              </td>
            </tr>
            <tr>
              <td className="border border-zinc-400 bg-zinc-50 px-2 py-1.5 font-medium">目前安置形式</td>
              <td className="border border-zinc-400 px-2 py-1.5" colSpan={3}>
                {formatPlacementTypes(student.placement_types)}
              </td>
            </tr>
          </tbody>
        </table>

        <h2 className="mt-10 text-base font-bold" data-pdf-keep-together>
          第二部分  学生现阶段能力
        </h2>
        <textarea
          rows={6}
          value={content.observationNarrative}
          onChange={(e) =>
            setContent((c) => ({ ...c, observationNarrative: e.target.value }))
          }
          className="mt-3 w-full rounded border border-zinc-300 px-3 py-2 text-sm leading-relaxed outline-none focus:border-[#534AB7]"
        />
        <textarea
          rows={3}
          value={content.overallConclusion}
          onChange={(e) =>
            setContent((c) => ({ ...c, overallConclusion: e.target.value }))
          }
          className="mt-3 w-full rounded border border-zinc-300 px-3 py-2 text-sm leading-relaxed outline-none focus:border-[#534AB7]"
        />

        <h3 className="mt-8 text-sm font-bold" data-pdf-keep-together>
          一、 VB-MAPP 里程碑计分总表
        </h3>
        <div className="mt-4 space-y-4">
          {domainScores.map((row) => (
            <div key={row.domain}>
              <p className="text-sm font-medium text-zinc-800">{row.domainLabel}</p>
              <textarea
                rows={3}
                value={content.domainNarratives[row.domain] ?? ""}
                onChange={(e) =>
                  setContent((c) => ({
                    ...c,
                    domainNarratives: {
                      ...c.domainNarratives,
                      [row.domain]: e.target.value,
                    },
                  }))
                }
                className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 text-sm leading-relaxed outline-none focus:border-[#534AB7]"
              />
            </div>
          ))}
        </div>

        <table
          className="mt-6 w-full border-collapse border border-zinc-400 text-xs"
        >
          <thead>
            <tr className="bg-zinc-50">
              <th className="border border-zinc-400 px-2 py-1.5">领域</th>
              <th className="border border-zinc-400 px-2 py-1.5">L1</th>
              <th className="border border-zinc-400 px-2 py-1.5">L2</th>
              <th className="border border-zinc-400 px-2 py-1.5">L3</th>
              <th className="border border-zinc-400 px-2 py-1.5">1分</th>
              <th className="border border-zinc-400 px-2 py-1.5">1/2</th>
              <th className="border border-zinc-400 px-2 py-1.5">0分</th>
            </tr>
          </thead>
          <tbody>
            {domainScores.map((row) => (
              <tr key={row.domain}>
                <td className="border border-zinc-400 px-2 py-1.5">{row.domainLabel}</td>
                <td className="border border-zinc-400 px-2 py-1.5 text-center">
                  {row.level1Score}/{row.level1Total}
                </td>
                <td className="border border-zinc-400 px-2 py-1.5 text-center">
                  {row.level2Score}/{row.level2Total}
                </td>
                <td className="border border-zinc-400 px-2 py-1.5 text-center">
                  {row.level3Score}/{row.level3Total}
                </td>
                <td className="border border-zinc-400 px-2 py-1.5 text-center">{row.passed}</td>
                <td className="border border-zinc-400 px-2 py-1.5 text-center">{row.partial}</td>
                <td className="border border-zinc-400 px-2 py-1.5 text-center">{row.failed}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div data-pdf-keep-together>
          <h3 className="mt-10 text-sm font-bold">二、  VB-MAPP 障碍积分表</h3>
          <p className="mt-2 text-sm font-medium">障碍评估：</p>
        </div>
        <textarea
          rows={3}
          value={content.barrierNarrative}
          onChange={(e) =>
            setContent((c) => ({ ...c, barrierNarrative: e.target.value }))
          }
          className="mt-2 w-full rounded border border-zinc-300 px-3 py-2 text-sm leading-relaxed outline-none focus:border-[#534AB7]"
        />

        <div data-pdf-keep-together>
          <h3 className="mt-10 text-sm font-bold">三、 VB-MAPP 转衔积分表</h3>
          <p className="mt-2 text-sm font-medium">转衔评估：</p>
        </div>
        <textarea
          rows={3}
          value={content.transitionNarrative}
          onChange={(e) =>
            setContent((c) => ({ ...c, transitionNarrative: e.target.value }))
          }
          className="mt-2 w-full rounded border border-zinc-300 px-3 py-2 text-sm leading-relaxed outline-none focus:border-[#534AB7]"
        />

        <h2 className="mt-10 text-base font-bold" data-pdf-keep-together>
          第五部分  总结与建议
        </h2>
        <textarea
          rows={6}
          value={content.summaryRecommendations}
          onChange={(e) =>
            setContent((c) => ({
              ...c,
              summaryRecommendations: e.target.value,
            }))
          }
          className="mt-3 w-full rounded border border-zinc-300 px-3 py-2 text-sm leading-relaxed outline-none focus:border-[#534AB7]"
        />

        <div className="mt-8 space-y-3">
        <p className="text-xs leading-relaxed text-zinc-600">
          备注：此评估结果是针对评估时学生所展现出的能力为依据所制定的评估报告。如您对评估报告有任何疑问，请联系评估治疗师进行讲解。如您对评估结果没有意见，请签字，谢谢。
        </p>
        <p className="text-sm">评估签字：________________</p>
        <p className="text-sm">家长签字：________________</p>
        <p className="text-xs text-zinc-500">
          能力水平参考：{levelLabelZh(data.dominantLevel)}
        </p>
        </div>
      </div>
    </div>
  );
}
