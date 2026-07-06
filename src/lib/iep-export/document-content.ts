import { buildTeachingSuggestions } from "@/lib/iep-export/teaching-suggestions";
import { getShortTermGoalProgress } from "@/lib/iep-progress";
import { getIepStatus } from "@/lib/iep-utils";
import { formatDisabilityTypes, formatPlacementTypes } from "@/lib/types/student";
import {
  ASSESSMENT_LEVEL_LABELS,
  GOAL_PROGRESS_LABELS,
  IEP_STATUS_LABELS,
  type IepGenerateRequest,
} from "@/types/iep";
import type { IepExportData } from "@/lib/iep-export/types";

export const IEP_DOC_TITLE = "个别化教育计划（IEP）";

export function calculateIepAge(birthDate: string | null): string {
  if (!birthDate) return "—";
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return "—";
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age -= 1;
  return `${age}岁`;
}

export type BasicInfoRow = [string, string, string, string];

export function buildBasicInfoRows(data: IepExportData): BasicInfoRow[] {
  const { iep, student } = data;
  const status = getIepStatus(iep);

  return [
    ["姓名", student?.name ?? "—", "性别", student?.gender ?? "—"],
    ["年龄", calculateIepAge(student?.birth_date ?? null), "学校", student?.school ?? "—"],
    ["年级", student?.grade ?? "—", "班级", student?.class_name ?? "—"],
    [
      "障碍类型",
      student ? formatDisabilityTypes(student.disability_types) : "—",
      "安置方式",
      student ? formatPlacementTypes(student.placement_types) : "—",
    ],
    ["学年", iep.school_year, "学期", iep.semester],
    ["计划起始", iep.start_date, "计划结束", iep.end_date],
    [
      "IEP 状态",
      IEP_STATUS_LABELS[status],
      "生成日期",
      iep.generated_at?.slice(0, 10) ?? "—",
    ],
  ];
}

export type AssessmentTableRow = {
  domain: string;
  level: string;
  levelLabel: string;
  description: string;
};

export function buildAssessmentTableRows(data: IepExportData): AssessmentTableRow[] {
  const assessment = data.iep.assessment_data as IepGenerateRequest;

  return (assessment.domains ?? []).map((domain) => ({
    domain: domain.name,
    level: domain.level ? `${domain.level}级` : "—",
    levelLabel: domain.level ? ASSESSMENT_LEVEL_LABELS[domain.level] : "—",
    description: domain.description || "—",
  }));
}

export type GoalTableRow = {
  domain: string;
  longTermGoal: string;
  shortTermGoal: string;
  assessmentMethod: string;
  dateRange: string;
  progress: string;
};

export function buildGoalTableRows(data: IepExportData): GoalTableRow[] {
  const rows: GoalTableRow[] = [];

  for (const goal of data.goals) {
    if (goal.short_term_goals.length === 0) {
      rows.push({
        domain: goal.domain_name,
        longTermGoal: goal.long_term_goal,
        shortTermGoal: "—",
        assessmentMethod: "—",
        dateRange: "—",
        progress: "—",
      });
      continue;
    }

    goal.short_term_goals.forEach((stg, index) => {
      const progressStatus = getShortTermGoalProgress(stg);
      const progressLabel = progressStatus
        ? `${progressStatus}(${GOAL_PROGRESS_LABELS[progressStatus]})`
        : "未更新";

      rows.push({
        domain: index === 0 ? goal.domain_name : "",
        longTermGoal: index === 0 ? goal.long_term_goal : "",
        shortTermGoal: stg.content,
        assessmentMethod: stg.assessmentMethod,
        dateRange: `${stg.startDate} ~ ${stg.endDate}`,
        progress: progressLabel,
      });
    });
  }

  return rows;
}

export function buildIepSubtitle(data: IepExportData): string {
  const { iep, student } = data;
  return `${student?.name ?? "未知学生"}    ${iep.school_year}    ${iep.semester}`;
}

export function buildIepTeachingSuggestions(data: IepExportData): string[] {
  return buildTeachingSuggestions(data);
}

export const IEP_SIGNATURE_LINES = [
  "班主任签名：________________________    日期：________________",
  "家长签名：________________________    日期：________________",
  "学校盖章：________________________    日期：________________",
] as const;
