import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getIntegrationConfig,
  type IntegrationAssessmentTool,
} from "@/lib/assessments/integration-assessment-config";
import {
  C_PEP3_NT,
  KG_INTEGRATION_NT,
  VB_MAPP_BARRIER_NT,
  VB_MAPP_MILESTONE_NT,
  VB_MAPP_TRANSITION_NT,
  type DevScore,
  type KgIntegrationScore,
  type PatScore,
} from "@/lib/types/assessment_types";

export function findUnscoredIds(
  items: { id: string }[],
  scores: Record<string, unknown>,
): string[] {
  return items
    .filter((item) => scores[item.id] === undefined)
    .map((item) => item.id);
}

function mergeDefaultScores<T extends string | number>(
  scores: Record<string, T>,
  ids: string[],
  defaultScore: T,
): Record<string, T> {
  if (ids.length === 0) return scores;
  const next = { ...scores };
  for (const id of ids) {
    next[id] = defaultScore;
  }
  return next;
}

export async function fillVbMappUntestedScores(
  supabase: SupabaseClient,
  sessionId: string,
  params: {
    milestones: { id: string }[];
    barriers: { id: string }[];
    transitions: { id: string }[];
    milestoneScores: Record<string, string>;
    barrierScores: Record<string, string>;
    transitionScores: Record<string, string>;
    milestoneNotes: Record<string, string>;
    barrierNotes: Record<string, string>;
    transitionNotes: Record<string, string>;
  },
): Promise<{
  milestoneScores: Record<string, string>;
  barrierScores: Record<string, string>;
  transitionScores: Record<string, string>;
  error: string | null;
}> {
  const unscoredMs = findUnscoredIds(params.milestones, params.milestoneScores);
  const unscoredBr = findUnscoredIds(params.barriers, params.barrierScores);
  const unscoredTr = findUnscoredIds(params.transitions, params.transitionScores);

  if (unscoredMs.length > 0) {
    const { error } = await supabase.from("vb_mapp_milestone_scores").upsert(
      unscoredMs.map((id) => ({
        session_id: sessionId,
        milestone_id: id,
        score: VB_MAPP_MILESTONE_NT,
        notes: params.milestoneNotes[id] ?? null,
      })),
      { onConflict: "session_id,milestone_id" },
    );
    if (error) {
      return {
        milestoneScores: params.milestoneScores,
        barrierScores: params.barrierScores,
        transitionScores: params.transitionScores,
        error: error.message,
      };
    }
  }

  if (unscoredBr.length > 0) {
    const { error } = await supabase.from("vb_mapp_barrier_scores").upsert(
      unscoredBr.map((id) => ({
        session_id: sessionId,
        barrier_id: id,
        score: VB_MAPP_BARRIER_NT,
        notes: params.barrierNotes[id] ?? null,
      })),
      { onConflict: "session_id,barrier_id" },
    );
    if (error) {
      return {
        milestoneScores: params.milestoneScores,
        barrierScores: params.barrierScores,
        transitionScores: params.transitionScores,
        error: error.message,
      };
    }
  }

  if (unscoredTr.length > 0) {
    const { error } = await supabase.from("vb_mapp_transition_scores").upsert(
      unscoredTr.map((id) => ({
        session_id: sessionId,
        transition_id: id,
        score: VB_MAPP_TRANSITION_NT,
        notes: params.transitionNotes[id] ?? null,
      })),
      { onConflict: "session_id,transition_id" },
    );
    if (error) {
      return {
        milestoneScores: params.milestoneScores,
        barrierScores: params.barrierScores,
        transitionScores: params.transitionScores,
        error: error.message,
      };
    }
  }

  return {
    milestoneScores: mergeDefaultScores(
      params.milestoneScores,
      unscoredMs,
      VB_MAPP_MILESTONE_NT,
    ),
    barrierScores: mergeDefaultScores(
      params.barrierScores,
      unscoredBr,
      VB_MAPP_BARRIER_NT,
    ),
    transitionScores: mergeDefaultScores(
      params.transitionScores,
      unscoredTr,
      VB_MAPP_TRANSITION_NT,
    ),
    error: null,
  };
}

export async function fillCpep3UntestedScores(
  supabase: SupabaseClient,
  sessionId: string,
  params: {
    devItems: { id: string }[];
    patItems: { id: string }[];
    devScores: Record<string, DevScore>;
    patScores: Record<string, PatScore>;
    devNotes: Record<string, string>;
    patNotes: Record<string, string>;
  },
): Promise<{
  devScores: Record<string, DevScore>;
  patScores: Record<string, PatScore>;
  error: string | null;
}> {
  const unscoredDev = findUnscoredIds(params.devItems, params.devScores);
  const unscoredPat = findUnscoredIds(params.patItems, params.patScores);

  if (unscoredDev.length > 0) {
    const { error } = await supabase.from("c_pep3_developmental_scores").upsert(
      unscoredDev.map((id) => ({
        session_id: sessionId,
        item_id: id,
        score: C_PEP3_NT,
        notes: params.devNotes[id] ?? null,
      })),
      { onConflict: "session_id,item_id" },
    );
    if (error) {
      return {
        devScores: params.devScores,
        patScores: params.patScores,
        error: error.message,
      };
    }
  }

  if (unscoredPat.length > 0) {
    const { error } = await supabase.from("c_pep3_pathological_scores").upsert(
      unscoredPat.map((id) => ({
        session_id: sessionId,
        item_id: id,
        score: C_PEP3_NT,
        notes: params.patNotes[id] ?? null,
      })),
      { onConflict: "session_id,item_id" },
    );
    if (error) {
      return {
        devScores: params.devScores,
        patScores: params.patScores,
        error: error.message,
      };
    }
  }

  return {
    devScores: mergeDefaultScores(params.devScores, unscoredDev, C_PEP3_NT),
    patScores: mergeDefaultScores(params.patScores, unscoredPat, C_PEP3_NT),
    error: null,
  };
}

export async function fillIntegrationUntestedScores(
  supabase: SupabaseClient,
  toolType: IntegrationAssessmentTool,
  sessionId: string,
  params: {
    items: { id: string }[];
    scores: Record<string, KgIntegrationScore>;
    notes: Record<string, string>;
  },
): Promise<{
  scores: Record<string, KgIntegrationScore>;
  error: string | null;
}> {
  const { scoresTable } = getIntegrationConfig(toolType);
  const unscored = findUnscoredIds(params.items, params.scores);

  if (unscored.length > 0) {
    const { error } = await supabase.from(scoresTable).upsert(
      unscored.map((id) => ({
        session_id: sessionId,
        item_id: id,
        score: KG_INTEGRATION_NT,
        notes: params.notes[id] ?? null,
      })),
      { onConflict: "session_id,item_id" },
    );
    if (error) {
      return {
        scores: params.scores,
        error: error.message,
      };
    }
  }

  return {
    scores: mergeDefaultScores(params.scores, unscored, KG_INTEGRATION_NT),
    error: null,
  };
}

export async function fillKgIntegrationUntestedScores(
  supabase: SupabaseClient,
  sessionId: string,
  params: {
    items: { id: string }[];
    scores: Record<string, KgIntegrationScore>;
    notes: Record<string, string>;
  },
): Promise<{
  scores: Record<string, KgIntegrationScore>;
  error: string | null;
}> {
  return fillIntegrationUntestedScores(
    supabase,
    "kg_integration",
    sessionId,
    params,
  );
}

export async function fillElemIntegrationUntestedScores(
  supabase: SupabaseClient,
  sessionId: string,
  params: {
    items: { id: string }[];
    scores: Record<string, KgIntegrationScore>;
    notes: Record<string, string>;
  },
): Promise<{
  scores: Record<string, KgIntegrationScore>;
  error: string | null;
}> {
  return fillIntegrationUntestedScores(
    supabase,
    "elem_integration",
    sessionId,
    params,
  );
}
