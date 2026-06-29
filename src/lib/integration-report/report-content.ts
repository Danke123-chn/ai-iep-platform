import type { KgIntegrationBehaviorRecord } from "@/lib/types/assessment_types";
import type { IntegrationAssessmentTool } from "@/lib/assessments/integration-assessment-config";
import type {
  IntegrationReportContent,
  IntegrationReportDomainRow,
} from "@/lib/integration-report/types";

export function isIntegrationReportContent(
  value: unknown,
  toolType?: IntegrationAssessmentTool,
): value is IntegrationReportContent {
  if (typeof value !== "object" || value === null || !("tool" in value)) {
    return false;
  }
  const tool = (value as IntegrationReportContent).tool;
  if (tool !== "kg_integration" && tool !== "elem_integration") return false;
  if (toolType && tool !== toolType) return false;
  return true;
}

export function parseIntegrationReportContent(
  summary: string | null,
  toolType: IntegrationAssessmentTool,
): IntegrationReportContent | null {
  if (!summary?.trim()) return null;
  try {
    const parsed = JSON.parse(summary) as IntegrationReportContent;
    if (isIntegrationReportContent(parsed, toolType)) return parsed;
  } catch {
    return null;
  }
  return null;
}

function defaultDomainAnalysis(row: IntegrationReportDomainRow): string {
  if (row.section === "behavior") return "";

  const tested = row.score0 + row.score1 + row.score2;
  if (tested === 0) {
    return `优势：本领域均为未测，暂无有效数据。\n弱势：—`;
  }

  const rate = Math.round(row.passRate ?? 0);
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (rate >= 70) {
    strengths.push(
      `融合能力率 ${rate}%，独立表现（2分）${row.score2} 项，整体表现较好`,
    );
  } else if (rate >= 50) {
    strengths.push(`部分项目可独立或部分辅助完成（2分 ${row.score2} 项、1分 ${row.score1} 项）`);
    weaknesses.push(`融合能力率 ${rate}%，仍有提升空间`);
  } else {
    weaknesses.push(
      `融合能力率 ${rate}%，大量辅助（0分）${row.score0} 项较多，需重点支持`,
    );
  }

  if (row.score2 >= 3 && rate < 70) {
    strengths.push(`已有 ${row.score2} 项可独立完成的融合技能`);
  }
  if (row.nt > 0) {
    weaknesses.push(`另有 ${row.nt} 项未测，建议补测后更新分析`);
  }

  const strengthText =
    strengths.length > 0 ? strengths.join("；") : "暂无明显优势项目";
  const weaknessText =
    weaknesses.length > 0 ? weaknesses.join("；") : "暂无明显弱势项目";

  return `优势：${strengthText}\n弱势：${weaknessText}`;
}

function defaultDomainRecommendation(row: IntegrationReportDomainRow): string {
  if (row.section === "behavior") return "";

  const tested = row.score0 + row.score1 + row.score2;
  if (tested === 0) {
    return "建议补测本领域后，再制定针对性融合支持策略。";
  }

  const rate = Math.round(row.passRate ?? 0);
  if (rate >= 70) {
    return "维持现有支持强度，逐步减少辅助，促进在融合情境中的自然泛化与同伴互动。";
  }
  if (rate >= 50) {
    return "在融合活动中增加结构化提示与示范，将已掌握技能逐步迁移至集体情境，并定期检核进步。";
  }
  return "建议纳入个别化融合支持计划：拆分任务步骤、提供视觉提示与同伴/成人辅助，优先训练高频日常融合技能。";
}

function defaultBehaviorAnalysis(
  behaviorRecords: KgIntegrationBehaviorRecord[],
): string {
  const behaviors = behaviorRecords.filter((b) => b.behavior_description?.trim());
  if (behaviors.length === 0) {
    return "优势：评估期间未记录明显问题行为。\n弱势：—";
  }

  const listed = behaviors
    .slice(0, 5)
    .map((b) => b.behavior_description!.trim())
    .join("；");

  return (
    `优势：—\n弱势：共记录 ${behaviors.length} 项问题行为，主要包括：${listed}` +
    `${behaviors.length > 5 ? " 等" : ""}。`
  );
}

function defaultBehaviorRecommendation(
  behaviorRecords: KgIntegrationBehaviorRecord[],
): string {
  const behaviors = behaviorRecords.filter((b) => b.behavior_description?.trim());
  if (behaviors.length === 0) {
    return "继续观察融合情境中的行为表现，保持良好常规与正向强化。";
  }
  return (
    "建议制定行为功能评估与干预计划：明确前事与后果、教授替代行为，" +
    "在融合活动中采用预防策略与一致的行为支持，并与班级教师协同实施。"
  );
}

export function buildDefaultIntegrationReportContent(params: {
  toolType: IntegrationAssessmentTool;
  domainRows: IntegrationReportDomainRow[];
  behaviorRecords: KgIntegrationBehaviorRecord[];
  className?: string | null;
  sessionNotes?: string | null;
  existing?: IntegrationReportContent | null;
}): IntegrationReportContent {
  const domainAnalysis: Record<string, string> = {};
  const domainRecommendations: Record<string, string> = {};

  for (const row of params.domainRows) {
    if (row.domainKey === "behavior") continue;
    domainAnalysis[row.domainKey] =
      params.existing?.domainAnalysis[row.domainKey] ??
      defaultDomainAnalysis(row);
    domainRecommendations[row.domainKey] =
      params.existing?.domainRecommendations[row.domainKey] ??
      defaultDomainRecommendation(row);
  }

  return {
    tool: params.toolType,
    version: 1,
    assessorName: params.existing?.assessorName ?? "",
    className: params.existing?.className ?? params.className?.trim() ?? "",
    domainAnalysis,
    domainRecommendations,
    behaviorAnalysis:
      params.existing?.behaviorAnalysis ??
      defaultBehaviorAnalysis(params.behaviorRecords),
    behaviorRecommendation:
      params.existing?.behaviorRecommendation ??
      defaultBehaviorRecommendation(params.behaviorRecords),
  };
}
