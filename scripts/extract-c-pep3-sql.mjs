import fs from "fs";

const src = "C:/Users/www22/WorkBuddy/2026-06-06-15-56-31/assessment_schema.sql";
const dst = "C:/Users/www22/ai-iep-platform/supabase/migrations/011_c_pep3_schema.sql";

const lines = fs.readFileSync(src, "utf8").split(/\r?\n/);

function slice(from, to) {
  return lines.slice(from - 1, to).join("\n");
}

const header = `-- C-PEP-3 表结构 + RLS + 种子数据
-- 在 Supabase SQL Editor 粘贴执行（复制本文件内容，不要输入文件路径）
-- 前提：已执行 009_assessment_sessions.sql

`;

const sql = [
  slice(101, 145),
  "",
  "-- 索引",
  slice(163, 167),
  "",
  "-- RLS",
  "ALTER TABLE public.c_pep3_developmental_scores ENABLE ROW LEVEL SECURITY;",
  "ALTER TABLE public.c_pep3_pathological_scores ENABLE ROW LEVEL SECURITY;",
  "ALTER TABLE public.c_pep3_developmental_items ENABLE ROW LEVEL SECURITY;",
  "ALTER TABLE public.c_pep3_pathological_items ENABLE ROW LEVEL SECURITY;",
  "",
  slice(211, 214).replace(/ON c_pep3/g, "ON public.c_pep3"),
  "",
  slice(280, 314).replace(/ON c_pep3/g, "ON public.c_pep3"),
  "",
  slice(438, 519),
  "",
  "notify pgrst, 'reload schema';",
].join("\n");

const normalized = sql
  .replace(/CREATE TABLE IF NOT EXISTS c_pep3/g, "CREATE TABLE IF NOT EXISTS public.c_pep3")
  .replace(/INSERT INTO c_pep3/g, "INSERT INTO public.c_pep3")
  .replace(/REFERENCES assessment_sessions/g, "REFERENCES public.assessment_sessions")
  .replace(/REFERENCES c_pep3/g, "REFERENCES public.c_pep3");

const withDropPolicies = normalized.replace(
  /CREATE POLICY "([^"]+)" ON public\.(c_pep3_\w+)/g,
  'DROP POLICY IF EXISTS "$1" ON public.$2;\nCREATE POLICY "$1" ON public.$2',
);

fs.writeFileSync(dst, header + withDropPolicies, "utf8");
console.log("OK:", dst);
