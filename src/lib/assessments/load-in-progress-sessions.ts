import type { InProgressSessionSummary } from "@/lib/assessments/assessment-session-utils";
import {
  getIntegrationConfig,
  isIntegrationTool,
} from "@/lib/assessments/integration-assessment-config";
import type { AssessmentSession, AssessmentTool } from "@/lib/types/assessment_types";
import { createClient } from "@/lib/supabase/server";

export type { InProgressSessionSummary } from "@/lib/assessments/assessment-session-utils";

export async function loadInProgressSessions(
  studentId: string,
  userId: string,
): Promise<InProgressSessionSummary[]> {
  const supabase = await createClient();

  const { data: sessions, error } = await supabase
    .from("assessment_sessions")
    .select("id, tool_type, session_date, updated_at")
    .eq("student_id", studentId)
    .eq("assessor_id", userId)
    .eq("status", "in_progress")
    .order("updated_at", { ascending: false });

  if (error || !sessions?.length) return [];

  const summaries = await Promise.all(
    (sessions as Pick<
      AssessmentSession,
      "id" | "tool_type" | "session_date" | "updated_at"
    >[]).map(async (session) => {
      const scoredCount = await countSessionScoredItems(supabase, session);
      return {
        id: session.id,
        tool_type: session.tool_type,
        session_date: session.session_date,
        updated_at: session.updated_at,
        scoredCount,
      };
    }),
  );

  return summaries;
}

async function countSessionScoredItems(
  supabase: Awaited<ReturnType<typeof createClient>>,
  session: Pick<AssessmentSession, "id" | "tool_type">,
): Promise<number> {
  if (session.tool_type === "vb_mapp") {
    const [ms, br, tr] = await Promise.all([
      supabase
        .from("vb_mapp_milestone_scores")
        .select("*", { count: "exact", head: true })
        .eq("session_id", session.id),
      supabase
        .from("vb_mapp_barrier_scores")
        .select("*", { count: "exact", head: true })
        .eq("session_id", session.id),
      supabase
        .from("vb_mapp_transition_scores")
        .select("*", { count: "exact", head: true })
        .eq("session_id", session.id),
    ]);
    return (ms.count ?? 0) + (br.count ?? 0) + (tr.count ?? 0);
  }

  if (isIntegrationTool(session.tool_type as AssessmentTool)) {
    const { scoresTable } = getIntegrationConfig(session.tool_type as "kg_integration" | "elem_integration");
    const { count } = await supabase
      .from(scoresTable)
      .select("*", { count: "exact", head: true })
      .eq("session_id", session.id);
    return count ?? 0;
  }

  const [dev, pat] = await Promise.all([
    supabase
      .from("c_pep3_developmental_scores")
      .select("*", { count: "exact", head: true })
      .eq("session_id", session.id),
    supabase
      .from("c_pep3_pathological_scores")
      .select("*", { count: "exact", head: true })
      .eq("session_id", session.id),
  ]);

  return (dev.count ?? 0) + (pat.count ?? 0);
}
