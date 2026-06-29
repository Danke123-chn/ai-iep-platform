import type { VbMappResultData } from "@/lib/assessments/load-assessment-result";
import type { VbMappMilestone } from "@/lib/types/assessment_types";

export type VbMappDomainScoreRow = {
  domain: string;
  domainLabel: string;
  level1Total: number;
  level1Score: number;
  level2Total: number;
  level2Score: number;
  level3Total: number;
  level3Score: number;
  passed: number;
  partial: number;
  failed: number;
  notTested: number;
};

export type VbMappReportContent = {
  version: 1;
  assessorName: string;
  observationNarrative: string;
  overallConclusion: string;
  domainNarratives: Record<string, string>;
  barrierNarrative: string;
  transitionNarrative: string;
  summaryRecommendations: string;
};

export type VbMappReportData = VbMappResultData & {
  milestones: VbMappMilestone[];
  milestoneScores: Record<string, string>;
  domainScores: VbMappDomainScoreRow[];
  dominantLevel: 1 | 2 | 3 | null;
  reportContent: VbMappReportContent;
};
