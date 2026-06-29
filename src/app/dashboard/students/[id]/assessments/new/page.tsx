import Link from "next/link";
import { notFound } from "next/navigation";
import { AssessmentToolSelector } from "@/components/assessments/assessment-tool-selector";
import { loadInProgressSessions } from "@/lib/assessments/load-in-progress-sessions";
import { createClient } from "@/lib/supabase/server";
import type { Student } from "@/lib/types/student";

type NewAssessmentPageProps = {
  params: Promise<{ id: string }>;
};

export default async function NewAssessmentPage({ params }: NewAssessmentPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !data) {
    notFound();
  }

  const student = data as Student;
  const inProgressSessions = await loadInProgressSessions(id, user.id);

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/dashboard/students"
          className="text-sm text-zinc-500 transition-colors hover:text-zinc-300"
        >
          ← 返回学生列表
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-100">
          新建专业评估
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          为 {student.name} 选择 VB-MAPP、C-PEP-3、幼儿园或小学融合能力评估
        </p>
      </div>

      <AssessmentToolSelector
        student={student}
        inProgressSessions={inProgressSessions}
      />
    </div>
  );
}
