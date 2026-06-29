import fs from "fs";

const src = "C:/Users/www22/WorkBuddy/2026-06-06-15-56-31/assessment_schema.sql";
const dst = "C:/Users/www22/ai-iep-platform/supabase/migrations/012_assessment_views.sql";

const lines = fs.readFileSync(src, "utf8").split(/\r?\n/);

const header = `-- 评估结果汇总视图
-- 在 Supabase SQL Editor 粘贴执行
-- 前提：已执行 010_vb_mapp_schema.sql 和 011_c_pep3_schema.sql

`;

const views = lines.slice(524, 582).join("\n")
  .replace(/CREATE OR REPLACE VIEW v_/g, "CREATE OR REPLACE VIEW public.v_")
  .replace(/FROM assessment_sessions/g, "FROM public.assessment_sessions")
  .replace(/JOIN vb_mapp_/g, "JOIN public.vb_mapp_")
  .replace(/JOIN c_pep3_/g, "JOIN public.c_pep3_")
  .replace(/LEFT JOIN vb_mapp_/g, "LEFT JOIN public.vb_mapp_")
  .replace(/LEFT JOIN c_pep3_/g, "LEFT JOIN public.c_pep3_");

const grantSql = `
GRANT SELECT ON public.v_vbmapp_milestone_summary TO authenticated;
GRANT SELECT ON public.v_cpep3_dev_summary TO authenticated;
GRANT SELECT ON public.v_cpep3_pat_summary TO authenticated;

notify pgrst, 'reload schema';
`;

fs.writeFileSync(dst, header + views + grantSql, "utf8");
console.log("OK:", dst);
