import type { IepGoalRecord, IepRecord } from "@/types/iep";
import type { Student } from "@/lib/types/student";

export type IepExportData = {
  iep: IepRecord;
  student: Student | null;
  goals: IepGoalRecord[];
};

export type ProgressReportContent = {
  overview: string;
  domainSummaries: string[];
  teachingSuggestions: string[];
  nextPhaseAdjustments: string[];
};
