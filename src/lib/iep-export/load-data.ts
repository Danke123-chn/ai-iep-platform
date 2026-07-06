import { createClient } from "@/lib/supabase/server";
import type { IepExportData } from "@/lib/iep-export/types";
import type { IepGoalRecord, IepRecord } from "@/types/iep";
import type { Student } from "@/lib/types/student";

export { getIepExportFilename, getProgressReportFilename } from "@/lib/iep-export/filenames";

export async function loadIepExportData(
  iepId: string,
): Promise<IepExportData | null> {
  const supabase = await createClient();

  const { data: iep, error: iepError } = await supabase
    .from("ieps")
    .select("*")
    .eq("id", iepId)
    .single();

  if (iepError || !iep) return null;

  const { data: student } = await supabase
    .from("students")
    .select("*")
    .eq("id", iep.student_id)
    .single();

  const { data: goals } = await supabase
    .from("iep_goals")
    .select("*")
    .eq("iep_id", iepId)
    .order("sort_order", { ascending: true });

  return {
    iep: iep as IepRecord,
    student: (student as Student) ?? null,
    goals: (goals ?? []) as IepGoalRecord[],
  };
}
