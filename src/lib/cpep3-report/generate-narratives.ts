import { chatCompletion } from "@/lib/deepseek";
import {
  buildCpep3ReportSystemPrompt,
  C_PEP3_REPORT_USER_PROMPT_PREFIX,
} from "@/lib/prompts/reports/c-pep3";
import type { Cpep3ReportData } from "@/lib/cpep3-report/types";
import type { Cpep3ReportContent } from "@/lib/cpep3-report/types";

function buildAssessmentPayload(data: Cpep3ReportData): string {
  const lines: string[] = [
    `学生：${data.student.name}`,
    `评估日期：${data.session.session_date}`,
    "",
    "发展领域汇总：",
  ];

  for (const row of data.devSummary) {
    lines.push(
      `- ${row.domain_label_zh}：P${row.passed_count} E${row.emerging_count} F${row.failed_count} NT${row.not_tested_count}，通过率 ${Math.round(Number(row.pass_rate ?? 0))}%`,
    );
  }

  lines.push(
    "",
    `发展领域合计：通过 ${data.devTotalPassed}、中间 ${data.devTotalEmerging}、不通过 ${data.devTotalFailed}、未测 ${data.devTotalNotTested}`,
    "",
    "病理/行为表现领域汇总：",
  );

  for (const row of data.patSummary) {
    const tested =
      Number(row.appropriate_count) +
      Number(row.mild_count) +
      Number(row.severe_count);
    const abnormal = Number(row.mild_count) + Number(row.severe_count);
    const rate = tested > 0 ? Math.round((abnormal / tested) * 100) : 0;
    if (tested === 0) {
      lines.push(`- ${row.domain_label_zh}：全部为未测（${row.not_tested_count} 项）`);
    } else {
      lines.push(
        `- ${row.domain_label_zh}：A${row.appropriate_count} M${row.mild_count} S${row.severe_count} NT${row.not_tested_count}，异常比例 ${rate}%`,
      );
    }
  }

  return lines.join("\n");
}

export async function generateCpep3ReportNarratives(
  data: Cpep3ReportData,
): Promise<Cpep3ReportContent> {
  const systemPrompt = buildCpep3ReportSystemPrompt();
  const userPrompt = `${C_PEP3_REPORT_USER_PROMPT_PREFIX}\n\n${buildAssessmentPayload(data)}`;

  const response = await chatCompletion(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    { jsonMode: true, timeoutMs: 120_000 },
  );

  const parsed = JSON.parse(response.content) as Partial<
    Omit<Cpep3ReportContent, "tool" | "version" | "assessorName">
  >;

  const mergeDomainNarratives = (
    defaults: Record<string, string>,
    incoming?: Record<string, string>,
  ) => ({ ...defaults, ...(incoming ?? {}) });

  const devDomainNarratives = mergeDomainNarratives(
    data.reportContent.devDomainNarratives,
    parsed.devDomainNarratives,
  );
  const patDomainNarratives = mergeDomainNarratives(
    data.reportContent.patDomainNarratives,
    parsed.patDomainNarratives,
  );

  for (const row of data.patSummary) {
    const allNt = Number(row.not_tested_count) === Number(row.total_items);
    if (allNt) {
      patDomainNarratives[row.domain] =
        `${row.domain_label_zh}：本领域均为未测，暂无有效测查数据。`;
    }
  }
  for (const row of data.devSummary) {
    const tested =
      Number(row.passed_count) +
      Number(row.emerging_count) +
      Number(row.failed_count);
    if (tested === 0) {
      devDomainNarratives[row.domain] =
        `${row.domain_label_zh}：本领域均为未测，暂无有效测查数据。`;
    }
  }

  return {
    ...data.reportContent,
    observationNarrative:
      parsed.observationNarrative ?? data.reportContent.observationNarrative,
    overallConclusion:
      parsed.overallConclusion ?? data.reportContent.overallConclusion,
    strengthWeaknessSummary:
      parsed.strengthWeaknessSummary ??
      data.reportContent.strengthWeaknessSummary,
    devDomainNarratives,
    patDomainNarratives,
    trainingOutline:
      parsed.trainingOutline ?? data.reportContent.trainingOutline,
    cooperationLevel:
      parsed.cooperationLevel ?? data.reportContent.cooperationLevel,
    familyExpectations:
      parsed.familyExpectations ?? data.reportContent.familyExpectations,
    summaryRecommendations:
      parsed.summaryRecommendations ??
      data.reportContent.summaryRecommendations,
  };
}
