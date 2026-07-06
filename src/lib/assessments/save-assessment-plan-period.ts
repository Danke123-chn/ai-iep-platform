import type { SupabaseClient } from "@supabase/supabase-js";
import {
  formatPlanPeriodNotes,
  isPlanPeriodColumnError,
  type AssessmentPlanPeriod,
  toSessionPlanPeriodPayload,
} from "@/lib/assessments/plan-period";
import { getDbErrorMessage } from "@/lib/supabase/db-errors";

export async function saveAssessmentPlanPeriod(
  supabase: SupabaseClient,
  sessionId: string,
  plan: AssessmentPlanPeriod,
  existingNotes: string | null | undefined,
): Promise<{ error: string | null; usedNotesFallback: boolean }> {
  const updatedAt = new Date().toISOString();

  const { error: columnError } = await supabase
    .from("assessment_sessions")
    .update({
      ...toSessionPlanPeriodPayload(plan),
      updated_at: updatedAt,
    })
    .eq("id", sessionId);

  if (!columnError) {
    return { error: null, usedNotesFallback: false };
  }

  if (!isPlanPeriodColumnError(columnError.message)) {
    return { error: getDbErrorMessage(columnError.message), usedNotesFallback: false };
  }

  const { error: notesError } = await supabase
    .from("assessment_sessions")
    .update({
      notes: formatPlanPeriodNotes(plan, existingNotes),
      updated_at: updatedAt,
    })
    .eq("id", sessionId);

  if (notesError) {
    return { error: getDbErrorMessage(notesError.message), usedNotesFallback: true };
  }

  return { error: null, usedNotesFallback: true };
}
