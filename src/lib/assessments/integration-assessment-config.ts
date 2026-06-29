import type { AssessmentTool } from "@/lib/types/assessment_types";

export type IntegrationAssessmentTool = "kg_integration" | "elem_integration";

export const INTEGRATION_ASSESSMENT_CONFIG: Record<
  IntegrationAssessmentTool,
  {
    itemsTable: string;
    scoresTable: string;
    behaviorTable: string;
    summaryView: string;
    title: string;
    accentColor: string;
    migrationHint: string;
    iepDomainOrder: string[];
    iepDomainDisplayNames: Record<string, string>;
  }
> = {
  kg_integration: {
    itemsTable: "kg_integration_items",
    scoresTable: "kg_integration_scores",
    behaviorTable: "kg_integration_behavior_records",
    summaryView: "v_kg_integration_summary",
    title: "幼儿园融合能力评估",
    accentColor: "#D97706",
    migrationHint: "021、022",
    iepDomainOrder: [
      "daily_life",
      "zone_activity",
      "teaching",
      "outdoor",
      "language_comm",
      "social_emotion",
      "academic",
    ],
    iepDomainDisplayNames: {},
  },
  elem_integration: {
    itemsTable: "elem_integration_items",
    scoresTable: "elem_integration_scores",
    behaviorTable: "elem_integration_behavior_records",
    summaryView: "v_elem_integration_summary",
    title: "小学融合能力评估",
    accentColor: "#2563EB",
    migrationHint: "023、024",
    iepDomainOrder: [
      "daily_life",
      "teaching",
      "outdoor",
      "language_comm",
      "social_emotion",
      "academic",
    ],
    iepDomainDisplayNames: {
      social_emotion: "社交与情绪",
    },
  },
};

export function isIntegrationTool(
  tool: AssessmentTool,
): tool is IntegrationAssessmentTool {
  return tool === "kg_integration" || tool === "elem_integration";
}

export function getIntegrationConfig(tool: IntegrationAssessmentTool) {
  return INTEGRATION_ASSESSMENT_CONFIG[tool];
}
