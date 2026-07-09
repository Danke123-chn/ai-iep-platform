"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useRef, useState, type DragEvent } from "react";
import {
  UPLOAD_REPORT_ACCEPT,
  UPLOAD_REPORT_MAX_BYTES,
  type UploadedReportInterpretation,
} from "@/lib/uploaded-report/types";

type UploadResult = {
  studentId: string;
  sessionId: string;
  interpretation: UploadedReportInterpretation;
};

export function UploadReportGettingStartedForm() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);
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

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!file) {
      setError("请选择要上传的评估报告文件");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload-report", {
        method: "POST",
        body: formData,
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? "上传或解读失败，请稍后再试");
        setLoading(false);
        return;
      }

      setResult(data as UploadResult);
      router.refresh();
    } catch {
      setError("网络错误，请稍后再试");
    } finally {
      setLoading(false);
    }
  }

  const profile = result?.interpretation.studentProfile;

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

        {!result && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-lg font-medium text-zinc-100">上传评估报告</h2>
            <p className="mt-2 text-sm text-zinc-400">
              支持 Word（.docx）、PDF、图片（JPG/PNG/WebP）。上传后 AI
              将自动识别学生信息并建立档案，同时解读报告内容以预填 IEP 评估领域。
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

        {result && profile && (
          <div className="space-y-4">
            <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-6">
              <h2 className="text-lg font-medium text-emerald-300">
                学生档案已自动创建
              </h2>
              <p className="mt-2 text-sm text-zinc-400">
                AI 已从报告中提取以下信息。如有不准确，可在生成 IEP
                前前往编辑完善。
              </p>
              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-zinc-500">姓名</dt>
                  <dd className="mt-1 text-zinc-100">{profile.name}</dd>
                </div>
                {profile.gender && (
                  <div>
                    <dt className="text-xs text-zinc-500">性别</dt>
                    <dd className="mt-1 text-zinc-200">{profile.gender}</dd>
                  </div>
                )}
                {profile.birth_date && (
                  <div>
                    <dt className="text-xs text-zinc-500">出生日期</dt>
                    <dd className="mt-1 text-zinc-200">{profile.birth_date}</dd>
                  </div>
                )}
                {profile.disability_types.length > 0 && (
                  <div>
                    <dt className="text-xs text-zinc-500">障碍类型</dt>
                    <dd className="mt-1 text-zinc-200">
                      {profile.disability_types.join("、")}
                    </dd>
                  </div>
                )}
                {profile.school && (
                  <div>
                    <dt className="text-xs text-zinc-500">学校</dt>
                    <dd className="mt-1 text-zinc-200">{profile.school}</dd>
                  </div>
                )}
                {profile.grade && (
                  <div>
                    <dt className="text-xs text-zinc-500">年级</dt>
                    <dd className="mt-1 text-zinc-200">{profile.grade}</dd>
                  </div>
                )}
              </dl>
              <Link
                href={`/dashboard/students/${result.studentId}/edit`}
                className="mt-4 inline-block text-sm text-violet-400 hover:text-violet-300"
              >
                编辑学生档案 →
              </Link>
            </div>

            <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
              <div>
                <h2 className="text-lg font-medium text-violet-300">
                  AI 报告解读完成
                </h2>
                <p className="mt-1 text-sm text-zinc-400">
                  文件：{result.interpretation.fileName}
                </p>
              </div>

              <section>
                <h3 className="text-sm font-medium text-zinc-300">评估总结</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  {result.interpretation.summary}
                </p>
              </section>

              <section>
                <h3 className="text-sm font-medium text-zinc-300">
                  预填 IEP 领域（{result.interpretation.domains.length} 项）
                </h3>
                <ul className="mt-3 space-y-2">
                  {result.interpretation.domains.slice(0, 5).map((domain) => (
                    <li
                      key={domain.key}
                      className="rounded-lg border border-zinc-800 bg-zinc-950/50 px-4 py-3 text-sm text-zinc-400"
                    >
                      {domain.name}
                      {domain.level != null && (
                        <span className="ml-2 text-xs text-violet-300">
                          {domain.level} 级
                        </span>
                      )}
                    </li>
                  ))}
                  {result.interpretation.domains.length > 5 && (
                    <li className="text-xs text-zinc-500">
                      另有 {result.interpretation.domains.length - 5}{" "}
                      个领域…
                    </li>
                  )}
                </ul>
              </section>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          {!result && (
            <button
              type="submit"
              disabled={loading || !file}
              className="rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "AI 解读中，请稍候…" : "上传并由 AI 建立档案"}
            </button>
          )}

          {result && (
            <Link
              href={`/dashboard/iep/new?studentId=${result.studentId}&sessionId=${result.sessionId}`}
              className="rounded-lg bg-violet-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-violet-500"
            >
              下一步：生成 IEP →
            </Link>
          )}

          <Link
            href="/dashboard"
            className="rounded-lg border border-zinc-700 px-5 py-2.5 text-center text-sm text-zinc-300 hover:bg-zinc-800"
          >
            返回工具选择
          </Link>
        </div>
      </form>
    </div>
  );
}
