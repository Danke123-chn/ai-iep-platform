import { chatCompletion } from "@/lib/deepseek";
import {
  buildVbMappReportSystemPrompt,
  VB_MAPP_REPORT_USER_PROMPT_PREFIX,
} from "@/lib/prompts/reports/vb-mapp";
import type { VbMappReportData } from "@/lib/vbmapp-report/types";
import type { VbMappReportContent } from "@/lib/vbmapp-report/types";
import { levelLabelZh } from "@/lib/vbmapp-report/score-data";
import {
  BARRIER_ALL_UNTESTED_NARRATIVE,
  TRANSITION_ALL_UNTESTED_NARRATIVE,
} from "@/lib/vbmapp-report/report-content";
import { getVbMappSeverityLabel, isVbMappNt } from "@/lib/types/assessment_types";

function allUntested(items: { score: string }[]): boolean {
  return items.length > 0 && items.every((i) => isVbMappNt(i.score));
}

function buildAssessmentPayload(data: VbMappReportData): string {
  const lines: string[] = [
    `学生：${data.student.name}`,
    `评估日期：${data.session.session_date}`,
    `能力水平参考：${levelLabelZh(data.dominantLevel)}`,
    "",
    "里程碑各领域得分：",
  ];

  for (const row of data.domainScores) {
    lines.push(
      `- ${row.domainLabel}：1分${row.passed}、1/2分${row.partial}、0分${row.failed}、未测${row.notTested}；L1 ${row.level1Score}/${row.level1Total}，L2 ${row.level2Score}/${row.level2Total}，L3 ${row.level3Score}/${row.level3Total}`,
    );
  }

  const barrierUntested = data.barriers.filter((b) => isVbMappNt(b.score)).length;
  const transitionUntested = data.transitions.filter((t) =>
    isVbMappNt(t.score),
  ).length;

  lines.push(
    "",
    `障碍评估：共 ${data.barriers.length} 项，未测 ${barrierUntested} 项，已测 ${data.barriers.length - barrierUntested} 项`,
  );
  if (allUntested(data.barriers)) {
    lines.push("（障碍评估全部为未测，请勿编造障碍解读）");
  } else {
    lines.push("显著障碍（≥2分，仅已测项）：");
    for (const b of data.barriers) {
      if (!isVbMappNt(b.score) && Number(b.score) >= 2) {
        lines.push(`- ${b.barrier_name_zh}：${getVbMappSeverityLabel(b.score)}`);
      }
    }
  }

  lines.push(
    "",
    `转衔评估：共 ${data.transitions.length} 项，未测 ${transitionUntested} 项，已测 ${data.transitions.length - transitionUntested} 项`,
  );
  if (allUntested(data.transitions)) {
    lines.push("（转衔评估全部为未测，请勿编造转衔解读）");
  } else {
    for (const t of data.transitions) {
      if (!isVbMappNt(t.score)) {
        lines.push(`- ${t.transition_name_zh}：${getVbMappSeverityLabel(t.score)}`);
      }
    }
  }

  return lines.join("\n");
}

export async function generateVbMappReportNarratives(
  data: VbMappReportData,
): Promise<VbMappReportContent> {
  const barriersAllNt = allUntested(data.barriers);
  const transitionsAllNt = allUntested(data.transitions);

  const systemPrompt = buildVbMappReportSystemPrompt();
  const userPrompt = `${VB_MAPP_REPORT_USER_PROMPT_PREFIX}\n\n${buildAssessmentPayload(data)}`;

  const response = await chatCompletion(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    { jsonMode: true, timeoutMs: 120_000 },
  );

  const parsed = JSON.parse(response.content) as Partial<VbMappReportContent>;

  const barrierNarrative = barriersAllNt
    ? BARRIER_ALL_UNTESTED_NARRATIVE
    : (parsed.barrierNarrative ?? data.reportContent.barrierNarrative);

  const transitionNarrative = transitionsAllNt
    ? TRANSITION_ALL_UNTESTED_NARRATIVE
    : (parsed.transitionNarrative ?? data.reportContent.transitionNarrative);

  return {
    ...data.reportContent,
    observationNarrative:
      parsed.observationNarrative ?? data.reportContent.observationNarrative,
    overallConclusion:
      parsed.overallConclusion ?? data.reportContent.overallConclusion,
    domainNarratives: {
      ...data.reportContent.domainNarratives,
      ...(parsed.domainNarratives ?? {}),
    },
    barrierNarrative,
    transitionNarrative,
    summaryRecommendations:
      parsed.summaryRecommendations ??
      data.reportContent.summaryRecommendations,
  };
}
