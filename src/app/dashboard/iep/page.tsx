import { IepList } from "@/components/iep/iep-list";
import { createClient } from "@/lib/supabase/server";
import { getShortTermGoalProgress } from "@/lib/iep-progress";
import type { IepListItem } from "@/types/iep";
import type { IepGoalRecord } from "@/types/iep";
import type { Student } from "@/lib/types/student";

export default async function IepListPage() {
  const supabase = await createClient();

  const { data: ieps } = await supabase
    .from("ieps")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: students } = await supabase
    .from("students")
    .select("id, name")
    .order("name", { ascending: true });

  const studentMap = new Map(
    (students ?? []).map((s) => [s.id, s.name as string]),
  );

  const iepIds = (ieps ?? []).map((i) => i.id);
  let goalsByIep = new Map<string, IepGoalRecord[]>();

  if (iepIds.length > 0) {
    const { data: allGoals } = await supabase
      .from("iep_goals")
      .select("*")
      .in("iep_id", iepIds);

    for (const goal of (allGoals ?? []) as IepGoalRecord[]) {
      const list = goalsByIep.get(goal.iep_id) ?? [];
      list.push(goal);
      goalsByIep.set(goal.iep_id, list);
    }
  }

  const items: IepListItem[] = (ieps ?? []).map((iep) => {
    const goals = goalsByIep.get(iep.id) ?? [];
    let total = 0;
    let completed = 0;

    for (const goal of goals) {
      for (const stg of goal.short_term_goals) {
        total += 1;
        if (getShortTermGoalProgress(stg) === "P") completed += 1;
      }
    }

    return {
      id: iep.id,
      student_id: iep.student_id,
      student_name: studentMap.get(iep.student_id) ?? "未知学生",
      school_year: iep.school_year,
      semester: iep.semester,
      start_date: iep.start_date,
      end_date: iep.end_date,
      generated_at: iep.generated_at,
      total_goals: total,
      completed_count: completed,
    };
  });

  const schoolYears = [...new Set(items.map((i) => i.school_year))].sort().reverse();

  return (
    <IepList
      items={items}
      students={(students ?? []) as Pick<Student, "id" | "name">[]}
      schoolYears={schoolYears}
    />
  );
}
