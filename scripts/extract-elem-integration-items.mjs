import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function extractRows(xmlPath) {
  const xml = fs.readFileSync(xmlPath, "utf8");
  const rows = [];
  const trRegex = /<w:tr[\s\S]*?<\/w:tr>/g;
  let m;
  while ((m = trRegex.exec(xml)) !== null) {
    const cells = [...m[0].matchAll(/<w:tc[\s\S]*?<\/w:tc>/g)].map((tc) =>
      [...tc[0].matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)]
        .map((x) => x[1])
        .join("")
        .trim(),
    );
    if (cells.some((c) => c)) rows.push(cells);
  }
  return rows;
}

const DOMAIN_NAMES = [
  "生活活动",
  "教学活动",
  "户外活动",
  "语言与沟通",
  "社会与情绪",
  "学业技能",
];

const assessXml = path.join(
  __dirname,
  "../tmp-docx/elem-assess/word/document.xml",
);
const rows = extractRows(assessXml);

let section = "";
let domain = "";
let category = "";
const items = [];
let sortOrder = 0;
let itemNumber = 0;

for (const cells of rows) {
  const c0 = cells[0] ?? "";
  const c1 = cells[1] ?? "";
  const c2 = cells[2] ?? "";
  const c3 = cells[3] ?? "";
  const c4 = cells[4] ?? "";
  const joined = cells.join("|");

  if (/A\.\s*融合活动评估/.test(joined)) {
    section = "activity";
    domain = "";
    category = "";
    continue;
  }
  if (/B\.\s*融合技能评估/.test(joined)) {
    section = "skill";
    domain = "";
    category = "";
    continue;
  }
  if (/C\.\s*融合问题行为/.test(joined)) {
    section = "behavior";
    continue;
  }
  if (section === "behavior") continue;

  if (DOMAIN_NAMES.includes(c0)) {
    domain = c0;
    continue;
  }

  if (c1.includes("计分") || c2.includes("计分") || c0.includes("计分")) continue;
  if (c0 === "领域" || c0 === "项目") continue;
  if (!section || !domain) continue;

  if (c1) category = c1;
  if (!c2) continue;
  if (!c4.includes("NA") && !["0", "1", "2"].some((s) => c4.includes(s))) continue;

  itemNumber += 1;
  sortOrder += 1;
  items.push({
    item_number: itemNumber,
    section,
    domain,
    category,
    skill_name: c2,
    description: c3,
    sort_order: sortOrder,
  });
}

fs.writeFileSync(
  path.join(__dirname, "elem-integration-items.json"),
  JSON.stringify(items, null, 2),
  "utf8",
);

const bySection = Object.fromEntries(
  ["activity", "skill"].map((s) => [s, items.filter((i) => i.section === s).length]),
);
const byDomain = Object.fromEntries(
  DOMAIN_NAMES.map((d) => [d, items.filter((i) => i.domain === d).length]),
);

console.log("Total items:", items.length);
console.log("By section:", bySection);
console.log("By domain:", byDomain);
