import { chatCompletion } from "@/lib/deepseek";
import type { VbMappReportData } from "@/lib/vbmapp-report/types";
import type { VbMappReportContent } from "@/lib/vbmapp-report/types";
import { levelLabelZh } from "@/lib/vbmapp-report/score-data";
import {
  BARRIER_ALL_UNTESTED_NARRATIVE,
  TRANSITION_ALL_UNTESTED_NARRATIVE,
} from "@/lib/vbmapp-report/report-content";
import { getVbMappSeverityLabel, isVbMappNt } from "@/lib/types/assessment_types";
import { VB_MAPP_DOMAINS_ZH } from "@/lib/types/assessment_types";

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
  const domainList = Object.values(VB_MAPP_DOMAINS_ZH).join("、");
  const barriersAllNt = allUntested(data.barriers);
  const transitionsAllNt = allUntested(data.transitions);

  const systemPrompt = `你是一位精通 VB-MAPP 的中国特殊教育评估师，负责撰写「蛋壳融合教育」风格的 VB-MAPP 评估报告文字解读。

要求：
- 使用专业、客观、温暖的中文表述，面向家长可读
- 观察记录应描述评估过程中的行为表现（注意力、配合度、自发语言、游戏方式等）
- 各领域解读须结合得分数据，说明优势与待提升点
- 若障碍评估全部为未测，barrierNarrative 须明确写「均为未测，暂无有效数据」，不得编造任何障碍解读
- 若转衔评估全部为未测，transitionNarrative 须明确写「均为未测，暂无有效数据」，不得编造任何转衔解读
- 不要编造与数据明显矛盾的内容
- 输出严格 JSON，不要 markdown 代码块

JSON 结构：
{
  "observationNarrative": "评估过程观察（2-4段，用\\n分段）",
  "overallConclusion": "综合结论（1-2段，含能力阶段判断）",
  "domainNarratives": { "mand": "提要求领域解读", ... },
  "barrierNarrative": "障碍评估解读（1段）",
  "transitionNarrative": "转衔评估解读（1段）",
  "summaryRecommendations": "总结与建议（2-4段，含服务建议方向，不含具体IEP课程目标）"
}

domainNarratives 的 key 必须使用英文领域 slug：${Object.keys(VB_MAPP_DOMAINS_ZH).join(", ")}
对应中文领域：${domainList}`;

  const userPrompt = `请根据以下 VB-MAPP 评估数据撰写报告解读：\n\n${buildAssessmentPayload(data)}`;

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
