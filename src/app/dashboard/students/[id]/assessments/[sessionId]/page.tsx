import Link from "next/link";
import { notFound } from "next/navigation";
import { UploadedReportResultView } from "@/components/assessments/uploaded-report-result-view";
import { Cpep3ResultView } from "@/components/assessments/c-pep3-result-view";
import { KgIntegrationResultView } from "@/components/assessments/kg-integration-result-view";
import { VbMappResultView } from "@/components/assessments/vb-mapp-result-view";
import {
  ASSESSMENT_TOOL_COLORS,
  ASSESSMENT_TOOL_ROUTES,
} from "@/lib/assessments/assessment-tool-config";
import { isIntegrationTool } from "@/lib/assessments/integration-assessment-config";
import {
  loadAssessmentResult,
  type Cpep3ResultData,
  type IntegrationResultData,
  type UploadedReportResultData,
  type VbMappResultData,
} from "@/lib/assessments/load-assessment-result";
import type { AssessmentTool } from "@/lib/types/assessment_types";
import { createClient } from "@/lib/supabase/server";
import { calculateStudentAge } from "@/lib/student-utils";
import { formatDisabilityTypes } from "@/lib/types/student";

type AssessmentSessionPageProps = {
  params: Promise<{ id: string; sessionId: string }>;
};

export default async function AssessmentSessionPage({
  params,
}: AssessmentSessionPageProps) {
  const { id, sessionId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const result = await loadAssessmentResult(id, sessionId, user.id);
  if (!result) notFound();

  const { session, student, toolLabel } = result;
  const toolType = session.tool_type as AssessmentTool;
  const accentColor = ASSESSMENT_TOOL_COLORS[toolType] ?? "#534AB7";
  const formHref = `/dashboard/students/${id}/assessments/${sessionId}/${ASSESSMENT_TOOL_ROUTES[toolType]}`;

  return (
    <div>
      <div className="mb-8">
        <Link
          href={`/dashboard/students/${id}/assessments/new`}
          className="text-sm text-zinc-500 hover:text-zinc-300"
        >
          ← 返回评估列表
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold text-zinc-100">
            {toolLabel} 评估结果
          </h1>
          <span
            className="rounded-full px-2.5 py-0.5 text-xs font-medium"
            style={{
              backgroundColor: `${accentColor}33`,
              color: accentColor,
            }}
          >
            {session.status === "completed" ? "已完成" : "进行中"}
          </span>
        </div>
        <p className="mt-1 text-sm text-zinc-400">
          {student.name} · {calculateStudentAge(student.birth_date)} ·{" "}
          {formatDisabilityTypes(student.disability_types)} · {session.session_date}
        </p>
      </div>

      {session.tool_type === "uploaded_report" && (
        <UploadedReportResultView
          interpretation={(result as UploadedReportResultData).interpretation}
        />
      )}
      {session.tool_type === "vb_mapp" && (
        <VbMappResultView data={result as VbMappResultData} />
      )}
      {session.tool_type === "c_pep3" && (
        <Cpep3ResultView data={result as Cpep3ResultData} />
      )}
      {isIntegrationTool(toolType) && (
        <KgIntegrationResultView data={result as IntegrationResultData} />
      )}

      <div className="mt-10 flex flex-col gap-3 border-t border-zinc-800 pt-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/dashboard/students"
            className="rounded-lg border border-zinc-700 px-4 py-2.5 text-center text-sm text-zinc-300 hover:bg-zinc-800"
          >
            返回学生列表
          </Link>
          {session.status === "in_progress" && session.tool_type !== "uploaded_report" && (
            <Link
              href={formHref}
              className="rounded-lg border border-zinc-700 px-4 py-2.5 text-center text-sm text-zinc-300 hover:bg-zinc-800"
            >
              继续评估
            </Link>
          )}
          {session.status === "in_progress" &&
            session.tool_type === "uploaded_report" && (
              <Link
                href={formHref}
                className="rounded-lg border border-zinc-700 px-4 py-2.5 text-center text-sm text-zinc-300 hover:bg-zinc-800"
              >
                继续上传报告
              </Link>
            )}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          {(session.tool_type === "vb_mapp" ||
            session.tool_type === "c_pep3" ||
            isIntegrationTool(toolType)) &&
            session.status === "completed" && (
            <Link
              href={`/dashboard/students/${id}/assessments/${sessionId}/report`}
              className="rounded-lg px-5 py-2.5 text-center text-sm font-medium text-white hover:opacity-90"
              style={{ backgroundColor: accentColor }}
            >
              查看 / 导出评估报告
            </Link>
          )}
          {session.status === "completed" && (
            <Link
              href={`/dashboard/iep/new?studentId=${id}&sessionId=${sessionId}`}
              className="rounded-lg border border-zinc-600 px-5 py-2.5 text-center text-sm font-medium text-zinc-200 hover:bg-zinc-800"
            >
              下一步：生成 IEP
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
