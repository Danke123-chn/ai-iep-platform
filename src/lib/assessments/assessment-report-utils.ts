import type { AssessmentTool } from "@/lib/types/assessment_types";
import { getToolLabel } from "@/lib/assessments/assessment-tool-config";

export type AssessmentReportListItem = {
  id: string;
  student_id: string;
  student_name: string;
  tool_type: AssessmentTool;
  tool_label: string;
  session_date: string;
  updated_at: string;
};

export function getAssessmentReportPath(
  studentId: string,
  sessionId: string,
): string {
  return `/dashboard/students/${studentId}/assessments/${sessionId}/report`;
}

export function formatAssessmentReportTitle(item: AssessmentReportListItem): string {
  return `${item.tool_label}报告`;
}

export function buildAssessmentReportListItem(
  session: {
    id: string;
    student_id: string;
    tool_type: AssessmentTool;
    session_date: string;
    updated_at: string;
  },
  studentName: string,
): AssessmentReportListItem {
  return {
    id: session.id,
    student_id: session.student_id,
    student_name: studentName,
    tool_type: session.tool_type,
    tool_label: getToolLabel(session.tool_type),
    session_date: session.session_date,
    updated_at: session.updated_at,
  };
}
