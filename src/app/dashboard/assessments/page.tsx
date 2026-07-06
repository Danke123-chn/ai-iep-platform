import { AssessmentReportList } from "@/components/assessments/assessment-report-list";
import { buildAssessmentReportListItem } from "@/lib/assessments/assessment-report-utils";
import { createClient } from "@/lib/supabase/server";
import type { AssessmentTool } from "@/lib/types/assessment_types";
import type { Student } from "@/lib/types/student";

export default async function AssessmentReportListPage() {
  const supabase = await createClient();

  const { data: sessions } = await supabase
    .from("assessment_sessions")
    .select("id, student_id, tool_type, session_date, updated_at")
    .eq("status", "completed")
    .order("session_date", { ascending: false })
    .order("updated_at", { ascending: false });

  const { data: students } = await supabase
    .from("students")
    .select("id, name")
    .order("name", { ascending: true });

  const studentMap = new Map(
    (students ?? []).map((s) => [s.id, s.name as string]),
  );

  const items = (sessions ?? []).map((session) =>
    buildAssessmentReportListItem(
      {
        id: session.id,
        student_id: session.student_id,
        tool_type: session.tool_type as AssessmentTool,
        session_date: session.session_date,
        updated_at: session.updated_at,
      },
      studentMap.get(session.student_id) ?? "未知学生",
    ),
  );

  return (
    <AssessmentReportList
      items={items}
      students={(students ?? []) as Pick<Student, "id" | "name">[]}
    />
  );
}
