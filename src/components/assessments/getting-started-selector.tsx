"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ASSESSMENT_TOOLS, type AssessmentTool } from "@/lib/types/assessment_types";

export function GettingStartedSelector() {
  const router = useRouter();
  const [loadingTool, setLoadingTool] = useState<AssessmentTool | null>(null);

  function handleSelectTool(toolType: AssessmentTool) {
    if (loadingTool) return;
    setLoadingTool(toolType);

    if (toolType === "uploaded_report") {
      router.push("/dashboard/upload-report");
      return;
    }

    router.push(`/dashboard/students/new?tool=${toolType}`);
  }

  return (
    <div>
      <div>
        <h2 className="text-lg font-medium text-zinc-100">选择评估工具</h2>
        <p className="mt-1 text-sm text-zinc-400">
          请选择适合该学生的标准化评估量表
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ASSESSMENT_TOOLS.map((tool) => {
            const isLoading = loadingTool === tool.value;

            return (
              <button
                key={tool.value}
                type="button"
                disabled={!!loadingTool}
                onClick={() => handleSelectTool(tool.value)}
                className={`group relative flex flex-col rounded-xl border-2 p-6 text-left transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                  isLoading
                    ? "border-white/40 ring-2 ring-white/20"
                    : "border-zinc-800 hover:border-zinc-600 hover:shadow-lg hover:shadow-black/20"
                }`}
                style={{
                  background: `linear-gradient(135deg, ${tool.color}22 0%, rgb(24 24 27) 60%)`,
                }}
              >
                <div
                  className={`mb-4 inline-flex size-12 items-center justify-center rounded-lg font-bold text-white ${
                    tool.iconLabel.length > 2
                      ? "text-[10px] leading-tight"
                      : "text-lg"
                  }`}
                  style={{ backgroundColor: tool.color }}
                >
                  {tool.iconLabel}
                </div>

                <h3 className="text-xl font-semibold text-zinc-100">
                  {tool.label}
                </h3>
                <p className="mt-1 text-sm font-medium text-zinc-300">
                  {tool.fullNameZh}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                  {tool.description}
                </p>

                <ul className="mt-4 space-y-1">
                  {tool.sections.map((section) => (
                    <li
                      key={section}
                      className="flex items-center gap-2 text-xs text-zinc-500"
                    >
                      <span
                        className="size-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: tool.color }}
                      />
                      {section}
                    </li>
                  ))}
                </ul>

                <p className="mt-4 text-xs text-zinc-500">
                  适用年龄：{tool.ageRange}
                </p>

                {isLoading && (
                  <span className="absolute right-4 top-4 text-xs text-zinc-400">
                    跳转中…
                  </span>
                )}

                <span
                  className="mt-6 inline-flex items-center text-sm font-medium text-zinc-300 transition-colors group-hover:text-white"
                  style={{ color: isLoading ? tool.color : undefined }}
                >
                  {isLoading
                    ? "正在进入…"
                    : tool.value === "uploaded_report"
                      ? "继续上传 →"
                      : "开始评估 →"}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
