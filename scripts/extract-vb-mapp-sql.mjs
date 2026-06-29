import fs from "fs";
const src = "C:/Users/www22/WorkBuddy/2026-06-06-15-56-31/assessment_schema.sql";
const dst = "C:/Users/www22/ai-iep-platform/supabase/migrations/010_vb_mapp_schema.sql";

const lines = fs.readFileSync(src, "utf8").split(/\r?\n/);

function slice(from, to) {
  return lines.slice(from - 1, to).join("\n");
}

const header = `-- VB-MAPP 表结构 + RLS + 种子数据
-- 在 Supabase SQL Editor 粘贴执行（复制本文件内容，不要输入文件路径）
-- 前提：已执行 009_assessment_sessions.sql

`;

const sql = [
  slice(30, 95),
  "",
  "-- 索引",
  slice(156, 161),
  "",
  "-- RLS",
  "ALTER TABLE public.vb_mapp_milestone_scores ENABLE ROW LEVEL SECURITY;",
  "ALTER TABLE public.vb_mapp_barrier_scores ENABLE ROW LEVEL SECURITY;",
  "ALTER TABLE public.vb_mapp_transition_scores ENABLE ROW LEVEL SECURITY;",
  "ALTER TABLE public.vb_mapp_milestones ENABLE ROW LEVEL SECURITY;",
  "ALTER TABLE public.vb_mapp_barriers ENABLE ROW LEVEL SECURITY;",
  "ALTER TABLE public.vb_mapp_transitions ENABLE ROW LEVEL SECURITY;",
  "",
  slice(205, 210).replace(/ON vb_mapp/g, "ON public.vb_mapp"),
  "",
  slice(227, 278).replace(/ON vb_mapp/g, "ON public.vb_mapp"),
  "",
  slice(316, 436),
  "",
  "notify pgrst, 'reload schema';",
].join("\n");

// 统一加 public. 前缀到表名
const normalized = sql
  .replace(/CREATE TABLE IF NOT EXISTS vb_mapp/g, "CREATE TABLE IF NOT EXISTS public.vb_mapp")
  .replace(/CREATE INDEX IF NOT EXISTS idx_vbmapp/g, "CREATE INDEX IF NOT EXISTS idx_vbmapp")
  .replace(/INSERT INTO vb_mapp/g, "INSERT INTO public.vb_mapp")
  .replace(/INSERT INTO public\.vb_mapp_milestones/g, "INSERT INTO public.vb_mapp_milestones")
  .replace(/REFERENCES assessment_sessions/g, "REFERENCES public.assessment_sessions")
  .replace(/REFERENCES vb_mapp/g, "REFERENCES public.vb_mapp");

// 可重复执行：先删除旧策略
const withDropPolicies = normalized.replace(
  /CREATE POLICY "([^"]+)" ON public\.(vb_mapp_\w+)/g,
  'DROP POLICY IF EXISTS "$1" ON public.$2;\nCREATE POLICY "$1" ON public.$2',
);

fs.writeFileSync(dst, header + withDropPolicies, "utf8");
console.log("OK:", dst);
