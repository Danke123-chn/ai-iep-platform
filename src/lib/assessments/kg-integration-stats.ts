export type KgIntegrationTab = "activity" | "skill" | "behavior";

export type KgScoreMap = Record<string, string>;

export function computeKgStats(total: number, scores: KgScoreMap) {
  let full = 0;
  let partial = 0;
  let fail = 0;
  let na = 0;
  let notTested = 0;
  let tested = 0;

  for (const score of Object.values(scores)) {
    if (!score || score === "NT") {
      notTested += 1;
      continue;
    }
    if (score === "NA") {
      na += 1;
      continue;
    }
    tested += 1;
    if (score === "2") full += 1;
    else if (score === "1") partial += 1;
    else if (score === "0") fail += 1;
  }

  const passRate =
    tested > 0
      ? Math.round(((full + partial * 0.5) / tested) * 100)
      : 0;

  return { total, full, partial, fail, na, notTested, tested, passRate };
}

export function computeKgDomainRates(
  items: { id: string; domain: string; domain_label_zh: string }[],
  scores: KgScoreMap,
) {
  const domains = new Map<
    string,
    { label: string; tested: number; full: number; partial: number }
  >();

  for (const item of items) {
    const score = scores[item.id];
    if (!score || score === "NT" || score === "NA") continue;
    const entry = domains.get(item.domain) ?? {
      label: item.domain_label_zh,
      tested: 0,
      full: 0,
      partial: 0,
    };
    entry.tested += 1;
    if (score === "2") entry.full += 1;
    else if (score === "1") entry.partial += 1;
    domains.set(item.domain, entry);
  }

  return [...domains.entries()].map(([domain, data]) => ({
    domain,
    label: data.label,
    tested: data.tested,
    rate:
      data.tested > 0
        ? Math.round(((data.full + data.partial * 0.5) / data.tested) * 100)
        : 0,
  }));
}
