-- 评估结果汇总视图
-- 在 Supabase SQL Editor 粘贴执行
-- 前提：已执行 010_vb_mapp_schema.sql 和 011_c_pep3_schema.sql

-- VB-MAPP 里程碑汇总视图（按领域统计）
DROP VIEW IF EXISTS public.v_vbmapp_milestone_summary;

CREATE VIEW public.v_vbmapp_milestone_summary AS
SELECT
  s.id AS session_id,
  s.student_id,
  s.session_date,
  m.domain,
  m.domain_label_zh,
  m.level,
  COUNT(*) AS total_milestones,
  COUNT(CASE WHEN sc.score = 1 THEN 1 END) AS passed,
  COUNT(CASE WHEN sc.score = 0.5 THEN 1 END) AS partial,
  COUNT(CASE WHEN sc.score = 0 THEN 1 END) AS not_passed,
  COUNT(CASE WHEN sc.score = -1 OR sc.score IS NULL THEN 1 END) AS not_tested,
  COALESCE(SUM(CASE WHEN sc.score >= 0 THEN sc.score ELSE 0 END), 0) AS total_score
FROM public.assessment_sessions s
JOIN public.vb_mapp_milestones m ON s.tool_type = 'vb_mapp'
LEFT JOIN public.vb_mapp_milestone_scores sc ON sc.session_id = s.id AND sc.milestone_id = m.id
GROUP BY s.id, s.student_id, s.session_date, m.domain, m.domain_label_zh, m.level
ORDER BY m.level, m.domain;

-- C-PEP-3 发展领域汇总视图
CREATE OR REPLACE VIEW public.v_cpep3_dev_summary AS
SELECT
  s.id AS session_id,
  s.student_id,
  s.session_date,
  di.domain,
  di.domain_label_zh,
  COUNT(*) AS total_items,
  COUNT(CASE WHEN sc.score = 'P' THEN 1 END) AS passed_count,
  COUNT(CASE WHEN sc.score = 'E' THEN 1 END) AS emerging_count,
  COUNT(CASE WHEN sc.score = 'F' THEN 1 END) AS failed_count,
  COUNT(CASE WHEN sc.score = 'NT' THEN 1 END) AS not_tested_count,
  ROUND(COUNT(CASE WHEN sc.score = 'P' THEN 1 END)::NUMERIC / NULLIF(COUNT(CASE WHEN sc.score != 'NT' THEN 1 END), 0) * 100, 1) AS pass_rate
FROM public.assessment_sessions s
JOIN public.c_pep3_developmental_items di ON s.tool_type = 'c_pep3'
LEFT JOIN public.c_pep3_developmental_scores sc ON sc.session_id = s.id AND sc.item_id = di.id
GROUP BY s.id, s.student_id, s.session_date, di.domain, di.domain_label_zh
ORDER BY di.domain;

-- C-PEP-3 病理领域汇总视图
CREATE OR REPLACE VIEW public.v_cpep3_pat_summary AS
SELECT
  s.id AS session_id,
  s.student_id,
  s.session_date,
  pi.domain,
  pi.domain_label_zh,
  COUNT(*) AS total_items,
  COUNT(CASE WHEN sc.score = 'A' THEN 1 END) AS appropriate_count,
  COUNT(CASE WHEN sc.score = 'M' THEN 1 END) AS mild_count,
  COUNT(CASE WHEN sc.score = 'S' THEN 1 END) AS severe_count,
  COUNT(CASE WHEN sc.score = 'NT' THEN 1 END) AS not_tested_count
FROM public.assessment_sessions s
JOIN public.c_pep3_pathological_items pi ON s.tool_type = 'c_pep3'
LEFT JOIN public.c_pep3_pathological_scores sc ON sc.session_id = s.id AND sc.item_id = pi.id
GROUP BY s.id, s.student_id, s.session_date, pi.domain, pi.domain_label_zh
ORDER BY pi.domain;

GRANT SELECT ON public.v_vbmapp_milestone_summary TO authenticated;
GRANT SELECT ON public.v_cpep3_dev_summary TO authenticated;
GRANT SELECT ON public.v_cpep3_pat_summary TO authenticated;

