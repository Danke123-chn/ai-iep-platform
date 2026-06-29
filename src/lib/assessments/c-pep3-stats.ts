export type Cpep3Tab = "developmental" | "pathological";

export type DevScoreMap = Record<string, string>;
export type PatScoreMap = Record<string, string>;

export function computeDevStats(
  total: number,
  scores: DevScoreMap,
) {
  let passed = 0;
  let emerging = 0;
  let failed = 0;
  let notTested = 0;
  let tested = 0;

  for (const score of Object.values(scores)) {
    if (score === "NT") {
      notTested += 1;
      continue;
    }
    tested += 1;
    if (score === "P") passed += 1;
    else if (score === "E") emerging += 1;
    else if (score === "F") failed += 1;
  }

  const passRate = tested > 0 ? Math.round((passed / tested) * 100) : 0;

  return { total, passed, emerging, failed, notTested, tested, passRate };
}

export function computePatStats(total: number, scores: PatScoreMap) {
  let appropriate = 0;
  let mild = 0;
  let severe = 0;
  let notTested = 0;
  let tested = 0;

  for (const score of Object.values(scores)) {
    if (score === "NT") {
      notTested += 1;
      continue;
    }
    tested += 1;
    if (score === "A") appropriate += 1;
    else if (score === "M") mild += 1;
    else if (score === "S") severe += 1;
  }

  const abnormalRate =
    tested > 0 ? Math.round(((mild + severe) / tested) * 100) : 0;

  return { total, appropriate, mild, severe, notTested, tested, abnormalRate };
}

export function computeDevDomainRates(
  items: { id: string; domain: string; domain_label_zh: string }[],
  scores: DevScoreMap,
) {
  const domains = new Map<
    string,
    { label: string; tested: number; passed: number }
  >();

  for (const item of items) {
    const score = scores[item.id];
    if (!score || score === "NT") continue;
    const entry = domains.get(item.domain) ?? {
      label: item.domain_label_zh,
      tested: 0,
      passed: 0,
    };
    entry.tested += 1;
    if (score === "P") entry.passed += 1;
    domains.set(item.domain, entry);
  }

  return [...domains.entries()].map(([domain, data]) => ({
    domain,
    label: data.label,
    tested: data.tested,
    passed: data.passed,
    rate: data.tested ? Math.round((data.passed / data.tested) * 100) : 0,
  }));
}

export function computePatDomainRates(
  items: { id: string; domain: string; domain_label_zh: string }[],
  scores: PatScoreMap,
) {
  const domains = new Map<
    string,
    { label: string; tested: number; abnormal: number }
  >();

  for (const item of items) {
    const score = scores[item.id];
    if (!score || score === "NT") continue;
    const entry = domains.get(item.domain) ?? {
      label: item.domain_label_zh,
      tested: 0,
      abnormal: 0,
    };
    entry.tested += 1;
    if (score === "M" || score === "S") entry.abnormal += 1;
    domains.set(item.domain, entry);
  }

  return [...domains.entries()].map(([domain, data]) => ({
    domain,
    label: data.label,
    tested: data.tested,
    abnormal: data.abnormal,
    rate: data.tested ? Math.round((data.abnormal / data.tested) * 100) : 0,
  }));
}
