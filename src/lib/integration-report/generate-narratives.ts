import { chatCompletion } from "@/lib/deepseek";
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

  const systemPrompt = `你是一位资深的中国融合教育评估师，负责撰写「${stageLabel}」融合能力评估报告文字解读。

要求：
- 格式参照标准融合能力评估报告：每个领域含「优势」「弱势」的现状分析，以及融合教育建议
- 使用专业、客观、温暖的中文，面向家长与班级教师可读
- 须结合 0/1/2 分及融合能力率数据；若某领域全部为未测，须明确说明，不得编造
- 问题行为领域须结合行为记录撰写；若无记录则说明未观察到明显问题行为
- 建议须体现融合教育情境（${data.toolType === "kg_integration" ? "集体生活、区域游戏、户外、幼小衔接" : "入校常规、课堂参与、课间户外、学业任务、同伴社交"}）
- 输出严格 JSON，不要 markdown 代码块

JSON 结构：
{
  "domainAnalysis": { "daily_life": "优势：...\\n弱势：...", ... },
  "domainRecommendations": { "daily_life": "建议...", ... },
  "behaviorAnalysis": "优势：...\\n弱势：...",
  "behaviorRecommendation": "建议..."
}

领域 key：${domainKeys.join(", ")}`;

  const userPrompt = `${buildAssessmentPayload(data)}

请为上述 ${config.title} 数据生成各领域现状分析（含优势、弱势）与融合教育建议。`;

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
