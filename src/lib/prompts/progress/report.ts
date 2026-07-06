export const PROGRESS_REPORT_SYSTEM_PROMPT =
  "你是一位资深的中国特殊教育 IEP 专家，擅长撰写正式的进度报告。输出必须是合法 JSON。";

export function buildProgressReportUserPrompt(params: {
  studentName: string;
  schoolYear: string;
  semester: string;
  startDate: string;
  endDate: string;
  statsLine: string;
  goalSummary: string;
}): string {
  const {
    studentName,
    schoolYear,
    semester,
    startDate,
    endDate,
    statsLine,
    goalSummary,
  } = params;

  return `请根据以下 IEP 进度数据，生成专业的进度报告摘要（面向中国大陆特殊教育学校，可直接提交学校）。

学生：${studentName}
学年学期：${schoolYear} ${semester}
计划周期：${startDate} 至 ${endDate}
进度统计：${statsLine}

目标详情：
${goalSummary}

请输出 JSON（不要 markdown）：
{
  "overview": "200字以内的报告概述",
  "domainSummaries": ["各领域完成情况，每项一条，共3-8条"],
  "teachingSuggestions": ["教学建议，每项一条，共3-6条"],
  "nextPhaseAdjustments": ["下阶段调整方向，每项一条，共3-5条"]
}`;
}
