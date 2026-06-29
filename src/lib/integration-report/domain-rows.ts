import {
  getIntegrationConfig,
  type IntegrationAssessmentTool,
} from "@/lib/assessments/integration-assessment-config";
import type {
  KgIntegrationBehaviorRecord,
  KgIntegrationSummary,
} from "@/lib/types/assessment_types";
import type { IntegrationReportDomainRow } from "@/lib/integration-report/types";

const KG_ACADEMIC_LABEL = "学业技能（幼小衔接适用）";

const REPORT_DOMAIN_META: Record<
  IntegrationAssessmentTool,
  Array<{
    domainKey: string;
    section: "activity" | "skill";
    label?: string;
  }>
> = {
  kg_integration: [
    { domainKey: "daily_life", section: "activity" },
    { domainKey: "zone_activity", section: "activity" },
    { domainKey: "teaching", section: "activity" },
    { domainKey: "outdoor", section: "activity" },
    { domainKey: "language_comm", section: "skill" },
    { domainKey: "social_emotion", section: "skill" },
    { domainKey: "academic", section: "skill", label: KG_ACADEMIC_LABEL },
  ],
  elem_integration: [
    { domainKey: "daily_life", section: "activity" },
    { domainKey: "teaching", section: "activity" },
    { domainKey: "outdoor", section: "activity" },
    { domainKey: "language_comm", section: "skill" },
    { domainKey: "social_emotion", section: "skill" },
    { domainKey: "academic", section: "skill" },
  ],
};

function summaryKey(section: string, domain: string): string {
  return `${section}:${domain}`;
}

function buildScoreRow(
  toolType: IntegrationAssessmentTool,
  meta: { domainKey: string; section: "activity" | "skill"; label?: string },
  row: KgIntegrationSummary | undefined,
): IntegrationReportDomainRow {
  const config = getIntegrationConfig(toolType);
  const fallbackLabel =
    meta.label ??
    config.iepDomainDisplayNames[meta.domainKey] ??
    meta.domainKey;

  if (!row) {
    return {
      domainKey: meta.domainKey,
      label: fallbackLabel,
      section: meta.section,
      actualScore: null,
      maxScore: null,
      passRate: null,
      score2: 0,
      score1: 0,
      score0: 0,
      na: 0,
      nt: 0,
    };
  }

  const score2 = Number(row.score_2_count);
  const score1 = Number(row.score_1_count);
  const score0 = Number(row.score_0_count);
  const na = Number(row.na_count);
  const nt = Number(row.not_tested_count);
  const scorable = score0 + score1 + score2 + nt;
  const maxScore =
    scorable > 0
      ? scorable * 2
      : Math.max(Number(row.total_items) - na, 0) * 2;
  const actualScore = score2 * 2 + score1;
  const tested = score0 + score1 + score2;

  return {
    domainKey: meta.domainKey,
    label: meta.label ?? row.domain_label_zh,
    section: meta.section,
    actualScore: tested > 0 ? actualScore : null,
    maxScore: maxScore > 0 ? maxScore : null,
    passRate: tested > 0 ? Number(row.pass_rate ?? 0) : null,
    score2,
    score1,
    score0,
    na,
    nt,
  };
}

function buildBehaviorRow(
  behaviorRecords: KgIntegrationBehaviorRecord[],
): IntegrationReportDomainRow {
  const behaviors = behaviorRecords.filter((b) =>
    b.behavior_description?.trim(),
  );
  return {
    domainKey: "behavior",
    label: "问题行为",
    section: "behavior",
    actualScore: null,
    maxScore: null,
    passRate: null,
    score2: 0,
    score1: 0,
    score0: behaviors.length,
    na: 0,
    nt: 0,
  };
}

export function buildIntegrationReportDomainRows(
  toolType: IntegrationAssessmentTool,
  summary: KgIntegrationSummary[],
  behaviorRecords: KgIntegrationBehaviorRecord[],
): IntegrationReportDomainRow[] {
  const byKey = new Map(
    summary.map((row) => [summaryKey(row.section, row.domain), row]),
  );

  const rows = REPORT_DOMAIN_META[toolType].map((meta) =>
    buildScoreRow(
      toolType,
      meta,
      byKey.get(summaryKey(meta.section, meta.domainKey)),
    ),
  );

  rows.push(buildBehaviorRow(behaviorRecords));
  return rows;
}

export function formatDomainScoreLabel(row: IntegrationReportDomainRow): string {
  if (row.section === "behavior") return row.label;
  if (row.actualScore === null || row.maxScore === null) {
    return `${row.label}（—/${row.maxScore ?? "—"}）`;
  }
  return `${row.label}（${row.actualScore}/${row.maxScore}）`;
}

export function getIntegrationReportTitle(
  toolType: IntegrationAssessmentTool,
): string {
  return toolType === "kg_integration"
    ? "三、融合能力评估报告（入园）"
    : "三、融合能力评估报告（入校）";
}

export function getIntegrationSchoolLabel(
  toolType: IntegrationAssessmentTool,
): string {
  return toolType === "kg_integration" ? "幼儿园" : "学校";
}
