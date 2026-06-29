import type { AssessmentTool } from "@/lib/types/assessment_types";

export type InProgressSessionSummary = {
  id: string;
  tool_type: AssessmentTool;
  session_date: string;
  updated_at: string;
  scoredCount: number;
};

export {
  getAssessmentFormPath,
  getToolLabel,
  ASSESSMENT_TOOL_COLORS,
} from "@/lib/assessments/assessment-tool-config";
