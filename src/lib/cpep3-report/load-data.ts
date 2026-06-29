import { loadAssessmentResult, type Cpep3ResultData } from "@/lib/assessments/load-assessment-result";
import { createClient } from "@/lib/supabase/server";
import {
  buildDefaultCpep3ReportContent,
  parseCpep3ReportContent,
} from "@/lib/cpep3-report/report-content";
import type { Cpep3ReportContent, Cpep3ReportData } from "@/lib/cpep3-report/types";

export async function loadCpep3ReportData(
  studentId: string,
  sessionId: string,
  userId: string,
): Promise<Cpep3ReportData | null> {
  const result = await loadAssessmentResult(studentId, sessionId, userId);
  if (!result || result.session.tool_type !== "c_pep3") return null;

  const cpep3 = result as Cpep3ResultData;
  const existing = parseCpep3ReportContent(cpep3.session.summary);

  const devTotals = cpep3.devSummary.reduce(
    (acc, row) => {
      acc.passed += Number(row.passed_count);
      acc.emerging += Number(row.emerging_count);
      acc.failed += Number(row.failed_count);
      acc.nt += Number(row.not_tested_count);
      acc.items += Number(row.total_items);
      return acc;
    },
    { passed: 0, emerging: 0, failed: 0, nt: 0, items: 0 },
  );

  const reportContent = buildDefaultCpep3ReportContent({
    studentName: cpep3.student.name,
    devSummary: cpep3.devSummary,
    patSummary: cpep3.patSummary,
    sessionNotes: cpep3.session.notes,
    existing,
  });

  return {
    ...cpep3,
    reportContent,
    devTotalPassed: devTotals.passed,
    devTotalEmerging: devTotals.emerging,
    devTotalFailed: devTotals.failed,
    devTotalNotTested: devTotals.nt,
    devTotalItems: devTotals.items,
  };
}

export async function saveCpep3ReportContent(
  sessionId: string,
  userId: string,
  content: Cpep3ReportContent,
): Promise<string | null> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("assessment_sessions")
    .update({ summary: JSON.stringify(content) })
    .eq("id", sessionId)
    .eq("assessor_id", userId);

  return error?.message ?? null;
}
