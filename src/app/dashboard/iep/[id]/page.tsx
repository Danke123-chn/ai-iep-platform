import { IepDetailView } from "@/components/iep/iep-detail-view";
import { createClient } from "@/lib/supabase/server";
import type { IepGoalRecord, IepRecord } from "@/types/iep";
import type { Student } from "@/lib/types/student";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function IepDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: iep, error: iepError } = await supabase
    .from("ieps")
    .select("*")
    .eq("id", id)
    .single();

  if (iepError || !iep) {
    notFound();
  }

  const { data: student } = await supabase
    .from("students")
    .select("*")
    .eq("id", iep.student_id)
    .single();

  const { data: goals } = await supabase
    .from("iep_goals")
    .select("*")
    .eq("iep_id", id)
    .order("sort_order", { ascending: true });

  return (
    <IepDetailView
      iep={iep as IepRecord}
      student={(student as Student) ?? null}
      goals={(goals ?? []) as IepGoalRecord[]}
    />
  );
}
