import {
  isVbMappNt,
  normalizeBarrierScore,
  VB_MAPP_NT,
} from "@/lib/types/assessment_types";
import type {
  AssessmentSession,
  AssessmentTool,
  BarrierScore,
  Cpep3DevSummary,
  Cpep3PatSummary,
  KgIntegrationBehaviorRecord,
  KgIntegrationSummary,
  VbMappBarrier,
  VbMappMilestoneSummary,
  VbMappTransition,
} from "@/lib/types/assessment_types";
import type { Student } from "@/lib/types/student";
import { createClient } from "@/lib/supabase/server";
import { getToolLabel } from "@/lib/assessments/assessment-tool-config";
import {
  getIntegrationConfig,
  isIntegrationTool,
} from "@/lib/assessments/integration-assessment-config";
import {
  parseUploadedReportSummary,
  type UploadedReportInterpretation,
} from "@/lib/uploaded-report/types";

function scoreMapKey(id: unknown): string {
  return String(id).toLowerCase();
}

export type AssessmentResultData = {
  session: AssessmentSession;
  student: Student;
  assessorEmail: string | null;
  toolLabel: string;
};

export type VbMappResultData = AssessmentResultData & {
  milestoneSummary: VbMappMilestoneSummary[];
  barriers: (VbMappBarrier & { score: BarrierScore })[];
  transitions: (VbMappTransition & { score: BarrierScore })[];
  barrierAverage: number;
  transitionAverage: number;
};

export type Cpep3ResultData = AssessmentResultData & {
  devSummary: Cpep3DevSummary[];
  patSummary: Cpep3PatSummary[];
};

export type KgIntegrationResultData = IntegrationResultData;
export type ElemIntegrationResultData = IntegrationResultData;

export type IntegrationResultData = AssessmentResultData & {
  summary: KgIntegrationSummary[];
  behaviorRecords: KgIntegrationBehaviorRecord[];
};

export type UploadedReportResultData = AssessmentResultData & {
  interpretation: UploadedReportInterpretation;
};

export async function loadAssessmentResult(
  studentId: string,
  sessionId: string,
  userId: string,
): Promise<
  | VbMappResultData
  | Cpep3ResultData
  | IntegrationResultData
  | UploadedReportResultData
  | null
> {
  const supabase = await createClient();

  const { data: session, error } = await supabase
    .from("assessment_sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("student_id", studentId)
    .eq("assessor_id", userId)
    .single();

  if (error || !session) return null;

  const { data: student } = await supabase
    .from("students")
    .select("*")
    .eq("id", studentId)
    .eq("user_id", userId)
    .single();

  if (!student) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const base: AssessmentResultData = {
    session: session as AssessmentSession,
    student: student as Student,
    assessorEmail: user?.email ?? null,
    toolLabel: getToolLabel(session.tool_type as AssessmentTool),
  };

  if (session.tool_type === "uploaded_report") {
    const interpretation = parseUploadedReportSummary(session.summary);
    if (!interpretation) return null;
    return { ...base, interpretation };
  }

  if (session.tool_type === "vb_mapp") {
    const [summaryRes, barriersRes, transitionsRes, brScoresRes, trScoresRes] =
      await Promise.all([
        supabase
          .from("v_vbmapp_milestone_summary")
          .select("*")
          .eq("session_id", sessionId)
          .order("level")
          .order("domain"),
        supabase.from("vb_mapp_barriers").select("*").order("sort_order"),
        supabase.from("vb_mapp_transitions").select("*").order("sort_order"),
        supabase
          .from("vb_mapp_barrier_scores")
          .select("*")
          .eq("session_id", sessionId),
        supabase
          .from("vb_mapp_transition_scores")
          .select("*")
          .eq("session_id", sessionId),
      ]);

    const brScoreMap = new Map(
      (brScoresRes.data ?? []).map((s) => [
        scoreMapKey(s.barrier_id),
        normalizeBarrierScore(s.score) ?? VB_MAPP_NT,
      ]),
    );
    const trScoreMap = new Map(
      (trScoresRes.data ?? []).map((s) => [
        scoreMapKey(s.transition_id),
        normalizeBarrierScore(s.score) ?? VB_MAPP_NT,
      ]),
    );

    const barriers = ((barriersRes.data ?? []) as VbMappBarrier[]).map((b) => ({
      ...b,
      score: brScoreMap.get(scoreMapKey(b.id)) ?? VB_MAPP_NT,
    }));

    const transitions = ((transitionsRes.data ?? []) as VbMappTransition[]).map(
      (t) => ({
        ...t,
        score: trScoreMap.get(scoreMapKey(t.id)) ?? VB_MAPP_NT,
      }),
    );

    const brScored = barriers.filter((b) => !isVbMappNt(b.score));
    const trScored = transitions.filter((t) => !isVbMappNt(t.score));

    const barrierAverage =
      brScored.length > 0
        ? brScored.reduce((s, b) => s + Number(b.score), 0) / brScored.length
        : 0;
    const transitionAverage =
      trScored.length > 0
        ? trScored.reduce((s, t) => s + Number(t.score), 0) / trScored.length
        : 0;

    return {
      ...base,
      milestoneSummary: (summaryRes.data ?? []) as VbMappMilestoneSummary[],
      barriers,
      transitions,
      barrierAverage,
      transitionAverage,
    };
  }

  if (isIntegrationTool(session.tool_type as AssessmentTool)) {
    const toolType = session.tool_type as "kg_integration" | "elem_integration";
    const config = getIntegrationConfig(toolType);
    const [summaryRes, behaviorRes] = await Promise.all([
      supabase
        .from(config.summaryView)
        .select("*")
        .eq("session_id", sessionId)
        .order("section")
        .order("domain"),
      supabase
        .from(config.behaviorTable)
        .select("*")
        .eq("session_id", sessionId)
        .order("sort_order"),
    ]);

    return {
      ...base,
      summary: (summaryRes.data ?? []) as KgIntegrationSummary[],
      behaviorRecords: (behaviorRes.data ?? []) as KgIntegrationBehaviorRecord[],
    };
  }

  const [devRes, patRes] = await Promise.all([
    supabase
      .from("v_cpep3_dev_summary")
      .select("*")
      .eq("session_id", sessionId)
      .order("domain"),
    supabase
      .from("v_cpep3_pat_summary")
      .select("*")
      .eq("session_id", sessionId)
      .order("domain"),
  ]);

  return {
    ...base,
    devSummary: (devRes.data ?? []) as Cpep3DevSummary[],
    patSummary: (patRes.data ?? []) as Cpep3PatSummary[],
  };
}
