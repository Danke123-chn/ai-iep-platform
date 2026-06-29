import {
  getIntegrationConfig,
  type IntegrationAssessmentTool,
} from "@/lib/assessments/integration-assessment-config";
import type {
  AssessmentSession,
  KgIntegrationBehaviorRecord,
  KgIntegrationItem,
  KgIntegrationScore,
} from "@/lib/types/assessment_types";
import type { Student } from "@/lib/types/student";
import { createClient } from "@/lib/supabase/server";

export type IntegrationAssessmentData = {
  toolType: IntegrationAssessmentTool;
  session: AssessmentSession;
  student: Student;
  activityItems: KgIntegrationItem[];
  skillItems: KgIntegrationItem[];
  scores: Record<string, KgIntegrationScore>;
  notes: Record<string, string>;
  behaviorRecords: KgIntegrationBehaviorRecord[];
};

function stringScoresToMap(
  rows: { item_id: string; score: string; notes: string | null }[],
) {
  const scores: Record<string, KgIntegrationScore> = {};
  const notes: Record<string, string> = {};
  for (const row of rows) {
    scores[row.item_id] = row.score as KgIntegrationScore;
    if (row.notes) notes[row.item_id] = row.notes;
  }
  return { scores, notes };
}

export async function loadIntegrationAssessmentData(
  toolType: IntegrationAssessmentTool,
  studentId: string,
  sessionId: string,
  userId: string,
): Promise<IntegrationAssessmentData | null> {
  const config = getIntegrationConfig(toolType);
  const supabase = await createClient();

  const { data: session, error: sessionError } = await supabase
    .from("assessment_sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("student_id", studentId)
    .eq("assessor_id", userId)
    .eq("tool_type", toolType)
    .single();

  if (sessionError || !session) return null;

  const { data: student, error: studentError } = await supabase
    .from("students")
    .select("*")
    .eq("id", studentId)
    .eq("user_id", userId)
    .single();

  if (studentError || !student) return null;

  const [itemsRes, scoresRes, behaviorRes] = await Promise.all([
    supabase.from(config.itemsTable).select("*").order("sort_order"),
    supabase
      .from(config.scoresTable)
      .select("*")
      .eq("session_id", sessionId),
    supabase
      .from(config.behaviorTable)
      .select("*")
      .eq("session_id", sessionId)
      .order("sort_order"),
  ]);

  const items = (itemsRes.data ?? []) as KgIntegrationItem[];
  const { scores, notes } = stringScoresToMap(scoresRes.data ?? []);

  return {
    toolType,
    session: session as AssessmentSession,
    student: student as Student,
    activityItems: items.filter((i) => i.section === "activity"),
    skillItems: items.filter((i) => i.section === "skill"),
    scores,
    notes,
    behaviorRecords: (behaviorRes.data ?? []) as KgIntegrationBehaviorRecord[],
  };
}
