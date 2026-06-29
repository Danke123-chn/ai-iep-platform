import type {
  Cpep3DevSummary,
  Cpep3PatSummary,
  KgIntegrationBehaviorRecord,
  KgIntegrationSummary,
  VbMappBarrier,
  VbMappMilestoneSummary,
  VbMappTransition,
  BarrierScore,
} from "@/lib/types/assessment_types";
import { VB_MAPP_DOMAINS_ZH } from "@/lib/types/assessment_types";
import {
  getIntegrationConfig,
  type IntegrationAssessmentTool,
} from "@/lib/assessments/integration-assessment-config";
import {
  ASSESSMENT_DOMAIN_KEYS,
  ASSESSMENT_DOMAIN_LABELS,
  ASSESSMENT_LEVEL_LABELS,
  type AssessmentLevel,
  type IepFormDomain,
} from "@/types/iep";

function passRateToLevel(rate: number): AssessmentLevel {
  if (rate >= 0.8) return 5;
  if (rate >= 0.6) return 4;
  if (rate >= 0.4) return 3;
  if (rate >= 0.2) return 2;
  return 1;
}

function calcPassRate(passed: number, partial: number, total: number): number {
  if (total <= 0) return 0;
  return (passed + partial * 0.5) / total;
}

function buildDescription(
  label: string,
  level: AssessmentLevel,
  detail: string,
): string {
  return `基于专业评估结果，${label}综合表现为 ${level} 级（${ASSESSMENT_LEVEL_LABELS[level]}）。${detail}`;
}

function scoreNum(score: BarrierScore): number | null {
  if (score === "NT") return null;
  return Number(score);
}

/** 手动新建 IEP 时使用六大通用领域 */
export function createGenericIepDomains(): IepFormDomain[] {
  return ASSESSMENT_DOMAIN_KEYS.map((key) => ({
    key,
    name: ASSESSMENT_DOMAIN_LABELS[key],
    level: null,
    description: "",
  }));
}

/** VB-MAPP：按里程碑领域 + 障碍 + 过渡原生结构映射 */
export function mapVbMappToIepDomains(
  summary: VbMappMilestoneSummary[],
  barrierAvg: number,
  transitionAvg: number,
  barriers: (VbMappBarrier & { score: BarrierScore })[] = [],
  transitions: (VbMappTransition & { score: BarrierScore })[] = [],
): IepFormDomain[] {
  type DomainAgg = {
    label: string;
    passed: number;
    partial: number;
    tested: number;
    notTested: number;
    levels: number[];
  };

  const byDomain = new Map<string, DomainAgg>();

  for (const row of summary) {
    const existing = byDomain.get(row.domain) ?? {
      label: row.domain_label_zh || VB_MAPP_DOMAINS_ZH[row.domain] || row.domain,
      passed: 0,
      partial: 0,
      tested: 0,
      notTested: 0,
      levels: [],
    };
    const notTested = Number(row.not_tested ?? 0);
    const total = Number(row.total_milestones);
    const tested = total - notTested;
    existing.passed += Number(row.passed);
    existing.partial += Number(row.partial);
    existing.tested += tested;
    existing.notTested += notTested;
    existing.levels.push(Number(row.level));
    byDomain.set(row.domain, existing);
  }

  const domainOrder = Object.keys(VB_MAPP_DOMAINS_ZH);
  const milestoneDomains: IepFormDomain[] = [];

  for (const domainKey of domainOrder) {
    const agg = byDomain.get(domainKey);
    if (!agg || agg.tested === 0) continue;

    const rate = calcPassRate(agg.passed, agg.partial, agg.tested);
    const level = passRateToLevel(rate);
    const levelRange =
      agg.levels.length > 0
        ? `（涉及第 ${[...new Set(agg.levels)].sort((a, b) => a - b).join("、")} 级里程碑）`
        : "";
    const detail = `里程碑 1 分率 ${Math.round(rate * 100)}%（${agg.passed}/${agg.tested} 项得 1 分${agg.notTested > 0 ? `，${agg.notTested} 项未测` : ""}）${levelRange}。`;

    milestoneDomains.push({
      key: `milestone_${domainKey}`,
      name: agg.label,
      level,
      description: buildDescription(agg.label, level, detail),
    });
  }

  for (const [domainKey, agg] of byDomain) {
    if (domainOrder.includes(domainKey) || agg.tested === 0) continue;
    const rate = calcPassRate(agg.passed, agg.partial, agg.tested);
    const level = passRateToLevel(rate);
    milestoneDomains.push({
      key: `milestone_${domainKey}`,
      name: agg.label,
      level,
      description: buildDescription(
        agg.label,
        level,
        `里程碑 1 分率 ${Math.round(rate * 100)}%。`,
      ),
    });
  }

  const barrierRate = Math.max(0, 1 - barrierAvg / 4);
  const barrierLevel = passRateToLevel(barrierRate);
  const significantBarriers = barriers
    .filter((b) => {
      const n = scoreNum(b.score);
      return n !== null && n >= 2;
    })
    .sort((a, b) => (scoreNum(b.score) ?? 0) - (scoreNum(a.score) ?? 0))
    .slice(0, 5);
  const barrierDetail =
    `障碍评估平均严重度 ${barrierAvg.toFixed(1)}/4。` +
    (significantBarriers.length > 0
      ? `需重点关注的障碍：${significantBarriers.map((b) => `${b.barrier_name_zh}（${b.score} 分）`).join("、")}。`
      : "未发现显著障碍。");

  const transitionRate = transitionAvg / 4;
  const transitionLevel = passRateToLevel(transitionRate);
  const weakTransitions = transitions
    .filter((t) => {
      const n = scoreNum(t.score);
      return n !== null && n <= 1;
    })
    .slice(0, 5);
  const transitionDetail =
    `过渡评估平均得分 ${transitionAvg.toFixed(1)}/4。` +
    (weakTransitions.length > 0
      ? `需加强的过渡技能：${weakTransitions.map((t) => t.transition_name_zh).join("、")}。`
      : "过渡技能整体表现良好。");

  return [
    ...milestoneDomains,
    {
      key: "vbmapp_barriers",
      name: "障碍评估",
      level: barrierLevel,
      description: buildDescription("障碍评估", barrierLevel, barrierDetail),
    },
    {
      key: "vbmapp_transitions",
      name: "过渡评估",
      level: transitionLevel,
      description: buildDescription("过渡评估", transitionLevel, transitionDetail),
    },
  ];
}

/** C-PEP-3：按发展领域 + 病理领域原生结构映射 */
export function mapCpep3ToIepDomains(
  devSummary: Cpep3DevSummary[],
  patSummary: Cpep3PatSummary[],
): IepFormDomain[] {
  const devDomains: IepFormDomain[] = devSummary.map((row) => {
    const tested =
      Number(row.passed_count) +
      Number(row.emerging_count) +
      Number(row.failed_count);
    const notTested = Number(row.not_tested_count ?? 0);
    const rate =
      tested > 0
        ? calcPassRate(
            Number(row.passed_count),
            Number(row.emerging_count),
            tested,
          )
        : 0;
    const level = passRateToLevel(rate);
    const name = `${row.domain_label_zh}（发展）`;
    const detail =
      tested > 0
        ? `通过率 ${Math.round(rate * 100)}%（通过 ${row.passed_count}、中间 ${row.emerging_count}、不通过 ${row.failed_count}${notTested > 0 ? `、未测 ${notTested}` : ""}）。`
        : "暂无有效测查数据。";

    return {
      key: `dev_${row.domain}`,
      name,
      level,
      description: buildDescription(name, level, detail),
    };
  });

  const patDomains: IepFormDomain[] = patSummary.map((row) => {
    const tested =
      Number(row.appropriate_count) +
      Number(row.mild_count) +
      Number(row.severe_count);
    const notTested = Number(row.not_tested_count ?? 0);
    const abnormal = Number(row.mild_count) + Number(row.severe_count);
    const rate = tested > 0 ? 1 - abnormal / tested : 0;
    const level = passRateToLevel(rate);
    const name = `${row.domain_label_zh}（病理）`;
    const detail =
      tested > 0
        ? `适当 ${row.appropriate_count}、轻度异常 ${row.mild_count}、严重异常 ${row.severe_count}${notTested > 0 ? `、未测 ${notTested}` : ""}，异常比例 ${Math.round((abnormal / tested) * 100)}%。`
        : "暂无有效测查数据。";

    return {
      key: `pat_${row.domain}`,
      name,
      level,
      description: buildDescription(name, level, detail),
    };
  });

  return [...devDomains, ...patDomains];
}

/** 融合能力评估（幼儿园 / 小学）：按融合学期计划领域映射 */
export function mapIntegrationToIepDomains(
  toolType: IntegrationAssessmentTool,
  summary: KgIntegrationSummary[],
  behaviorRecords: KgIntegrationBehaviorRecord[] = [],
): IepFormDomain[] {
  const config = getIntegrationConfig(toolType);
  const prefix = toolType === "kg_integration" ? "kg" : "elem";
  const byDomain = new Map(summary.map((row) => [row.domain, row]));
  const domains: IepFormDomain[] = [];

  for (const domainKey of config.iepDomainOrder) {
    const row = byDomain.get(domainKey);
    if (!row) continue;

    const tested =
      Number(row.score_0_count) +
      Number(row.score_1_count) +
      Number(row.score_2_count);
    if (tested === 0) continue;

    const rate = Number(row.pass_rate ?? 0) / 100;
    const level = passRateToLevel(rate);
    const displayName =
      config.iepDomainDisplayNames[domainKey] ?? row.domain_label_zh;
    const detail =
      `独立(2分) ${row.score_2_count}、部分辅助(1分) ${row.score_1_count}、` +
      `大量辅助(0分) ${row.score_0_count}` +
      `${Number(row.na_count) > 0 ? `、不适用 ${row.na_count}` : ""}` +
      `${Number(row.not_tested_count) > 0 ? `、未测 ${row.not_tested_count}` : ""}` +
      `，融合能力率 ${Math.round(rate * 100)}%。`;

    domains.push({
      key: `${prefix}_${domainKey}`,
      name: displayName,
      level,
      description: buildDescription(displayName, level, detail),
    });
  }

  for (const row of summary) {
    if (config.iepDomainOrder.includes(row.domain)) continue;
    const tested =
      Number(row.score_0_count) +
      Number(row.score_1_count) +
      Number(row.score_2_count);
    if (tested === 0) continue;
    const rate = Number(row.pass_rate ?? 0) / 100;
    const level = passRateToLevel(rate);
    domains.push({
      key: `${prefix}_${row.domain}`,
      name: row.domain_label_zh,
      level,
      description: buildDescription(
        row.domain_label_zh,
        level,
        `融合能力率 ${Math.round(rate * 100)}%。`,
      ),
    });
  }

  const behaviors = behaviorRecords.filter((b) =>
    b.behavior_description?.trim(),
  );
  if (behaviors.length > 0) {
    const level = passRateToLevel(behaviors.length >= 3 ? 0.25 : 0.45);
    const listed = behaviors
      .map((b) => b.behavior_description!.trim())
      .slice(0, 5)
      .join("；");
    domains.push({
      key: `${prefix}_behavior`,
      name: "问题行为",
      level,
      description: buildDescription(
        "问题行为",
        level,
        `共记录 ${behaviors.length} 项问题行为，需制定行为支持与融合适应目标。主要行为：${listed}。`,
      ),
    });
  }

  return domains;
}

/** @deprecated 使用 mapIntegrationToIepDomains */
export function mapKgIntegrationToIepDomains(
  summary: KgIntegrationSummary[],
  behaviorRecords: KgIntegrationBehaviorRecord[] = [],
): IepFormDomain[] {
  return mapIntegrationToIepDomains(
    "kg_integration",
    summary,
    behaviorRecords,
  );
}

export function mapElemIntegrationToIepDomains(
  summary: KgIntegrationSummary[],
  behaviorRecords: KgIntegrationBehaviorRecord[] = [],
): IepFormDomain[] {
  return mapIntegrationToIepDomains(
    "elem_integration",
    summary,
    behaviorRecords,
  );
}

export function getPassRateColor(rate: number): string {
  if (rate > 70) return "#5DCAA5";
  if (rate >= 30) return "#FAC775";
  return "#F09595";
}

export function calcMilestonePassRate(row: VbMappMilestoneSummary): number {
  const total = Number(row.total_milestones);
  const notTested = Number(row.not_tested ?? 0);
  const tested = total - notTested;
  if (tested <= 0) return 0;
  return Math.round(
    calcPassRate(Number(row.passed), Number(row.partial), tested) * 100,
  );
}
