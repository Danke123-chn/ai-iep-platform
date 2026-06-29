/**
 * 从 WorkBuddy SQL 生成 Supabase 迁移 + 前端内容覆盖 JSON
 * 用法: node scripts/import-workbuddy-assessment-content.mjs
 */
import fs from "fs";
import path from "path";

const ROOT = path.resolve(import.meta.dirname, "..");
const WB = "C:/Users/www22/WorkBuddy/2026-06-06-15-56-31";

const SOURCES = [
  {
    src: "assessment_content_update.sql",
    dst: "014_vb_mapp_milestone_content.sql",
    header: `-- VB-MAPP 170 项里程碑完整描述
-- 在 Supabase SQL Editor 粘贴执行
-- 前提：已执行 010_vb_mapp_schema.sql

`,
  },
  {
    src: "vbmapp_barrier_transition_update.sql",
    dst: "015_vb_mapp_barrier_transition_content.sql",
    header: `-- VB-MAPP 障碍 + 过渡评估完整描述
-- 在 Supabase SQL Editor 粘贴执行
-- 前提：已执行 010_vb_mapp_schema.sql

`,
  },
  {
    src: "cpep3_content_update.sql",
    dst: "016_cpep3_content.sql",
    header: `-- C-PEP-3 发展 + 病理领域完整描述
-- 在 Supabase SQL Editor 粘贴执行
-- 前提：已执行 011_c_pep3_schema.sql

`,
  },
];

function normalizeSql(text) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\bUPDATE vb_mapp_milestones\b/g, "UPDATE public.vb_mapp_milestones")
    .replace(/\bUPDATE vb_mapp_barriers\b/g, "UPDATE public.vb_mapp_barriers")
    .replace(/\bUPDATE vb_mapp_transitions\b/g, "UPDATE public.vb_mapp_transitions")
    .replace(
      /\bUPDATE c_pep3_developmental_items\b/g,
      "UPDATE public.c_pep3_developmental_items",
    )
    .replace(
      /\bUPDATE c_pep3_pathological_items\b/g,
      "UPDATE public.c_pep3_pathological_items",
    )
    .replace(/\bFROM vb_mapp_milestones\b/g, "FROM public.vb_mapp_milestones")
    .replace(/\bSETdescription\b/g, "SET description")
    .replace(/SET\s*描述\s*=/g, "SET description =")
    .replace(
      /SELECT COUNT\(\*\) AS total_updated FROM vb_mapp_milestones/g,
      "SELECT COUNT(*) AS total_updated FROM public.vb_mapp_milestones",
    )
    .replace(
      /FROM c_pep3_developmental_items/g,
      "FROM public.c_pep3_developmental_items",
    )
    .replace(
      /FROM c_pep3_pathological_items/g,
      "FROM public.c_pep3_pathological_items",
    )
    .replace(
      /SELECT COUNT\(\*\) AS total_barriers FROM vb_mapp_barriers/g,
      "SELECT COUNT(*) AS total_barriers FROM public.vb_mapp_barriers",
    )
    .replace(
      /SELECT COUNT\(\*\) FROM vb_mapp_transitions/g,
      "SELECT COUNT(*) FROM public.vb_mapp_transitions",
    )
    .concat("\n\nNOTIFY pgrst, 'reload schema';\n");
}

function unescapeSqlString(s) {
  return s.replace(/''/g, "'");
}

function parseMilestoneUpdates(sql) {
  const map = {};
  const re =
    /UPDATE public\.vb_mapp_milestones SET description =\s*\n?'((?:[^']|'')*)'\s*\n?WHERE domain='([^']+)' AND level=(\d+) AND milestone_number=(\d+)/gs;
  let m;
  while ((m = re.exec(sql)) !== null) {
    const [, desc, domain, level, num] = m;
    map[`${domain}:${level}:${num}`] = unescapeSqlString(desc);
  }
  return map;
}

function parseBarrierUpdates(sql) {
  const map = {};
  const re =
    /UPDATE public\.vb_mapp_barriers SET\s*(?:barrier_name_zh = '((?:[^']|'')*)'(?:,\s*)?\n?\s*category = '((?:[^']|'')*)'|barrier_name_zh = '((?:[^']|'')*)')\s*WHERE barrier_name = '([^']+)'/gs;
  let m;
  while ((m = re.exec(sql)) !== null) {
    const zh = m[1] ?? m[3];
    const category = m[2] ?? undefined;
    const name = m[4];
    map[name] = {
      barrier_name_zh: unescapeSqlString(zh),
      ...(category ? { category: unescapeSqlString(category) } : {}),
    };
  }
  return map;
}

function parseTransitionUpdates(sql) {
  const map = {};
  const re =
    /UPDATE public\.vb_mapp_transitions SET transition_name_zh =\s*'((?:[^']|'')*)',\s*\n?category = '((?:[^']|'')*)'\s*WHERE transition_name = '([^']+)'/gs;
  let m;
  while ((m = re.exec(sql)) !== null) {
    map[m[3]] = {
      transition_name_zh: unescapeSqlString(m[1]),
      category: unescapeSqlString(m[2]),
    };
  }
  return map;
}

function parseCpep3DevUpdates(sql) {
  const map = {};
  const re =
    /UPDATE public\.c_pep3_developmental_items SET description =\s*\n?'((?:[^']|'')*)'\s*\n?WHERE domain='([^']+)' AND item_number=(\d+)/gs;
  let m;
  while ((m = re.exec(sql)) !== null) {
    map[`${m[2]}:${m[3]}`] = unescapeSqlString(m[1]);
  }
  return map;
}

function parseCpep3PatUpdates(sql) {
  const map = {};
  const re =
    /UPDATE public\.c_pep3_pathological_items SET description =\s*\n?'((?:[^']|'')*)'\s*\n?WHERE domain='([^']+)' AND item_number=(\d+)/gs;
  let m;
  while ((m = re.exec(sql)) !== null) {
    map[`${m[2]}:${m[3]}`] = unescapeSqlString(m[1]);
  }
  return map;
}

for (const { src, dst, header } of SOURCES) {
  const raw = fs.readFileSync(path.join(WB, src), "utf8");
  const sql = normalizeSql(raw);
  fs.writeFileSync(path.join(ROOT, "supabase/migrations", dst), header + sql, "utf8");
  console.log("Wrote migration:", dst);
}

const milestoneSql = normalizeSql(
  fs.readFileSync(path.join(WB, "assessment_content_update.sql"), "utf8"),
);
const barrierSql = normalizeSql(
  fs.readFileSync(path.join(WB, "vbmapp_barrier_transition_update.sql"), "utf8"),
);
const cpep3Sql = normalizeSql(
  fs.readFileSync(path.join(WB, "cpep3_content_update.sql"), "utf8"),
);

const overrides = {
  vbMappMilestones: parseMilestoneUpdates(milestoneSql),
  vbMappBarriers: parseBarrierUpdates(barrierSql),
  vbMappTransitions: parseTransitionUpdates(barrierSql),
  cpep3Dev: parseCpep3DevUpdates(cpep3Sql),
  cpep3Pat: parseCpep3PatUpdates(cpep3Sql),
};

const outJson = path.join(ROOT, "src/data/assessment-content-overrides.json");
fs.writeFileSync(outJson, JSON.stringify(overrides, null, 2), "utf8");

console.log("Overrides:", {
  vbMappMilestones: Object.keys(overrides.vbMappMilestones).length,
  vbMappBarriers: Object.keys(overrides.vbMappBarriers).length,
  vbMappTransitions: Object.keys(overrides.vbMappTransitions).length,
  cpep3Dev: Object.keys(overrides.cpep3Dev).length,
  cpep3Pat: Object.keys(overrides.cpep3Pat).length,
});
console.log("Wrote", outJson);

// Remove obsolete migration if present
const old014 = path.join(ROOT, "supabase/migrations/014_vb_mapp_milestone_descriptions.sql");
if (fs.existsSync(old014)) {
  fs.unlinkSync(old014);
  console.log("Removed obsolete 014_vb_mapp_milestone_descriptions.sql");
}
