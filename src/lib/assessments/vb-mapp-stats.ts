import { VB_MAPP_NT } from "@/lib/types/assessment_types";

export type VbMappTab = "milestones" | "barriers" | "transitions";

export type MilestoneScoreMap = Record<string, string>;
export type BarrierScoreMap = Record<string, string>;
export type TransitionScoreMap = Record<string, string>;
export type NotesMap = Record<string, string>;

export function computeMilestoneStats(
  total: number,
  scores: MilestoneScoreMap,
) {
  let passed = 0;
  let partial = 0;
  let notPassed = 0;
  let notTested = 0;
  let scored = 0;

  for (const score of Object.values(scores)) {
    scored += 1;
    if (score === VB_MAPP_NT) {
      notTested += 1;
    } else if (score === "1") {
      passed += 1;
    } else if (score === "0.5") {
      partial += 1;
    } else if (score === "0") {
      notPassed += 1;
    }
  }

  return { total, passed, partial, notPassed, notTested, scored };
}

export function computeDomainPassRates(
  milestones: { id: string; domain: string; domain_label_zh: string }[],
  scores: MilestoneScoreMap,
) {
  const domains = new Map<
    string,
    { label: string; total: number; passed: number }
  >();

  for (const m of milestones) {
    const entry = domains.get(m.domain) ?? {
      label: m.domain_label_zh,
      total: 0,
      passed: 0,
    };
    const score = scores[m.id];
    if (score === undefined || score === VB_MAPP_NT) {
      domains.set(m.domain, entry);
      continue;
    }
    entry.total += 1;
    if (score === "1") entry.passed += 1;
    domains.set(m.domain, entry);
  }

  return [...domains.entries()].map(([domain, data]) => ({
    domain,
    label: data.label,
    total: data.total,
    passed: data.passed,
    rate: data.total ? Math.round((data.passed / data.total) * 100) : 0,
  }));
}

export function computeBarrierStats(scores: BarrierScoreMap, total: number) {
  let scored = 0;
  let notTested = 0;
  let sum = 0;
  let tested = 0;

  for (const score of Object.values(scores)) {
    scored += 1;
    if (score === VB_MAPP_NT) {
      notTested += 1;
      continue;
    }
    tested += 1;
    sum += Number(score);
  }

  const avg = tested > 0 ? sum / tested : 0;
  return { total, scored, notTested, avg: Math.round(avg * 10) / 10 };
}

export function computeTransitionStats(scores: TransitionScoreMap, total: number) {
  return computeBarrierStats(scores, total);
}
