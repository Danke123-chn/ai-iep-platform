import { chatCompletion } from "@/lib/deepseek";
import {
  buildIntegrationReportSystemPrompt,
  buildIntegrationReportUserPrompt,
} from "@/lib/prompts/reports/integration";
import { getIntegrationConfig } from "@/lib/assessments/integration-assessment-config";
import { formatDomainScoreLabel } from "@/lib/integration-report/domain-rows";
import type { IntegrationReportData } from "@/lib/integration-report/types";
import type { IntegrationReportContent } from "@/lib/integration-report/types";

function buildAssessmentPayload(data: IntegrationReportData): string {
  const config = getIntegrationConfig(data.toolType);
  const lines: string[] = [
    `学生：${data.student.name}`,
    `评估工具：${config.title}`,
    `评估日期：${data.session.session_date}`,
    "",
    "各领域得分与融合能力率：",
  ];

  for (const row of data.domainRows) {
    if (row.section === "behavior") continue;
    const tested = row.score0 + row.score1 + row.score2;
    if (tested === 0) {
      lines.push(`- ${formatDomainScoreLabel(row)}：全部为未测`);
    } else {
      lines.push(
        `- ${formatDomainScoreLabel(row)}：独立(2) ${row.score2}、部分(1) ${row.score1}、` +
          `大量辅助(0) ${row.score0}、未测 ${row.nt}，融合能力率 ${Math.round(row.passRate ?? 0)}%`,
      );
    }
  }

  lines.push("", "问题行为记录：");
  const behaviors = data.behaviorRecords.filter((b) =>
    b.behavior_description?.trim(),
  );
  if (behaviors.length === 0) {
    lines.push("- 未记录问题行为");
  } else {
    for (const b of behaviors) {
      lines.push(`- ${b.behavior_description!.trim()}`);
    }
  }

  return lines.join("\n");
}

export async function generateIntegrationReportNarratives(
  data: IntegrationReportData,
): Promise<IntegrationReportContent> {
  const config = getIntegrationConfig(data.toolType);
  const domainKeys = data.domainRows
    .filter((r) => r.domainKey !== "behavior")
    .map((r) => r.domainKey);

  const stageLabel =
    data.toolType === "kg_integration" ? "幼儿园融合（入园）" : "小学融合（入校）";
  const contextHint =
    data.toolType === "kg_integration"
      ? "集体生活、区域游戏、户外、幼小衔接"
      : "入校常规、课堂参与、课间户外、学业任务、同伴社交";

  const systemPrompt = buildIntegrationReportSystemPrompt({
    stageLabel,
    domainKeys,
    contextHint,
  });
  const userPrompt = buildIntegrationReportUserPrompt(
    buildAssessmentPayload(data),
    config.title,
  );

  const response = await chatCompletion(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    { jsonMode: true, timeoutMs: 120_000 },
  );

  const parsed = JSON.parse(response.content) as Partial<
    Pick<
      IntegrationReportContent,
      | "domainAnalysis"
      | "domainRecommendations"
      | "behaviorAnalysis"
      | "behaviorRecommendation"
    >
  >;

  const domainAnalysis: Record<string, string> = {};
  const domainRecommendations: Record<string, string> = {};

  for (const row of data.domainRows) {
    if (row.domainKey === "behavior") continue;
    const tested = row.score0 + row.score1 + row.score2;
    domainAnalysis[row.domainKey] =
      tested === 0
        ? `优势：本领域均为未测，暂无有效数据。\n弱势：—`
        : (parsed.domainAnalysis?.[row.domainKey] ??
          data.reportContent.domainAnalysis[row.domainKey] ??
          "");
    domainRecommendations[row.domainKey] =
      parsed.domainRecommendations?.[row.domainKey] ??
      data.reportContent.domainRecommendations[row.domainKey] ??
      "";
  }

  return {
    ...data.reportContent,
    domainAnalysis,
    domainRecommendations,
    behaviorAnalysis:
      parsed.behaviorAnalysis ?? data.reportContent.behaviorAnalysis,
    behaviorRecommendation:
      parsed.behaviorRecommendation ??
      data.reportContent.behaviorRecommendation,
  };
}
