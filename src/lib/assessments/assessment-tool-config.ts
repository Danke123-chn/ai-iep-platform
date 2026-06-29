import type { AssessmentTool } from "@/lib/types/assessment_types";

export const ASSESSMENT_TOOL_ROUTES: Record<AssessmentTool, string> = {
  vb_mapp: "vb-mapp",
  c_pep3: "c-pep3",
  kg_integration: "kg-integration",
  elem_integration: "elem-integration",
};

export const ASSESSMENT_TOOL_COLORS: Record<AssessmentTool, string> = {
  vb_mapp: "#534AB7",
  c_pep3: "#0F6E56",
  kg_integration: "#D97706",
  elem_integration: "#2563EB",
};

export function getAssessmentFormPath(
  studentId: string,
  sessionId: string,
  toolType: AssessmentTool,
): string {
  return `/dashboard/students/${studentId}/assessments/${sessionId}/${ASSESSMENT_TOOL_ROUTES[toolType]}`;
}

export function getToolLabel(toolType: AssessmentTool): string {
  switch (toolType) {
    case "vb_mapp":
      return "VB-MAPP";
    case "c_pep3":
      return "C-PEP-3";
    case "kg_integration":
      return "幼儿园融合能力评估";
    case "elem_integration":
      return "小学融合能力评估";
    default:
      return toolType;
  }
}
