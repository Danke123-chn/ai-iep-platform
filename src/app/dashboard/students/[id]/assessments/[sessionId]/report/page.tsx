import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Cpep3ReportPreview } from "@/components/assessments/c-pep3-report-preview";
import { IntegrationReportPreview } from "@/components/assessments/integration-report-preview";
import { VbMappReportPreview } from "@/components/assessments/vb-mapp-report-preview";
import { ASSESSMENT_TOOL_ROUTES } from "@/lib/assessments/assessment-tool-config";
import { isIntegrationTool, getIntegrationConfig } from "@/lib/assessments/integration-assessment-config";
import { loadCpep3ReportData } from "@/lib/cpep3-report";
import { loadIntegrationReportData } from "@/lib/integration-report";
import { loadVbMappReportData } from "@/lib/vbmapp-report";
import { createClient } from "@/lib/supabase/server";
import type { AssessmentTool } from "@/lib/types/assessment_types";

type AssessmentReportPageProps = {
  params: Promise<{ id: string; sessionId: string }>;
};

export default async function AssessmentReportPage({
  params,
}: AssessmentReportPageProps) {
  const { id, sessionId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: session } = await supabase
    .from("assessment_sessions")
    .select("tool_type, status")
    .eq("id", sessionId)
    .eq("student_id", id)
    .eq("assessor_id", user.id)
    .single();

  if (!session) notFound();

  const toolType = session.tool_type as AssessmentTool;
  const formPath = `/dashboard/students/${id}/assessments/${sessionId}/${ASSESSMENT_TOOL_ROUTES[toolType]}`;

  if (session.status !== "completed") {
    redirect(formPath);
  }

  if (toolType === "uploaded_report") {
    redirect(`/dashboard/students/${id}/assessments/${sessionId}`);
  }

  if (toolType === "c_pep3") {
    const data = await loadCpep3ReportData(id, sessionId, user.id);
    if (!data) notFound();

    return (
      <div>
        <div className="mb-8">
          <Link
            href={`/dashboard/students/${id}/assessments/${sessionId}`}
            className="text-sm text-zinc-500 hover:text-zinc-300"
          >
            ← 返回评估结果
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-zinc-100">
            C-PEP-3 评估报告
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            {data.student.name} · 评估日期 {data.session.session_date}
          </p>
          <p className="mt-2 text-xs text-zinc-500">
            格式参照 PEP-3 标准评估报告（评估总结、发展/病理领域计分、教育训练纲要）。确认后可导出 Word，再进入 IEP 生成。
          </p>
        </div>

        <Cpep3ReportPreview
          studentId={id}
          sessionId={sessionId}
          initialData={data}
        />
      </div>
    );
  }

  if (isIntegrationTool(toolType)) {
    const data = await loadIntegrationReportData(id, sessionId, user.id);
    if (!data) notFound();

    const config = getIntegrationConfig(toolType);

    return (
      <div>
        <div className="mb-8">
          <Link
            href={`/dashboard/students/${id}/assessments/${sessionId}`}
            className="text-sm text-zinc-500 hover:text-zinc-300"
          >
            ← 返回评估结果
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-zinc-100">
            {config.title}报告
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            {data.student.name} · 评估日期 {data.session.session_date}
          </p>
          <p className="mt-2 text-xs text-zinc-500">
            格式参照融合能力评估报告模板（各领域得分、现状分析、融合教育建议）。确认后可导出 Word，再进入 IEP 生成。
          </p>
        </div>

        <IntegrationReportPreview
          studentId={id}
          sessionId={sessionId}
          initialData={data}
        />
      </div>
    );
  }

  if (toolType === "vb_mapp") {
    const data = await loadVbMappReportData(id, sessionId, user.id);
    if (!data) notFound();

    return (
      <div>
        <div className="mb-8">
          <Link
            href={`/dashboard/students/${id}/assessments/${sessionId}`}
            className="text-sm text-zinc-500 hover:text-zinc-300"
          >
            ← 返回评估结果
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-zinc-100">
            VB-MAPP 评估报告
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            {data.student.name} · 评估日期 {data.session.session_date}
          </p>
          <p className="mt-2 text-xs text-zinc-500">
            格式参照 VB-MAPP 评估报告（第一、二、五部分）。确认后可导出 Word，再进入 IEP 生成。
          </p>
        </div>

        <VbMappReportPreview
          studentId={id}
          sessionId={sessionId}
          initialData={data}
        />
      </div>
    );
  }

  notFound();
}
