import type {
  AssessmentSession,
  Cpep3DevelopmentalItem,
  Cpep3DevelopmentalScore,
  Cpep3PathologicalItem,
  Cpep3PathologicalScore,
  DevScore,
  PatScore,
} from "@/lib/types/assessment_types";
import type { Student } from "@/lib/types/student";
import { createClient } from "@/lib/supabase/server";
import {
  enrichCpep3DevItems,
  enrichCpep3PatItems,
} from "@/lib/assessments/enrich-assessment-content";

export type Cpep3AssessmentData = {
  session: AssessmentSession;
  student: Student;
  devItems: Cpep3DevelopmentalItem[];
  patItems: Cpep3PathologicalItem[];
  devScores: Record<string, DevScore>;
  devNotes: Record<string, string>;
  patScores: Record<string, PatScore>;
  patNotes: Record<string, string>;
};

function stringScoresToMap(
  rows: { item_id: string; score: string; notes: string | null }[],
) {
  const scores: Record<string, string> = {};
  const notes: Record<string, string> = {};
  for (const row of rows) {
    scores[row.item_id] = row.score;
    if (row.notes) notes[row.item_id] = row.notes;
  }
  return { scores, notes };
}

export async function loadCpep3AssessmentData(
  studentId: string,
  sessionId: string,
  userId: string,
): Promise<Cpep3AssessmentData | null> {
  const supabase = await createClient();

  const { data: session, error: sessionError } = await supabase
    .from("assessment_sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("student_id", studentId)
    .eq("assessor_id", userId)
    .eq("tool_type", "c_pep3")
    .single();

  if (sessionError || !session) return null;

  const { data: student, error: studentError } = await supabase
    .from("students")
    .select("*")
    .eq("id", studentId)
    .eq("user_id", userId)
    .single();

  if (studentError || !student) return null;

  const [devItemsRes, patItemsRes, devScoresRes, patScoresRes] =
    await Promise.all([
      supabase
        .from("c_pep3_developmental_items")
        .select("*")
        .order("domain")
        .order("item_number"),
      supabase
        .from("c_pep3_pathological_items")
        .select("*")
        .order("domain")
        .order("item_number"),
      supabase
        .from("c_pep3_developmental_scores")
        .select("*")
        .eq("session_id", sessionId),
      supabase
        .from("c_pep3_pathological_scores")
        .select("*")
        .eq("session_id", sessionId),
    ]);

  const dev = stringScoresToMap(
    (devScoresRes.data ?? []) as Cpep3DevelopmentalScore[],
  );
  const pat = stringScoresToMap(
    (patScoresRes.data ?? []) as Cpep3PathologicalScore[],
  );

  return {
    session: session as AssessmentSession,
    student: student as Student,
    devItems: enrichCpep3DevItems(
      (devItemsRes.data ?? []) as Cpep3DevelopmentalItem[],
    ),
    patItems: enrichCpep3PatItems(
      (patItemsRes.data ?? []) as Cpep3PathologicalItem[],
    ),
    devScores: dev.scores as Record<string, DevScore>,
    devNotes: dev.notes,
    patScores: pat.scores as Record<string, PatScore>,
    patNotes: pat.notes,
  };
}
