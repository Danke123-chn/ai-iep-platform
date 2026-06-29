import type { VbMappBarrier, VbMappMilestone, VbMappTransition } from "@/lib/types/assessment_types";
import {
  getVbMappSeverityLabel,
  isVbMappNt,
  VB_MAPP_DOMAINS_ZH,
} from "@/lib/types/assessment_types";
import {
  buildDomainScoreRows,
  estimateDominantLevel,
  levelLabelZh,
} from "@/lib/vbmapp-report/score-data";
import {
  type VbMappDomainScoreRow,
  type VbMappReportContent,
} from "@/lib/vbmapp-report/types";

export function parseReportContent(
  summary: string | null,
): VbMappReportContent | null {
  if (!summary?.trim()) return null;
  try {
    const parsed = JSON.parse(summary) as VbMappReportContent & {
      version?: number;
      tool?: string;
    };
    if (
      (parsed.version === 1 || parsed.version === 2) &&
      parsed.tool !== "c_pep3" &&
      parsed.tool !== "kg_integration" &&
      parsed.tool !== "elem_integration"
    ) {
      return {
        version: 1,
        assessorName: parsed.assessorName ?? "",
        observationNarrative: parsed.observationNarrative,
        overallConclusion: parsed.overallConclusion,
        domainNarratives: parsed.domainNarratives,
        barrierNarrative: parsed.barrierNarrative,
        transitionNarrative: parsed.transitionNarrative,
        summaryRecommendations: parsed.summaryRecommendations,
      };
    }
  } catch {
    return null;
  }
  return null;
}

function defaultDomainNarrative(row: VbMappDomainScoreRow): string {
  const tested = row.passed + row.partial + row.failed;
  if (tested === 0) {
    return `${row.domainLabel}：暂无有效测查数据。`;
  }
  const passRate = Math.round((row.passed / tested) * 100);
  return (
    `${row.domainLabel}：共评估 ${tested} 项里程碑，得 1 分 ${row.passed} 项、` +
    `1/2 分 ${row.partial} 项、0 分 ${row.failed} 项` +
    `${row.notTested > 0 ? `、未测 ${row.notTested} 项` : ""}，` +
    `1 分率 ${passRate}%。` +
    `第一级得分 ${row.level1Score}/${row.level1Total}，` +
    `第二级得分 ${row.level2Score}/${row.level2Total}，` +
    `第三级得分 ${row.level3Score}/${row.level3Total}。`
  );
}

function defaultOverallConclusion(
  dominantLevel: 1 | 2 | 3 | null,
  domainScores: VbMappDomainScoreRow[],
): string {
  const levelText = levelLabelZh(dominantLevel);
  const weakDomains = domainScores
    .filter((d) => {
      const tested = d.passed + d.partial + d.failed;
      return tested > 0 && d.passed / tested < 0.5;
    })
    .map((d) => d.domainLabel);

  let text = `评估结果表明，孩子各项能力主要处于${levelText}发展水平。`;
  if (weakDomains.length > 0) {
    text += `相对薄弱的领域包括：${weakDomains.join("、")}。`;
  }
  return text;
}

function countScoredItems(items: { score: string }[]) {
  const untested = items.filter((i) => isVbMappNt(i.score)).length;
  const total = items.length;
  return {
    total,
    untested,
    scored: total - untested,
    allUntested: total > 0 && untested === total,
  };
}

export const BARRIER_ALL_UNTESTED_NARRATIVE =
  "障碍评估：本次评估中障碍评估部分均为未测，暂无有效障碍评分数据，无法对障碍分布作出解读。建议补测障碍评估后再更新报告。";

export const TRANSITION_ALL_UNTESTED_NARRATIVE =
  "转衔评估：本次评估中转衔评估部分均为未测，暂无有效转衔评分数据，无法对安置准备情况作出解读。建议补测转衔评估后再更新报告。";

function defaultBarrierNarrative(
  barriers: (VbMappBarrier & { score: string })[],
): string {
  const stats = countScoredItems(barriers);
  if (stats.allUntested) {
    return BARRIER_ALL_UNTESTED_NARRATIVE;
  }

  const scored = barriers.filter((b) => !isVbMappNt(b.score));
  const significant = scored
    .filter((b) => Number(b.score) >= 2)
    .sort((a, b) => Number(b.score) - Number(a.score));

  if (significant.length === 0) {
    const ntHint =
      stats.untested > 0 ? `（另有 ${stats.untested} 项未测）` : "";
    return `障碍评估：已测 ${stats.scored} 项中未发现显著障碍（≥2 分），整体表现良好${ntHint}。`;
  }

  const names = significant
    .slice(0, 5)
    .map((b) => `${b.barrier_name_zh}（${getVbMappSeverityLabel(b.score)}）`);
  const ntHint =
    stats.untested > 0 ? `另有 ${stats.untested} 项未测。` : "";
  return `障碍评估：相较而言，需重点关注的障碍包括 ${names.join("、")}。${ntHint}`;
}

function defaultTransitionNarrative(
  transitions: (VbMappTransition & { score: string })[],
): string {
  const stats = countScoredItems(transitions);
  if (stats.allUntested) {
    return TRANSITION_ALL_UNTESTED_NARRATIVE;
  }

  const scored = transitions.filter((t) => !isVbMappNt(t.score));
  const weak = scored.filter((t) => Number(t.score) <= 1);
  const strong = scored.filter((t) => Number(t.score) >= 3);

  let text = "转衔评估：从转衔评估结果看，";
  if (strong.length > 0) {
    text += `表现较好的转衔技能：${strong.slice(0, 3).map((t) => t.transition_name_zh).join("、")}。`;
  }
  if (weak.length > 0) {
    text += `需加强的转衔技能：${weak.slice(0, 3).map((t) => t.transition_name_zh).join("、")}。`;
  }
  if (strong.length === 0 && weak.length === 0) {
    text += "已测项目整体处于中等水平。";
  }
  if (stats.untested > 0) {
    text += `另有 ${stats.untested} 项转衔评估未测。`;
  }
  return text;
}

function defaultSummary(
  studentName: string,
  dominantLevel: 1 | 2 | 3 | null,
): string {
  return (
    `${studentName} 的 VB-MAPP 评估已完成。建议根据评估结果制定个别化干预计划，` +
    `重点关注里程碑薄弱领域及障碍评估中的显著项目。` +
    `当前能力水平参考：${levelLabelZh(dominantLevel)}。` +
    `建议在六个月后复评，以确定干预效果及安置调整方向。`
  );
}

export function buildDefaultReportContent(params: {
  studentName: string;
  milestones: VbMappMilestone[];
  milestoneScores: Record<string, string>;
  barriers: (VbMappBarrier & { score: string })[];
  transitions: (VbMappTransition & { score: string })[];
  sessionNotes?: string | null;
  existing?: VbMappReportContent | null;
}): VbMappReportContent {
  const domainScores = buildDomainScoreRows(
    params.milestones,
    params.milestoneScores,
  );
  const dominantLevel = estimateDominantLevel(
    params.milestones,
    params.milestoneScores,
  );

  const domainNarratives: Record<string, string> = {};
  for (const row of domainScores) {
    domainNarratives[row.domain] =
      params.existing?.domainNarratives[row.domain] ??
      defaultDomainNarrative(row);
  }

  for (const domain of Object.keys(VB_MAPP_DOMAINS_ZH)) {
    if (!domainNarratives[domain] && params.existing?.domainNarratives[domain]) {
      domainNarratives[domain] = params.existing.domainNarratives[domain];
    }
  }

  return {
    version: 1,
    assessorName: params.existing?.assessorName ?? "",
    observationNarrative:
      params.existing?.observationNarrative ??
      params.sessionNotes?.trim() ??
      "（请填写评估过程观察记录，或通过 AI 生成报告解读。）",
    overallConclusion:
      params.existing?.overallConclusion ??
      defaultOverallConclusion(dominantLevel, domainScores),
    domainNarratives,
    barrierNarrative:
      countScoredItems(params.barriers).allUntested
        ? defaultBarrierNarrative(params.barriers)
        : (params.existing?.barrierNarrative ??
          defaultBarrierNarrative(params.barriers)),
    transitionNarrative:
      countScoredItems(params.transitions).allUntested
        ? defaultTransitionNarrative(params.transitions)
        : (params.existing?.transitionNarrative ??
          defaultTransitionNarrative(params.transitions)),
    summaryRecommendations:
      params.existing?.summaryRecommendations ??
      defaultSummary(params.studentName, dominantLevel),
  };
}
