"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import type { Cpep3ReportData } from "@/lib/cpep3-report/types";
import { formatDisabilityTypes, formatPlacementTypes } from "@/lib/types/student";
import { calculateStudentAge } from "@/lib/student-utils";

type Cpep3ReportPreviewProps = {
  studentId: string;
  sessionId: string;
  initialData: Cpep3ReportData;
};

function formatDateZh(dateStr: string): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`;
}

export function Cpep3ReportPreview({
  studentId,
  sessionId,
  initialData,
}: Cpep3ReportPreviewProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [data] = useState(initialData);
  const [content, setContent] = useState(initialData.reportContent);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState<"word" | "pdf" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const { student, session, devSummary, patSummary } = data;

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
    const filename = match ? decodeURIComponent(match[1]) : "C-PEP-3评估报告.docx";
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
      const filename = `C-PEP-3评估报告-${student.name}-${session.session_date.slice(0, 10)}.pdf`;
      await html2pdf()
        .set({
          margin: [15, 12, 15, 12],
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
        className="mx-auto max-w-3xl rounded-xl border border-zinc-200 bg-white p-10 text-zinc-900 shadow-lg print:shadow-none"
      >
        <h1 className="text-center text-2xl font-bold tracking-wide text-zinc-900">
          C-PEP-3 评 估 报 告
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
          <p>
            出生日期：
            {student.birth_date
              ? formatDateZh(student.birth_date)
              : "—"}
          </p>
          <p>实际年龄：{calculateStudentAge(student.birth_date)}</p>
          <p>评估日期：{formatDateZh(session.session_date)}</p>
        </div>

        <h2 className="mt-10 text-base font-bold">第一部分  学生基本信息</h2>
        <table className="mt-3 w-full border-collapse border border-zinc-400 text-xs">
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

        <h2 className="mt-10 text-base font-bold">第二部分  评估总结</h2>
        <textarea
          rows={5}
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
        <p className="mt-4 text-sm font-medium text-zinc-800">优势与待加强领域</p>
        <textarea
          rows={2}
          value={content.strengthWeaknessSummary}
          onChange={(e) =>
            setContent((c) => ({
              ...c,
              strengthWeaknessSummary: e.target.value,
            }))
          }
          className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 text-sm leading-relaxed outline-none focus:border-[#534AB7]"
        />

        <h2 className="mt-10 text-base font-bold">第三部分  发展领域计分总表</h2>
        <div className="mt-4 space-y-4">
          {devSummary.map((row) => (
            <div key={row.domain}>
              <p className="text-sm font-medium text-zinc-800">{row.domain_label_zh}</p>
              <textarea
                rows={2}
                value={content.devDomainNarratives[row.domain] ?? ""}
                onChange={(e) =>
                  setContent((c) => ({
                    ...c,
                    devDomainNarratives: {
                      ...c.devDomainNarratives,
                      [row.domain]: e.target.value,
                    },
                  }))
                }
                className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 text-sm leading-relaxed outline-none focus:border-[#534AB7]"
              />
            </div>
          ))}
        </div>
        <table className="mt-6 w-full border-collapse border border-zinc-400 text-xs">
          <thead>
            <tr className="bg-zinc-50">
              <th className="border border-zinc-400 px-2 py-1.5">领域</th>
              <th className="border border-zinc-400 px-2 py-1.5">P</th>
              <th className="border border-zinc-400 px-2 py-1.5">E</th>
              <th className="border border-zinc-400 px-2 py-1.5">F</th>
              <th className="border border-zinc-400 px-2 py-1.5">NT</th>
              <th className="border border-zinc-400 px-2 py-1.5">通过率</th>
            </tr>
          </thead>
          <tbody>
            {devSummary.map((row) => (
              <tr key={row.domain}>
                <td className="border border-zinc-400 px-2 py-1.5">{row.domain_label_zh}</td>
                <td className="border border-zinc-400 px-2 py-1.5 text-center">{row.passed_count}</td>
                <td className="border border-zinc-400 px-2 py-1.5 text-center">{row.emerging_count}</td>
                <td className="border border-zinc-400 px-2 py-1.5 text-center">{row.failed_count}</td>
                <td className="border border-zinc-400 px-2 py-1.5 text-center">{row.not_tested_count}</td>
                <td className="border border-zinc-400 px-2 py-1.5 text-center">
                  {Math.round(Number(row.pass_rate ?? 0))}%
                </td>
              </tr>
            ))}
            <tr className="bg-zinc-50 font-medium">
              <td className="border border-zinc-400 px-2 py-1.5">合计</td>
              <td className="border border-zinc-400 px-2 py-1.5 text-center">{data.devTotalPassed}</td>
              <td className="border border-zinc-400 px-2 py-1.5 text-center">{data.devTotalEmerging}</td>
              <td className="border border-zinc-400 px-2 py-1.5 text-center">{data.devTotalFailed}</td>
              <td className="border border-zinc-400 px-2 py-1.5 text-center">{data.devTotalNotTested}</td>
              <td className="border border-zinc-400 px-2 py-1.5" />
            </tr>
          </tbody>
        </table>

        <h2 className="mt-10 text-base font-bold">第四部分  病理/行为表现计分总表</h2>
        <div className="mt-4 space-y-4">
          {patSummary.map((row) => (
            <div key={row.domain}>
              <p className="text-sm font-medium text-zinc-800">{row.domain_label_zh}</p>
              <textarea
                rows={2}
                value={content.patDomainNarratives[row.domain] ?? ""}
                onChange={(e) =>
                  setContent((c) => ({
                    ...c,
                    patDomainNarratives: {
                      ...c.patDomainNarratives,
                      [row.domain]: e.target.value,
                    },
                  }))
                }
                className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 text-sm leading-relaxed outline-none focus:border-[#534AB7]"
              />
            </div>
          ))}
        </div>
        <table className="mt-6 w-full border-collapse border border-zinc-400 text-xs">
          <thead>
            <tr className="bg-zinc-50">
              <th className="border border-zinc-400 px-2 py-1.5">领域</th>
              <th className="border border-zinc-400 px-2 py-1.5">A</th>
              <th className="border border-zinc-400 px-2 py-1.5">M</th>
              <th className="border border-zinc-400 px-2 py-1.5">S</th>
              <th className="border border-zinc-400 px-2 py-1.5">NT</th>
              <th className="border border-zinc-400 px-2 py-1.5">异常比例</th>
            </tr>
          </thead>
          <tbody>
            {patSummary.map((row) => {
              const tested =
                Number(row.appropriate_count) +
                Number(row.mild_count) +
                Number(row.severe_count);
              const abnormal = Number(row.mild_count) + Number(row.severe_count);
              const rate = tested > 0 ? Math.round((abnormal / tested) * 100) : null;
              return (
                <tr key={row.domain}>
                  <td className="border border-zinc-400 px-2 py-1.5">{row.domain_label_zh}</td>
                  <td className="border border-zinc-400 px-2 py-1.5 text-center">{row.appropriate_count}</td>
                  <td className="border border-zinc-400 px-2 py-1.5 text-center">{row.mild_count}</td>
                  <td className="border border-zinc-400 px-2 py-1.5 text-center">{row.severe_count}</td>
                  <td className="border border-zinc-400 px-2 py-1.5 text-center">{row.not_tested_count}</td>
                  <td className="border border-zinc-400 px-2 py-1.5 text-center">
                    {rate === null ? "—" : `${rate}%`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <h2 className="mt-10 text-base font-bold">第五部分  教育训练纲要与家长信息</h2>
        <p className="mt-3 text-sm font-medium text-zinc-800">教育训练纲要</p>
        <textarea
          rows={4}
          value={content.trainingOutline}
          onChange={(e) =>
            setContent((c) => ({ ...c, trainingOutline: e.target.value }))
          }
          className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 text-sm leading-relaxed outline-none focus:border-[#534AB7]"
        />
        <p className="mt-4 text-sm font-medium text-zinc-800">受试者合作程度</p>
        <textarea
          rows={2}
          value={content.cooperationLevel}
          onChange={(e) =>
            setContent((c) => ({ ...c, cooperationLevel: e.target.value }))
          }
          className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 text-sm leading-relaxed outline-none focus:border-[#534AB7]"
        />
        <p className="mt-4 text-sm font-medium text-zinc-800">家庭养育环境及家长期望</p>
        <textarea
          rows={3}
          value={content.familyExpectations}
          onChange={(e) =>
            setContent((c) => ({ ...c, familyExpectations: e.target.value }))
          }
          className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 text-sm leading-relaxed outline-none focus:border-[#534AB7]"
        />

        <h2 className="mt-10 text-base font-bold">第六部分  总结与建议</h2>
        <textarea
          rows={5}
          value={content.summaryRecommendations}
          onChange={(e) =>
            setContent((c) => ({
              ...c,
              summaryRecommendations: e.target.value,
            }))
          }
          className="mt-3 w-full rounded border border-zinc-300 px-3 py-2 text-sm leading-relaxed outline-none focus:border-[#534AB7]"
        />

        <p className="mt-8 text-xs leading-relaxed text-zinc-600">
          备注：此评估结果是针对评估时学生所展现出的能力为依据所制定的评估报告。如您对评估报告有任何疑问，请联系评估师进行讲解。
        </p>
        <p className="mt-6 text-sm">评估签字：________________</p>
        <p className="mt-3 text-sm">家长签字：________________</p>
      </div>
    </div>
  );
}
