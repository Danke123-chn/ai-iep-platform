import type {
  Cpep3DevSummary,
  Cpep3PatSummary,
} from "@/lib/types/assessment_types";
import {
  C_PEP3_DEV_DOMAINS_ZH,
  C_PEP3_PAT_DOMAINS_ZH,
} from "@/lib/types/assessment_types";
import {
  CPEP3_REPORT_TOOL,
  type Cpep3ReportContent,
} from "@/lib/cpep3-report/types";

export function isCpep3ReportContent(
  value: unknown,
): value is Cpep3ReportContent {
  return (
    typeof value === "object" &&
    value !== null &&
    "tool" in value &&
    (value as Cpep3ReportContent).tool === CPEP3_REPORT_TOOL
  );
}

export function parseCpep3ReportContent(
  summary: string | null,
): Cpep3ReportContent | null {
  if (!summary?.trim()) return null;
  try {
    const parsed = JSON.parse(summary) as Cpep3ReportContent;
    if (isCpep3ReportContent(parsed)) return parsed;
  } catch {
    return null;
  }
  return null;
}

function defaultDevDomainNarrative(row: Cpep3DevSummary): string {
  const tested =
    Number(row.passed_count) +
    Number(row.emerging_count) +
    Number(row.failed_count);
  if (tested === 0) {
    return `${row.domain_label_zh}：本领域均为未测，暂无有效测查数据。`;
  }
  const rate = Math.round(Number(row.pass_rate ?? 0));
  return (
    `${row.domain_label_zh}：共 ${row.total_items} 项，通过 ${row.passed_count} 项、` +
    `中间反应 ${row.emerging_count} 项、不通过 ${row.failed_count} 项` +
    `${Number(row.not_tested_count) > 0 ? `、未测 ${row.not_tested_count} 项` : ""}，` +
    `通过率 ${rate}%。`
  );
}

function defaultPatDomainNarrative(row: Cpep3PatSummary): string {
  const tested =
    Number(row.appropriate_count) +
    Number(row.mild_count) +
    Number(row.severe_count);
  if (tested === 0) {
    return `${row.domain_label_zh}：本领域均为未测，暂无有效测查数据。`;
  }
  const abnormal = Number(row.mild_count) + Number(row.severe_count);
  const rate = Math.round((abnormal / tested) * 100);
  return (
    `${row.domain_label_zh}：共 ${row.total_items} 项，适当 ${row.appropriate_count} 项、` +
    `轻度异常 ${row.mild_count} 项、严重异常 ${row.severe_count} 项` +
    `${Number(row.not_tested_count) > 0 ? `、未测 ${row.not_tested_count} 项` : ""}，` +
    `异常比例 ${rate}%。`
  );
}

function defaultStrengthWeakness(devSummary: Cpep3DevSummary[]): string {
  const tested = devSummary.filter(
    (d) =>
      Number(d.passed_count) +
        Number(d.emerging_count) +
        Number(d.failed_count) >
      0,
  );
  if (tested.length === 0) {
    return "发展领域均为未测，暂无法归纳优势与劣势领域。";
  }
  const sorted = [...tested].sort(
    (a, b) => Number(b.pass_rate ?? 0) - Number(a.pass_rate ?? 0),
  );
  const strengths = sorted
    .filter((d) => Number(d.pass_rate ?? 0) >= 50)
    .slice(0, 3)
    .map((d) => d.domain_label_zh);
  const weaknesses = [...tested]
    .sort((a, b) => Number(a.pass_rate ?? 0) - Number(b.pass_rate ?? 0))
    .filter((d) => Number(d.pass_rate ?? 0) < 50)
    .slice(0, 3)
    .map((d) => d.domain_label_zh);

  let text = "";
  if (strengths.length > 0) text += `优势领域：${strengths.join("、")}。`;
  if (weaknesses.length > 0) text += `待加强领域：${weaknesses.join("、")}。`;
  if (!text) text = "各发展领域表现较为均衡，需结合具体项目进一步分析。";
  return text;
}

function defaultOverallConclusion(
  studentName: string,
  devSummary: Cpep3DevSummary[],
): string {
  const totals = devSummary.reduce(
    (acc, row) => {
      acc.passed += Number(row.passed_count);
      acc.emerging += Number(row.emerging_count);
      acc.failed += Number(row.failed_count);
      acc.nt += Number(row.not_tested_count);
      return acc;
    },
    { passed: 0, emerging: 0, failed: 0, nt: 0 },
  );
  const tested = totals.passed + totals.emerging + totals.failed;
  if (tested === 0) {
    return `${studentName} 的 C-PEP-3 发展领域评估均为未测，请补测后再形成综合结论。`;
  }
  const passRate = Math.round((totals.passed / tested) * 100);
  return (
    `评估结果表明，${studentName} 在 C-PEP-3 发展领域共测查 ${tested} 项，` +
    `通过 ${totals.passed} 项、中间反应 ${totals.emerging} 项、不通过 ${totals.failed} 项` +
    `${totals.nt > 0 ? `，另有 ${totals.nt} 项未测` : ""}，` +
    `整体通过率约 ${passRate}%。`
  );
}

function defaultSummary(studentName: string): string {
  return (
    `${studentName} 的 C-PEP-3 评估已完成。建议根据发展领域与病理/行为表现评估结果，` +
    `制定个别化教育训练纲要，并在六个月后复评以检验干预效果。`
  );
}

export function buildDefaultCpep3ReportContent(params: {
  studentName: string;
  devSummary: Cpep3DevSummary[];
  patSummary: Cpep3PatSummary[];
  sessionNotes?: string | null;
  existing?: Cpep3ReportContent | null;
}): Cpep3ReportContent {
  const devDomainNarratives: Record<string, string> = {};
  for (const row of params.devSummary) {
    devDomainNarratives[row.domain] =
      params.existing?.devDomainNarratives[row.domain] ??
      defaultDevDomainNarrative(row);
  }
  for (const domain of Object.keys(C_PEP3_DEV_DOMAINS_ZH)) {
    if (
      !devDomainNarratives[domain] &&
      params.existing?.devDomainNarratives[domain]
    ) {
      devDomainNarratives[domain] =
        params.existing.devDomainNarratives[domain];
    }
  }

  const patDomainNarratives: Record<string, string> = {};
  for (const row of params.patSummary) {
    const allNt = Number(row.not_tested_count) === Number(row.total_items);
    patDomainNarratives[row.domain] = allNt
      ? defaultPatDomainNarrative(row)
      : (params.existing?.patDomainNarratives[row.domain] ??
        defaultPatDomainNarrative(row));
  }
  for (const domain of Object.keys(C_PEP3_PAT_DOMAINS_ZH)) {
    if (
      !patDomainNarratives[domain] &&
      params.existing?.patDomainNarratives[domain]
    ) {
      patDomainNarratives[domain] =
        params.existing.patDomainNarratives[domain];
    }
  }

  return {
    tool: CPEP3_REPORT_TOOL,
    version: 1,
    assessorName: params.existing?.assessorName ?? "",
    observationNarrative:
      params.existing?.observationNarrative ??
      params.sessionNotes?.trim() ??
      "（请填写评估过程观察记录，或通过 AI 生成报告解读。）",
    overallConclusion:
      params.existing?.overallConclusion ??
      defaultOverallConclusion(params.studentName, params.devSummary),
    strengthWeaknessSummary:
      params.existing?.strengthWeaknessSummary ??
      defaultStrengthWeakness(params.devSummary),
    devDomainNarratives,
    patDomainNarratives,
    trainingOutline:
      params.existing?.trainingOutline ??
      "（请根据评估结果填写教育训练纲要，或通过 AI 生成。）",
    cooperationLevel:
      params.existing?.cooperationLevel ??
      "（请填写受试者合作程度，如：良好 / 一般 / 较差。）",
    familyExpectations:
      params.existing?.familyExpectations ??
      "（请填写家庭养育环境及家长期望。）",
    summaryRecommendations:
      params.existing?.summaryRecommendations ??
      defaultSummary(params.studentName),
  };
}
