-- VB-MAPP 里程碑评分增加「未测」选项（-1）
-- 在 Supabase SQL Editor 粘贴执行

ALTER TABLE public.vb_mapp_milestone_scores
  DROP CONSTRAINT IF EXISTS vb_mapp_milestone_scores_score_check;

ALTER TABLE public.vb_mapp_milestone_scores
  ADD CONSTRAINT vb_mapp_milestone_scores_score_check
  CHECK (score IN (-1, 0, 0.5, 1));

-- 更新汇总视图（含未测计数；须先 DROP 再 CREATE，因新增了 not_tested 列）
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

GRANT SELECT ON public.v_vbmapp_milestone_summary TO authenticated;

