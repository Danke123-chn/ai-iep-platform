import { IepAssessmentForm } from "@/components/iep/iep-assessment-form";
import { loadAssessmentForIep } from "@/lib/assessments/load-assessment-for-iep";
import { createClient } from "@/lib/supabase/server";
import type { Student } from "@/lib/types/student";

type PageProps = {
  searchParams: Promise<{ studentId?: string; sessionId?: string }>;
};

export default async function NewIepPage({ searchParams }: PageProps) {
  const { studentId, sessionId } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("students")
    .select("*")
    .order("name", { ascending: true });

  const students = (error ? [] : data ?? []) as Student[];

  let assessmentPrefill = null;
  if (studentId && sessionId && user) {
    assessmentPrefill = await loadAssessmentForIep(
      studentId,
      sessionId,
      user.id,
    );
  }

  return (
    <IepAssessmentForm
      students={students}
      defaultStudentId={studentId}
      assessmentPrefill={assessmentPrefill}
    />
  );
}
