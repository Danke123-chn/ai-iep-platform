import Link from "next/link";
import { StudentForm } from "@/components/students/student-form";
import { getToolLabel } from "@/lib/assessments/assessment-tool-config";
import type { AssessmentTool } from "@/lib/types/assessment_types";

const VALID_TOOLS: AssessmentTool[] = [
  "vb_mapp",
  "c_pep3",
  "kg_integration",
  "elem_integration",
];

function parseToolParam(value: string | undefined): AssessmentTool | undefined {
  if (!value || !VALID_TOOLS.includes(value as AssessmentTool)) {
    return undefined;
  }
  return value as AssessmentTool;
}

type NewStudentPageProps = {
  searchParams: Promise<{ tool?: string }>;
};

export default async function NewStudentPage({
  searchParams,
}: NewStudentPageProps) {
  const { tool: toolParam } = await searchParams;
  const tool = parseToolParam(toolParam);

  return (
    <div>
      <div className="mb-8">
        {tool ? (
          <Link
            href="/dashboard"
            className="text-sm text-zinc-500 transition-colors hover:text-zinc-300"
          >
            ← 返回工具选择
          </Link>
        ) : null}
        <h1 className={`${tool ? "mt-2" : ""} text-2xl font-semibold text-zinc-100`}>
          添加学生
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          {tool
            ? `填写学生基本信息后，将自动进入 ${getToolLabel(tool)} 评估`
            : "填写学生基本信息，建立档案"}
        </p>
      </div>
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
        <StudentForm
          mode="create"
          afterCreateTool={tool}
          cancelHref={tool ? "/dashboard" : "/dashboard/students"}
        />
      </div>
    </div>
  );
}
