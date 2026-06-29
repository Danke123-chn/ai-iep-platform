"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import {
  formatDomainScoreLabel,
  getIntegrationReportTitle,
  getIntegrationSchoolLabel,
} from "@/lib/integration-report/domain-rows";
import type { IntegrationReportData } from "@/lib/integration-report/types";
import { ASSESSMENT_TOOL_COLORS } from "@/lib/assessments/assessment-tool-config";

type IntegrationReportPreviewProps = {
  studentId: string;
  sessionId: string;
  initialData: IntegrationReportData;
};

function formatDateZh(dateStr: string): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`;
}

export function IntegrationReportPreview({
  studentId,
  sessionId,
  initialData,
}: IntegrationReportPreviewProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [data] = useState(initialData);
  const [content, setContent] = useState(initialData.reportContent);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState<"word" | "pdf" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const { student, session, domainRows, toolType } = data;
  const accentColor = ASSESSMENT_TOOL_COLORS[toolType];
  const title = getIntegrationReportTitle(toolType);
  const schoolLabel = getIntegrationSchoolLabel(toolType);

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
    const filename = match
      ? decodeURIComponent(match[1])
      : "融合能力评估报告.docx";
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function exportPdf() {
    if (!printRef.current) return;
    setExporting("pdf");
    setError(null);
    await saveContent();
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const prefix =
        toolType === "kg_integration"
          ? "幼儿园融合能力评估报告"
          : "小学融合能力评估报告";
      const filename = `${prefix}-${student.name}-${session.session_date.slice(0, 10)}.pdf`;
      await html2pdf()
        .set({
          margin: [12, 10, 12, 10],
          filename,
          html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(printRef.current)
        .save();
    } catch {
      setError("PDF 导出失败");
    }
    setExporting(null);
  }

  function updateDomainAnalysis(domainKey: string, value: string) {
    setContent((c) => ({
      ...c,
      domainAnalysis: { ...c.domainAnalysis, [domainKey]: value },
    }));
  }

  function updateDomainRecommendation(domainKey: string, value: string) {
    setContent((c) => ({
      ...c,
      domainRecommendations: {
        ...c.domainRecommendations,
        [domainKey]: value,
      },
    }));
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating}
          className="rounded-lg px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: accentColor }}
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
        <button
          type="button"
          onClick={exportPdf}
          disabled={exporting !== null}
          className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800 disabled:opacity-50"
        >
          {exporting === "pdf" ? "导出中…" : "导出 PDF"}
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
        className="mx-auto max-w-4xl rounded-xl border border-zinc-200 bg-white p-10 text-zinc-900 shadow-lg print:shadow-none"
      >
        <h1 className="text-center text-xl font-bold tracking-wide text-zinc-900">
          {title}
        </h1>

        <div className="mt-8 grid gap-3 text-sm sm:grid-cols-2">
          <p>
            <span className="text-zinc-600">学生：</span>
            {student.name}
          </p>
          <p>
            <span className="text-zinc-600">{schoolLabel}：</span>
            {student.school ?? "—"}
          </p>
          <label className="block sm:col-span-2">
            <span className="text-zinc-600">班级：</span>
            <input
              type="text"
              value={content.className}
              onChange={(e) =>
                setContent((c) => ({ ...c, className: e.target.value }))
              }
              placeholder={student.class_name ?? "请填写班级"}
              className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-zinc-600">融合教师：</span>
            <input
              type="text"
              value={content.assessorName}
              onChange={(e) =>
                setContent((c) => ({ ...c, assessorName: e.target.value }))
              }
              placeholder="请填写评估人/融合教师姓名"
              className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
            />
          </label>
          <p>
            <span className="text-zinc-600">评估时间：</span>
            {formatDateZh(session.session_date)}
          </p>
        </div>

        <table className="mt-8 w-full border-collapse border border-zinc-400 text-xs">
          <thead>
            <tr className="bg-zinc-50">
              <th className="border border-zinc-400 px-2 py-2 text-left font-medium">
                领域（得分）
              </th>
              <th className="border border-zinc-400 px-2 py-2 text-left font-medium">
                现状分析
              </th>
              <th className="border border-zinc-400 px-2 py-2 text-left font-medium">
                建议
              </th>
            </tr>
          </thead>
          <tbody>
            {domainRows.map((row) => {
              const isBehavior = row.domainKey === "behavior";
              const analysis = isBehavior
                ? content.behaviorAnalysis
                : (content.domainAnalysis[row.domainKey] ?? "");
              const recommendation = isBehavior
                ? content.behaviorRecommendation
                : (content.domainRecommendations[row.domainKey] ?? "");

              return (
                <tr key={row.domainKey}>
                  <td className="border border-zinc-400 px-2 py-2 align-top font-medium">
                    {formatDomainScoreLabel(row)}
                  </td>
                  <td className="border border-zinc-400 px-2 py-1 align-top">
                    <textarea
                      rows={4}
                      value={analysis}
                      onChange={(e) =>
                        isBehavior
                          ? setContent((c) => ({
                              ...c,
                              behaviorAnalysis: e.target.value,
                            }))
                          : updateDomainAnalysis(row.domainKey, e.target.value)
                      }
                      className="w-full resize-y rounded border border-zinc-200 px-2 py-1 text-xs leading-relaxed outline-none focus:border-zinc-400"
                      placeholder="优势：&#10;弱势："
                    />
                  </td>
                  <td className="border border-zinc-400 px-2 py-1 align-top">
                    <textarea
                      rows={4}
                      value={recommendation}
                      onChange={(e) =>
                        isBehavior
                          ? setContent((c) => ({
                              ...c,
                              behaviorRecommendation: e.target.value,
                            }))
                          : updateDomainRecommendation(
                              row.domainKey,
                              e.target.value,
                            )
                      }
                      className="w-full resize-y rounded border border-zinc-200 px-2 py-1 text-xs leading-relaxed outline-none focus:border-zinc-400"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <p className="mt-8 text-sm">评估签字：________________</p>
        <p className="mt-3 text-sm">家长签字：________________</p>
      </div>
    </div>
  );
}
