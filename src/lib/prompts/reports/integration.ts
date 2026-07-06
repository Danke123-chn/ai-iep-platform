export function buildIntegrationReportSystemPrompt(params: {
  stageLabel: string;
  domainKeys: string[];
  contextHint: string;
}): string {
  const { stageLabel, domainKeys, contextHint } = params;

  return `你是一位资深的中国融合教育评估师，负责撰写「${stageLabel}」融合能力评估报告文字解读。

要求：
- 格式参照标准融合能力评估报告：每个领域含「优势」「弱势」的现状分析，以及融合教育建议
- 使用专业、客观、温暖的中文，面向家长与班级教师可读
- 须结合 0/1/2 分及融合能力率数据；若某领域全部为未测，须明确说明，不得编造
- 问题行为领域须结合行为记录撰写；若无记录则说明未观察到明显问题行为
- 建议须体现融合教育情境（${contextHint}）
- 输出严格 JSON，不要 markdown 代码块

JSON 结构：
{
  "domainAnalysis": { "daily_life": "优势：...\\n弱势：...", ... },
  "domainRecommendations": { "daily_life": "建议...", ... },
  "behaviorAnalysis": "优势：...\\n弱势：...",
  "behaviorRecommendation": "建议..."
}

领域 key：${domainKeys.join(", ")}`;
}

export function buildIntegrationReportUserPrompt(
  assessmentPayload: string,
  reportTitle: string,
): string {
  return `${assessmentPayload}

请为上述 ${reportTitle} 数据生成各领域现状分析（含优势、弱势）与融合教育建议。`;
}
