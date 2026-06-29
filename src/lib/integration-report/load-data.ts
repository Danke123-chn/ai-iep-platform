import {
  loadAssessmentResult,
  type IntegrationResultData,
} from "@/lib/assessments/load-assessment-result";
import { isIntegrationTool } from "@/lib/assessments/integration-assessment-config";
import type { IntegrationAssessmentTool } from "@/lib/assessments/integration-assessment-config";
import { createClient } from "@/lib/supabase/server";
import { buildIntegrationReportDomainRows } from "@/lib/integration-report/domain-rows";
import {
  buildDefaultIntegrationReportContent,
  parseIntegrationReportContent,
} from "@/lib/integration-report/report-content";
import type {
  IntegrationReportContent,
  IntegrationReportData,
} from "@/lib/integration-report/types";

export async function loadIntegrationReportData(
  studentId: string,
  sessionId: string,
  userId: string,
): Promise<IntegrationReportData | null> {
  const result = await loadAssessmentResult(studentId, sessionId, userId);
  if (!result || !isIntegrationTool(result.session.tool_type)) return null;

  const toolType = result.session.tool_type as IntegrationAssessmentTool;
  const integration = result as IntegrationResultData;
  const existing = parseIntegrationReportContent(
    integration.session.summary,
    toolType,
  );

  const domainRows = buildIntegrationReportDomainRows(
    toolType,
    integration.summary,
    integration.behaviorRecords,
  );

  const reportContent = buildDefaultIntegrationReportContent({
    toolType,
    domainRows,
    behaviorRecords: integration.behaviorRecords,
    className: integration.student.class_name,
    sessionNotes: integration.session.notes,
    existing,
  });

  return {
    ...integration,
    toolType,
    reportContent,
    domainRows,
  };
}

export async function saveIntegrationReportContent(
  sessionId: string,
  userId: string,
  content: IntegrationReportContent,
): Promise<string | null> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("assessment_sessions")
    .update({ summary: JSON.stringify(content) })
    .eq("id", sessionId)
    .eq("assessor_id", userId);

  return error?.message ?? null;
}
