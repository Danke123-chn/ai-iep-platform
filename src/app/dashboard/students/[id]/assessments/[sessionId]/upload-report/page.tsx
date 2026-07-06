import Link from "next/link";
import { notFound } from "next/navigation";
import { UploadReportForm } from "@/components/assessments/upload-report-form";
import { parseUploadedReportSummary } from "@/lib/uploaded-report/types";
import { createClient } from "@/lib/supabase/server";
import { calculateStudentAge } from "@/lib/student-utils";
import { formatDisabilityTypes } from "@/lib/types/student";

type UploadReportPageProps = {
  params: Promise<{ id: string; sessionId: string }>;
};

export default async function UploadReportPage({ params }: UploadReportPageProps) {
  const { id, sessionId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: session } = await supabase
    .from("assessment_sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("student_id", id)
    .eq("assessor_id", user.id)
    .single();

  if (!session || session.tool_type !== "uploaded_report") notFound();

  const { data: student } = await supabase
    .from("students")
    .select("*")
    .eq("id", id)
    .single();

  if (!student) notFound();

  const interpretation = parseUploadedReportSummary(session.summary);

  return (
    <div>
      <div className="mb-8">
        <Link
          href={`/dashboard/students/${id}/assessments/new`}
          className="text-sm text-zinc-500 hover:text-zinc-300"
        >
          ← 返回工具选择
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-100">
          上传评估报告
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          {student.name} · {calculateStudentAge(student.birth_date)} ·{" "}
          {formatDisabilityTypes(student.disability_types)}
        </p>
      </div>

      <UploadReportForm
        student={student}
        sessionId={sessionId}
        initialInterpretation={interpretation}
      />
    </div>
  );
}
