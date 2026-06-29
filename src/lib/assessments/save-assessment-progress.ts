import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getIntegrationConfig,
  type IntegrationAssessmentTool,
} from "@/lib/assessments/integration-assessment-config";

export async function touchAssessmentSession(
  supabase: SupabaseClient,
  sessionId: string,
): Promise<string | null> {
  const { error } = await supabase
    .from("assessment_sessions")
    .update({
      status: "in_progress",
      updated_at: new Date().toISOString(),
    })
    .eq("id", sessionId);

  return error?.message ?? null;
}

export async function saveVbMappProgress(
  supabase: SupabaseClient,
  sessionId: string,
  params: {
    milestoneScores: Record<string, string>;
    milestoneNotes: Record<string, string>;
    barrierScores: Record<string, string>;
    barrierNotes: Record<string, string>;
    transitionScores: Record<string, string>;
    transitionNotes: Record<string, string>;
  },
): Promise<string | null> {
  const msRows = Object.entries(params.milestoneScores).map(
    ([milestone_id, score]) => ({
      session_id: sessionId,
      milestone_id,
      score,
      notes: params.milestoneNotes[milestone_id] ?? null,
    }),
  );

  if (msRows.length > 0) {
    const { error } = await supabase
      .from("vb_mapp_milestone_scores")
      .upsert(msRows, { onConflict: "session_id,milestone_id" });
    if (error) return error.message;
  }

  const brRows = Object.entries(params.barrierScores).map(
    ([barrier_id, score]) => ({
      session_id: sessionId,
      barrier_id,
      score,
      notes: params.barrierNotes[barrier_id] ?? null,
    }),
  );

  if (brRows.length > 0) {
    const { error } = await supabase
      .from("vb_mapp_barrier_scores")
      .upsert(brRows, { onConflict: "session_id,barrier_id" });
    if (error) return error.message;
  }

  const trRows = Object.entries(params.transitionScores).map(
    ([transition_id, score]) => ({
      session_id: sessionId,
      transition_id,
      score,
      notes: params.transitionNotes[transition_id] ?? null,
    }),
  );

  if (trRows.length > 0) {
    const { error } = await supabase
      .from("vb_mapp_transition_scores")
      .upsert(trRows, { onConflict: "session_id,transition_id" });
    if (error) return error.message;
  }

  return touchAssessmentSession(supabase, sessionId);
}

export async function saveCpep3Progress(
  supabase: SupabaseClient,
  sessionId: string,
  params: {
    devScores: Record<string, string>;
    devNotes: Record<string, string>;
    patScores: Record<string, string>;
    patNotes: Record<string, string>;
  },
): Promise<string | null> {
  const devRows = Object.entries(params.devScores).map(([item_id, score]) => ({
    session_id: sessionId,
    item_id,
    score,
    notes: params.devNotes[item_id] ?? null,
  }));

  if (devRows.length > 0) {
    const { error } = await supabase
      .from("c_pep3_developmental_scores")
      .upsert(devRows, { onConflict: "session_id,item_id" });
    if (error) return error.message;
  }

  const patRows = Object.entries(params.patScores).map(([item_id, score]) => ({
    session_id: sessionId,
    item_id,
    score,
    notes: params.patNotes[item_id] ?? null,
  }));

  if (patRows.length > 0) {
    const { error } = await supabase
      .from("c_pep3_pathological_scores")
      .upsert(patRows, { onConflict: "session_id,item_id" });
    if (error) return error.message;
  }

  return touchAssessmentSession(supabase, sessionId);
}

export async function saveIntegrationProgress(
  supabase: SupabaseClient,
  toolType: IntegrationAssessmentTool,
  sessionId: string,
  params: {
    scores: Record<string, string>;
    notes: Record<string, string>;
  },
): Promise<string | null> {
  const { scoresTable } = getIntegrationConfig(toolType);
  const scoreRows = Object.entries(params.scores).map(([item_id, score]) => ({
    session_id: sessionId,
    item_id,
    score,
    notes: params.notes[item_id] ?? null,
  }));

  if (scoreRows.length > 0) {
    const { error } = await supabase
      .from(scoresTable)
      .upsert(scoreRows, { onConflict: "session_id,item_id" });
    if (error) return error.message;
  }

  return touchAssessmentSession(supabase, sessionId);
}

export async function saveKgIntegrationProgress(
  supabase: SupabaseClient,
  sessionId: string,
  params: {
    scores: Record<string, string>;
    notes: Record<string, string>;
  },
): Promise<string | null> {
  return saveIntegrationProgress(supabase, "kg_integration", sessionId, params);
}

export async function saveElemIntegrationProgress(
  supabase: SupabaseClient,
  sessionId: string,
  params: {
    scores: Record<string, string>;
    notes: Record<string, string>;
  },
): Promise<string | null> {
  return saveIntegrationProgress(supabase, "elem_integration", sessionId, params);
}

export function countScoredItems(scores: Record<string, string>): number {
  return Object.keys(scores).length;
}
