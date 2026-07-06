"use client";

import type { UploadedReportInterpretation } from "@/lib/uploaded-report/types";

type UploadedReportResultViewProps = {
  interpretation: UploadedReportInterpretation;
};

export function UploadedReportResultView({
  interpretation,
}: UploadedReportResultViewProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-lg font-medium text-zinc-100">上传文件</h2>
        <p className="mt-2 text-sm text-zinc-400">{interpretation.fileName}</p>
        <p className="mt-1 text-xs text-zinc-500">
          识别评估类型：
          {interpretation.detectedToolType === "generic"
            ? "通用评估"
            : interpretation.detectedToolType}
        </p>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-lg font-medium text-zinc-100">AI 评估总结</h2>
        <p className="mt-3 text-sm leading-relaxed text-zinc-300">
          {interpretation.summary}
        </p>
        {interpretation.strengths && (
          <p className="mt-4 text-sm text-zinc-400">
            <span className="font-medium text-zinc-300">优势：</span>
            {interpretation.strengths}
          </p>
        )}
        {interpretation.needs && (
          <p className="mt-2 text-sm text-zinc-400">
            <span className="font-medium text-zinc-300">待支持：</span>
            {interpretation.needs}
          </p>
        )}
      </div>

      {interpretation.reportAnalysis && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-lg font-medium text-zinc-100">详细解读</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-zinc-400">
            {interpretation.reportAnalysis}
          </p>
        </div>
      )}

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-lg font-medium text-zinc-100">
          IEP 预填领域（{interpretation.domains.length}）
        </h2>
        <ul className="mt-4 space-y-3">
          {interpretation.domains.map((domain) => (
            <li
              key={domain.key}
              className="rounded-lg border border-zinc-800 bg-zinc-950/50 px-4 py-3"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-zinc-200">{domain.name}</span>
                {domain.level != null && (
                  <span className="text-xs text-violet-300">
                    {domain.level} 级
                  </span>
                )}
              </div>
              {domain.description && (
                <p className="mt-2 text-sm text-zinc-500">{domain.description}</p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
