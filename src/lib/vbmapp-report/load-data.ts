import { loadAssessmentResult, type VbMappResultData } from "@/lib/assessments/load-assessment-result";
import { loadVbMappAssessmentData } from "@/lib/assessments/load-vb-mapp-data";
import { isVbMappNt } from "@/lib/types/assessment_types";
import { createClient } from "@/lib/supabase/server";
import {
  buildDefaultReportContent,
  isStaleUntestedNarrative,
  parseReportContent,
} from "@/lib/vbmapp-report/report-content";
import {
  buildDomainScoreRows,
  estimateDominantLevel,
} from "@/lib/vbmapp-report/score-data";
import type { VbMappReportContent, VbMappReportData } from "@/lib/vbmapp-report/types";

export async function loadVbMappReportData(
  studentId: string,
  sessionId: string,
  userId: string,
): Promise<VbMappReportData | null> {
  const [result, raw] = await Promise.all([
    loadAssessmentResult(studentId, sessionId, userId),
    loadVbMappAssessmentData(studentId, sessionId, userId),
  ]);

  if (!result || !raw || result.session.tool_type !== "vb_mapp") return null;

  const vbResult = result as VbMappResultData;
  const existing = parseReportContent(raw.session.summary);
  const domainScores = buildDomainScoreRows(
    raw.milestones,
    raw.milestoneScores,
  );
  const dominantLevel = estimateDominantLevel(
    raw.milestones,
    raw.milestoneScores,
  );

  const reportContent = buildDefaultReportContent({
    studentName: raw.student.name,
    milestones: raw.milestones,
    milestoneScores: raw.milestoneScores,
    barriers: vbResult.barriers,
    transitions: vbResult.transitions,
    sessionNotes: raw.session.notes,
    existing,
  });

  const barrierScored = vbResult.barriers.filter((b) => !isVbMappNt(b.score)).length;
  const transitionScored = vbResult.transitions.filter((t) => !isVbMappNt(t.score))
    .length;

  if (
    existing &&
    (isStaleUntestedNarrative(existing.barrierNarrative, barrierScored > 0) ||
      isStaleUntestedNarrative(existing.transitionNarrative, transitionScored > 0))
  ) {
    await saveVbMappReportContent(sessionId, userId, reportContent);
  }

  return {
    ...vbResult,
    milestones: raw.milestones,
    milestoneScores: raw.milestoneScores,
    domainScores,
    dominantLevel,
    reportContent,
  };
}

export async function saveVbMappReportContent(
  sessionId: string,
  userId: string,
  content: VbMappReportContent,
): Promise<string | null> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("assessment_sessions")
    .update({ summary: JSON.stringify(content) })
    .eq("id", sessionId)
    .eq("assessor_id", userId);

  return error?.message ?? null;
}
