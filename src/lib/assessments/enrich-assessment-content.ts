import overrides from "@/data/assessment-content-overrides.json";

const PLACEHOLDER_PATTERNS = [
  "参见VB-MAPP评估手册",
  "参见 VB-MAPP 评估手册",
  "参见C-PEP-3评估手册",
  "参见 C-PEP-3 评估手册",
];

export function isPlaceholderDescription(text: string): boolean {
  return PLACEHOLDER_PATTERNS.some((p) => text.includes(p));
}

export function enrichVbMappMilestones<
  T extends {
    domain: string;
    level: number;
    milestone_number: number;
    description: string;
  },
>(items: T[]): T[] {
  const map = overrides.vbMappMilestones as Record<string, string>;
  return items.map((item) => {
    const key = `${item.domain}:${item.level}:${item.milestone_number}`;
    const text = map[key];
    if (!text) return item;
    if (!isPlaceholderDescription(item.description) && item.description.length > 80) {
      return item;
    }
    return { ...item, description: text };
  });
}

export function enrichVbMappBarriers<
  T extends {
    barrier_name: string;
    barrier_name_zh: string;
    category: string;
  },
>(items: T[]): T[] {
  const map = overrides.vbMappBarriers as Record<
    string,
    { barrier_name_zh: string; category?: string }
  >;
  return items.map((item) => {
    const o = map[item.barrier_name];
    if (!o) return item;
    return {
      ...item,
      barrier_name_zh: o.barrier_name_zh,
      category: o.category ?? item.category,
    };
  });
}

export function enrichVbMappTransitions<
  T extends {
    transition_name: string;
    transition_name_zh: string;
    category: string;
  },
>(items: T[]): T[] {
  const map = overrides.vbMappTransitions as Record<
    string,
    { transition_name_zh: string; category?: string }
  >;
  return items.map((item) => {
    const o = map[item.transition_name];
    if (!o) return item;
    return {
      ...item,
      transition_name_zh: o.transition_name_zh,
      category: o.category ?? item.category,
    };
  });
}

export function enrichCpep3DevItems<
  T extends { domain: string; item_number: number; description: string },
>(items: T[]): T[] {
  const map = overrides.cpep3Dev as Record<string, string>;
  return items.map((item) => {
    const key = `${item.domain}:${item.item_number}`;
    const text = map[key];
    if (!text) return item;
    if (!isPlaceholderDescription(item.description) && item.description.length > 40) {
      return item;
    }
    return { ...item, description: text };
  });
}

export function enrichCpep3PatItems<
  T extends { domain: string; item_number: number; description: string },
>(items: T[]): T[] {
  const map = overrides.cpep3Pat as Record<string, string>;
  return items.map((item) => {
    const key = `${item.domain}:${item.item_number}`;
    const text = map[key];
    if (!text) return item;
    if (!isPlaceholderDescription(item.description) && item.description.length > 40) {
      return item;
    }
    return { ...item, description: text };
  });
}
