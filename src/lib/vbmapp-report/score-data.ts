import { isVbMappNt } from "@/lib/types/assessment_types";
import { VB_MAPP_DOMAINS_ZH } from "@/lib/types/assessment_types";
import type { VbMappMilestone } from "@/lib/types/assessment_types";
import type { VbMappDomainScoreRow } from "@/lib/vbmapp-report/types";

function milestonePoints(score: string): number {
  if (score === "1") return 1;
  if (score === "0.5") return 0.5;
  return 0;
}

export function buildDomainScoreRows(
  milestones: VbMappMilestone[],
  milestoneScores: Record<string, string>,
): VbMappDomainScoreRow[] {
  const rows: VbMappDomainScoreRow[] = [];

  for (const [domain, domainLabel] of Object.entries(VB_MAPP_DOMAINS_ZH)) {
    const domainItems = milestones.filter((m) => m.domain === domain);
    if (domainItems.length === 0) continue;

    const row: VbMappDomainScoreRow = {
      domain,
      domainLabel,
      level1Total: 0,
      level1Score: 0,
      level2Total: 0,
      level2Score: 0,
      level3Total: 0,
      level3Score: 0,
      passed: 0,
      partial: 0,
      failed: 0,
      notTested: 0,
    };

    for (const item of domainItems) {
      const score = milestoneScores[item.id];
      const levelKey = `level${item.level}` as "level1" | "level2" | "level3";
      row[`${levelKey}Total`] += 1;

      if (!score || isVbMappNt(score)) {
        row.notTested += 1;
        continue;
      }

      row[`${levelKey}Score`] += milestonePoints(score);
      if (score === "1") row.passed += 1;
      else if (score === "0.5") row.partial += 1;
      else row.failed += 1;
    }

    const tested = row.passed + row.partial + row.failed;
    if (tested > 0) rows.push(row);
  }

  return rows;
}

export function estimateDominantLevel(
  milestones: VbMappMilestone[],
  milestoneScores: Record<string, string>,
): 1 | 2 | 3 | null {
  const levelRates: { level: 1 | 2 | 3; rate: number }[] = [];

  for (const level of [1, 2, 3] as const) {
    const items = milestones.filter((m) => m.level === level);
    let tested = 0;
    let points = 0;
    for (const item of items) {
      const score = milestoneScores[item.id];
      if (!score || isVbMappNt(score)) continue;
      tested += 1;
      points += milestonePoints(score);
    }
    if (tested > 0) {
      levelRates.push({ level, rate: points / tested });
    }
  }

  if (levelRates.length === 0) return null;

  levelRates.sort((a, b) => b.rate - a.rate || b.level - a.level);
  return levelRates[0].level;
}

export function levelLabelZh(level: 1 | 2 | 3 | null): string {
  if (level === 1) return "第一级（0-18个月）";
  if (level === 2) return "第二级（18-30个月）";
  if (level === 3) return "第三级（30-48个月）";
  return "—";
}
