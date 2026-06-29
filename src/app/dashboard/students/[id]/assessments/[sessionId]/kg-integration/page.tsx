import Link from "next/link";
import { notFound } from "next/navigation";
import { KgIntegrationForm } from "@/components/assessments/kg-integration-form";
import { loadKgIntegrationAssessmentData } from "@/lib/assessments/load-kg-integration-data";
import { createClient } from "@/lib/supabase/server";
import { calculateStudentAge } from "@/lib/student-utils";
import { formatDisabilityTypes } from "@/lib/types/student";

type KgIntegrationPageProps = {
  params: Promise<{ id: string; sessionId: string }>;
};

export default async function KgIntegrationAssessmentPage({
  params,
}: KgIntegrationPageProps) {
  const { id, sessionId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) notFound();

  const data = await loadKgIntegrationAssessmentData(id, sessionId, user.id);
  if (!data) notFound();

  const { student, session } = data;

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/dashboard/students/${id}/assessments/new`}
          className="text-sm text-zinc-500 hover:text-zinc-300"
        >
          ← 返回选择评估工具
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold text-zinc-100">
            幼儿园融合能力评估
          </h1>
          <span
            className="rounded-full px-2.5 py-0.5 text-xs font-medium"
            style={{ backgroundColor: "rgba(217, 119, 6, 0.15)", color: "#D97706" }}
          >
            {session.status === "completed" ? "已完成" : "进行中"}
          </span>
        </div>
        <p className="mt-1 text-sm text-zinc-400">
          {student.name} · {calculateStudentAge(student.birth_date)} ·{" "}
          {formatDisabilityTypes(student.disability_types)}
        </p>
      </div>

      <KgIntegrationForm
        session={data.session}
        student={data.student}
        activityItems={data.activityItems}
        skillItems={data.skillItems}
        scores={data.scores}
        notes={data.notes}
        behaviorRecords={data.behaviorRecords}
      />
    </div>
  );
}
