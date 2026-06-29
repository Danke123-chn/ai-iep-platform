import { chatCompletion } from "@/lib/deepseek";
import type { Cpep3ReportData } from "@/lib/cpep3-report/types";
import type { Cpep3ReportContent } from "@/lib/cpep3-report/types";
import {
  C_PEP3_DEV_DOMAINS_ZH,
  C_PEP3_PAT_DOMAINS_ZH,
} from "@/lib/types/assessment_types";

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
  const devDomains = Object.values(C_PEP3_DEV_DOMAINS_ZH).join("、");
  const patDomains = Object.values(C_PEP3_PAT_DOMAINS_ZH).join("、");

  const systemPrompt = `你是一位精通 C-PEP-3（中国版心理教育量表第三版）的中国特殊教育评估师，负责撰写 PEP 心理教育量表风格的评估报告文字解读。

要求：
- 使用专业、客观、温暖的中文表述，面向家长可读
- 格式参照 PEP-3 标准评估报告：评估总结、优势/劣势、发展领域解读、病理/行为表现解读、教育训练纲要、家庭期望
- 各领域解读须结合 P/E/F 或 A/M/S/NT 得分数据
- 若某领域全部为未测（NT），须明确说明未测，不得编造该领域解读
- 不要编造与数据明显矛盾的内容
- 输出严格 JSON，不要 markdown 代码块

JSON 结构：
{
  "observationNarrative": "评估过程观察（2-3段，用\\n分段）",
  "overallConclusion": "综合结论（1-2段）",
  "strengthWeaknessSummary": "优势与待加强领域简要评价（1段）",
  "devDomainNarratives": { "imitation": "模仿领域解读", ... },
  "patDomainNarratives": { "affect": "情感领域解读", ... },
  "trainingOutline": "教育训练纲要（2-4段，针对薄弱领域的训练方向）",
  "cooperationLevel": "受试者合作程度描述（1段）",
  "familyExpectations": "家庭养育环境及家长期望建议（1-2段，可含引导家长填写的内容框架）",
  "summaryRecommendations": "总结与建议（2-3段）"
}

发展领域 key：${Object.keys(C_PEP3_DEV_DOMAINS_ZH).join(", ")}（${devDomains}）
病理领域 key：${Object.keys(C_PEP3_PAT_DOMAINS_ZH).join(", ")}（${patDomains}）`;

  const userPrompt = `请根据以下 C-PEP-3 评估数据撰写报告解读：\n\n${buildAssessmentPayload(data)}`;

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
