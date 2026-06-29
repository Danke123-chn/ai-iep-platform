import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const items = JSON.parse(
  fs.readFileSync(path.join(__dirname, "kg-integration-items.json"), "utf8"),
);

const DOMAIN_SLUG = {
  生活活动: "daily_life",
  区域活动: "zone_activity",
  教学活动: "teaching",
  户外活动: "outdoor",
  语言与沟通: "language_comm",
  社交与情绪: "social_emotion",
  "学业技能（幼小衔接适用）": "academic",
};

function esc(s) {
  return String(s).replace(/'/g, "''");
}

const lines = [
  "-- 幼儿园融合能力评估项目种子数据（138项）",
  "-- 由 scripts/generate-kg-integration-seed.mjs 生成",
  "",
  "INSERT INTO public.kg_integration_items (section, domain, domain_label_zh, category, skill_name, description, item_number, sort_order)",
  "VALUES",
];

const values = items.map((item, idx) => {
  const domain = DOMAIN_SLUG[item.domain] ?? item.domain;
  const row = `  ('${item.section}', '${domain}', '${esc(item.domain)}', '${esc(item.category)}', '${esc(item.skill_name)}', '${esc(item.description)}', ${item.item_number}, ${item.sort_order})`;
  return idx < items.length - 1 ? row + "," : row;
});

lines.push(...values);
lines.push("ON CONFLICT (section, item_number) DO NOTHING;");
lines.push("");

fs.writeFileSync(
  path.join(__dirname, "../supabase/migrations/022_kg_integration_items_seed.sql"),
  lines.join("\n"),
  "utf8",
);
console.log("Wrote", items.length, "items to 022_kg_integration_items_seed.sql");
