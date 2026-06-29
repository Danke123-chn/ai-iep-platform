import type { IntegrationResultData } from "@/lib/assessments/load-assessment-result";
import type { IntegrationAssessmentTool } from "@/lib/assessments/integration-assessment-config";

export type IntegrationReportDomainRow = {
  domainKey: string;
  label: string;
  section: "activity" | "skill" | "behavior";
  actualScore: number | null;
  maxScore: number | null;
  passRate: number | null;
  score2: number;
  score1: number;
  score0: number;
  na: number;
  nt: number;
};

export type IntegrationReportContent = {
  tool: IntegrationAssessmentTool;
  version: 1;
  assessorName: string;
  className: string;
  domainAnalysis: Record<string, string>;
  domainRecommendations: Record<string, string>;
  behaviorAnalysis: string;
  behaviorRecommendation: string;
};

export type IntegrationReportData = IntegrationResultData & {
  toolType: IntegrationAssessmentTool;
  reportContent: IntegrationReportContent;
  domainRows: IntegrationReportDomainRow[];
};
