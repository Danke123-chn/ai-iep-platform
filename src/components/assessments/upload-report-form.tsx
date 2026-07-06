"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useRef, useState, type DragEvent } from "react";
import {
  UPLOAD_REPORT_ACCEPT,
  UPLOAD_REPORT_MAX_BYTES,
  type UploadedReportInterpretation,
} from "@/lib/uploaded-report/types";
import type { Student } from "@/lib/types/student";

type UploadReportFormProps = {
  student: Student;
  sessionId: string;
  initialInterpretation?: UploadedReportInterpretation | null;
};

export function UploadReportForm({
  student,
  sessionId,
  initialInterpretation = null,
}: UploadReportFormProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [interpretation, setInterpretation] =
    useState<UploadedReportInterpretation | null>(initialInterpretation);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
  }

  function handleDragEnter(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }

  function handleDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    handleFileChange(e.dataTransfer.files?.[0] ?? null);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!file && !interpretation) {
      setError("请选择要上传的评估报告文件");
      return;
    }

    if (!file && interpretation) {
      router.push(
        `/dashboard/iep/new?studentId=${student.id}&sessionId=${sessionId}`,
      );
      return;
    }

    if (!file) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("studentId", student.id);
      formData.append("file", file);

      const res = await fetch(
        `/api/assessments/${sessionId}/upload-report`,
        { method: "POST", body: formData },
      );
      const result = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(result.error ?? "上传或解读失败，请稍后再试");
        setLoading(false);
        return;
      }

      setInterpretation(result.interpretation as UploadedReportInterpretation);
      router.refresh();
    } catch {
      setError("网络错误，请稍后再试");
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(selected: File | null) {
    setError(null);
    if (!selected) {
      setFile(null);
      return;
    }
    if (selected.size > UPLOAD_REPORT_MAX_BYTES) {
      setError("文件大小不能超过 10MB");
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    setFile(selected);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400"
          >
            {error}
          </div>
        )}

        {!interpretation && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-lg font-medium text-zinc-100">上传评估报告</h2>
            <p className="mt-2 text-sm text-zinc-400">
              支持 Word（.docx）、PDF、图片（JPG/PNG/WebP）。上传后 AI
              将自动解读报告内容，并预填 IEP 评估领域。
            </p>

            <div
              role="button"
              tabIndex={0}
              onClick={() => inputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  inputRef.current?.click();
                }
              }}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`mt-6 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 transition-colors ${
                dragOver
                  ? "border-violet-500 bg-violet-950/20"
                  : "border-zinc-700 bg-zinc-950/50 hover:border-violet-500/50 hover:bg-zinc-950"
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept={UPLOAD_REPORT_ACCEPT}
                className="hidden"
                onChange={(e) =>
                  handleFileChange(e.target.files?.[0] ?? null)
                }
              />
              <span className="text-4xl">📄</span>
              <span className="mt-4 text-sm font-medium text-zinc-200">
                {file ? file.name : "点击选择文件或拖拽到此处"}
              </span>
              <span className="mt-2 text-xs text-zinc-500">
                最大 10MB · Word / PDF / 图片
              </span>
            </div>
          </div>
        )}

        {interpretation && (
          <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-medium text-violet-300">
                  AI 报告解读完成
                </h2>
                <p className="mt-1 text-sm text-zinc-400">
                  文件：{interpretation.fileName} · 识别类型：
                  {interpretation.detectedToolType === "generic"
                    ? "通用评估"
                    : interpretation.detectedToolType}
                </p>
              </div>
              <span className="rounded-full bg-emerald-950/40 px-3 py-1 text-xs text-emerald-400">
                已保存
              </span>
            </div>

            <section>
              <h3 className="text-sm font-medium text-zinc-300">评估总结</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                {interpretation.summary}
              </p>
            </section>

            {interpretation.reportAnalysis && (
              <section>
                <h3 className="text-sm font-medium text-zinc-300">详细解读</h3>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-400">
                  {interpretation.reportAnalysis}
                </p>
              </section>
            )}

            <section>
              <h3 className="text-sm font-medium text-zinc-300">
                预填 IEP 领域（{interpretation.domains.length} 项）
              </h3>
              <ul className="mt-3 space-y-2">
                {interpretation.domains.map((domain) => (
                  <li
                    key={domain.key}
                    className="rounded-lg border border-zinc-800 bg-zinc-950/50 px-4 py-3"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-zinc-200">
                        {domain.name}
                      </span>
                      {domain.level != null && (
                        <span className="rounded bg-violet-950/50 px-2 py-0.5 text-xs text-violet-300">
                          {domain.level} 级
                        </span>
                      )}
                    </div>
                    {domain.description && (
                      <p className="mt-2 text-xs leading-relaxed text-zinc-500">
                        {domain.description}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "AI 解读中，请稍候…"
              : interpretation
                ? "下一步：生成 IEP →"
                : "上传并由 AI 解读"}
          </button>

          {interpretation && (
            <Link
              href={`/dashboard/students/${student.id}/assessments/${sessionId}`}
              className="rounded-lg border border-zinc-700 px-5 py-2.5 text-center text-sm text-zinc-300 hover:bg-zinc-800"
            >
              查看评估结果
            </Link>
          )}

          <Link
            href={`/dashboard/students/${student.id}/assessments/new`}
            className="rounded-lg border border-zinc-700 px-5 py-2.5 text-center text-sm text-zinc-300 hover:bg-zinc-800"
          >
            返回工具选择
          </Link>
        </div>
      </form>
    </div>
  );
}
