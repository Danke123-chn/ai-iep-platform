import type { Cpep3ResultData } from "@/lib/assessments/load-assessment-result";

export const CPEP3_REPORT_TOOL = "c_pep3" as const;

export type Cpep3ReportContent = {
  tool: typeof CPEP3_REPORT_TOOL;
  version: 1;
  assessorName: string;
  observationNarrative: string;
  overallConclusion: string;
  strengthWeaknessSummary: string;
  devDomainNarratives: Record<string, string>;
  patDomainNarratives: Record<string, string>;
  trainingOutline: string;
  cooperationLevel: string;
  familyExpectations: string;
  summaryRecommendations: string;
};

export type Cpep3ReportData = Cpep3ResultData & {
  reportContent: Cpep3ReportContent;
  devTotalPassed: number;
  devTotalEmerging: number;
  devTotalFailed: number;
  devTotalNotTested: number;
  devTotalItems: number;
};
