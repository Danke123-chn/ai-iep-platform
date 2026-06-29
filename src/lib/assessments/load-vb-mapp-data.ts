import {
  normalizeBarrierScore,
  normalizeMilestoneScore,
  type AssessmentSession,
  type VbMappBarrier,
  type VbMappBarrierScore,
  type VbMappMilestone,
  type VbMappMilestoneScore,
  type VbMappTransition,
  type VbMappTransitionScore,
} from "@/lib/types/assessment_types";
import {
  enrichVbMappBarriers,
  enrichVbMappMilestones,
  enrichVbMappTransitions,
} from "@/lib/assessments/enrich-assessment-content";
import type { Student } from "@/lib/types/student";
import { createClient } from "@/lib/supabase/server";

export type VbMappAssessmentData = {
  session: AssessmentSession;
  student: Student;
  milestones: VbMappMilestone[];
  barriers: VbMappBarrier[];
  transitions: VbMappTransition[];
  milestoneScores: Record<string, string>;
  milestoneNotes: Record<string, string>;
  barrierScores: Record<string, string>;
  barrierNotes: Record<string, string>;
  transitionScores: Record<string, string>;
  transitionNotes: Record<string, string>;
};

function scoresToMap<T extends { milestone_id?: string; barrier_id?: string; transition_id?: string; score: unknown; notes: string | null }>(
  rows: T[],
  idKey: "milestone_id" | "barrier_id" | "transition_id",
  normalize: (score: unknown) => string | undefined,
) {
  const scores: Record<string, string> = {};
  const notes: Record<string, string> = {};
  for (const row of rows) {
    const id = row[idKey];
    if (!id) continue;
    const normalized = normalize(row.score);
    if (normalized !== undefined) scores[id] = normalized;
    if (row.notes) notes[id] = row.notes;
  }
  return { scores, notes };
}

export async function loadVbMappAssessmentData(
  studentId: string,
  sessionId: string,
  userId: string,
): Promise<VbMappAssessmentData | null> {
  const supabase = await createClient();

  const { data: session, error: sessionError } = await supabase
    .from("assessment_sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("student_id", studentId)
    .eq("assessor_id", userId)
    .eq("tool_type", "vb_mapp")
    .single();

  if (sessionError || !session) return null;

  const { data: student, error: studentError } = await supabase
    .from("students")
    .select("*")
    .eq("id", studentId)
    .eq("user_id", userId)
    .single();

  if (studentError || !student) return null;

  const [
    milestonesRes,
    barriersRes,
    transitionsRes,
    msScoresRes,
    brScoresRes,
    trScoresRes,
  ] = await Promise.all([
    supabase
      .from("vb_mapp_milestones")
      .select("*")
      .order("level")
      .order("domain")
      .order("milestone_number"),
    supabase.from("vb_mapp_barriers").select("*").order("sort_order"),
    supabase.from("vb_mapp_transitions").select("*").order("sort_order"),
    supabase
      .from("vb_mapp_milestone_scores")
      .select("*")
      .eq("session_id", sessionId),
    supabase
      .from("vb_mapp_barrier_scores")
      .select("*")
      .eq("session_id", sessionId),
    supabase
      .from("vb_mapp_transition_scores")
      .select("*")
      .eq("session_id", sessionId),
  ]);

  const ms = scoresToMap(
    (msScoresRes.data ?? []) as VbMappMilestoneScore[],
    "milestone_id",
    normalizeMilestoneScore,
  );
  const br = scoresToMap(
    (brScoresRes.data ?? []) as VbMappBarrierScore[],
    "barrier_id",
    normalizeBarrierScore,
  );
  const tr = scoresToMap(
    (trScoresRes.data ?? []) as VbMappTransitionScore[],
    "transition_id",
    normalizeBarrierScore,
  );

  return {
    session: session as AssessmentSession,
    student: student as Student,
    milestones: enrichVbMappMilestones(
      (milestonesRes.data ?? []) as VbMappMilestone[],
    ),
    barriers: enrichVbMappBarriers((barriersRes.data ?? []) as VbMappBarrier[]),
    transitions: enrichVbMappTransitions(
      (transitionsRes.data ?? []) as VbMappTransition[],
    ),
    milestoneScores: ms.scores,
    milestoneNotes: ms.notes,
    barrierScores: br.scores,
    barrierNotes: br.notes,
    transitionScores: tr.scores,
    transitionNotes: tr.notes,
  };
}
