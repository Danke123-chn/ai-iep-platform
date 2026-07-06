-- 小学融合能力评估（入校）表结构
-- 前提：已执行 009_assessment_sessions.sql、021_kg_integration_schema.sql

ALTER TABLE public.assessment_sessions
  DROP CONSTRAINT IF EXISTS assessment_sessions_tool_type_check;

ALTER TABLE public.assessment_sessions
  ADD CONSTRAINT assessment_sessions_tool_type_check
  CHECK (tool_type IN ('vb_mapp', 'c_pep3', 'kg_integration', 'elem_integration'));

CREATE TABLE IF NOT EXISTS public.elem_integration_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  section TEXT NOT NULL CHECK (section IN ('activity', 'skill')),
  domain TEXT NOT NULL,
  domain_label_zh TEXT NOT NULL,
  category TEXT NOT NULL,
  skill_name TEXT NOT NULL,
  description TEXT NOT NULL,
  item_number INTEGER NOT NULL,
  sort_order INTEGER NOT NULL,
  UNIQUE(section, item_number)
);

CREATE TABLE IF NOT EXISTS public.elem_integration_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.assessment_sessions(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.elem_integration_items(id) ON DELETE RESTRICT,
  score TEXT NOT NULL DEFAULT 'NT' CHECK (score IN ('NA', '0', '1', '2', 'NT')),
  notes TEXT,
  assessed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, item_id)
);

CREATE TABLE IF NOT EXISTS public.elem_integration_behavior_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.assessment_sessions(id) ON DELETE CASCADE,
  behavior_description TEXT,
  occurrence_time TEXT,
  frequency_intensity TEXT,
  location TEXT,
  duration TEXT,
  measures_taken TEXT,
  behavior_impact TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_elem_integration_scores_session ON elem_integration_scores(session_id);
CREATE INDEX IF NOT EXISTS idx_elem_integration_items_domain ON elem_integration_items(domain);
CREATE INDEX IF NOT EXISTS idx_elem_behavior_records_session ON elem_integration_behavior_records(session_id);

ALTER TABLE public.elem_integration_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.elem_integration_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.elem_integration_behavior_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "小学融合评估定义可读" ON public.elem_integration_items;
CREATE POLICY "小学融合评估定义可读" ON public.elem_integration_items
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "查看自己的小学融合评分" ON public.elem_integration_scores;
CREATE POLICY "查看自己的小学融合评分" ON public.elem_integration_scores
  FOR SELECT TO authenticated USING (
    session_id IN (SELECT id FROM assessment_sessions WHERE assessor_id = auth.uid())
  );
DROP POLICY IF EXISTS "创建小学融合评分" ON public.elem_integration_scores;
CREATE POLICY "创建小学融合评分" ON public.elem_integration_scores
  FOR INSERT TO authenticated WITH CHECK (
    session_id IN (SELECT id FROM assessment_sessions WHERE assessor_id = auth.uid())
  );
DROP POLICY IF EXISTS "修改小学融合评分" ON public.elem_integration_scores;
CREATE POLICY "修改小学融合评分" ON public.elem_integration_scores
  FOR UPDATE TO authenticated USING (
    session_id IN (SELECT id FROM assessment_sessions WHERE assessor_id = auth.uid())
  );
DROP POLICY IF EXISTS "删除小学融合评分" ON public.elem_integration_scores;
CREATE POLICY "删除小学融合评分" ON public.elem_integration_scores
  FOR DELETE TO authenticated USING (
    session_id IN (SELECT id FROM assessment_sessions WHERE assessor_id = auth.uid())
  );

DROP POLICY IF EXISTS "查看自己的小学行为记录" ON public.elem_integration_behavior_records;
CREATE POLICY "查看自己的小学行为记录" ON public.elem_integration_behavior_records
  FOR SELECT TO authenticated USING (
    session_id IN (SELECT id FROM assessment_sessions WHERE assessor_id = auth.uid())
  );
DROP POLICY IF EXISTS "创建小学行为记录" ON public.elem_integration_behavior_records;
CREATE POLICY "创建小学行为记录" ON public.elem_integration_behavior_records
  FOR INSERT TO authenticated WITH CHECK (
    session_id IN (SELECT id FROM assessment_sessions WHERE assessor_id = auth.uid())
  );
DROP POLICY IF EXISTS "修改小学行为记录" ON public.elem_integration_behavior_records;
CREATE POLICY "修改小学行为记录" ON public.elem_integration_behavior_records
  FOR UPDATE TO authenticated USING (
    session_id IN (SELECT id FROM assessment_sessions WHERE assessor_id = auth.uid())
  );
DROP POLICY IF EXISTS "删除小学行为记录" ON public.elem_integration_behavior_records;
CREATE POLICY "删除小学行为记录" ON public.elem_integration_behavior_records
  FOR DELETE TO authenticated USING (
    session_id IN (SELECT id FROM assessment_sessions WHERE assessor_id = auth.uid())
  );

CREATE OR REPLACE VIEW public.v_elem_integration_summary AS
SELECT
  s.id AS session_id,
  s.student_id,
  s.session_date,
  i.section,
  i.domain,
  i.domain_label_zh,
  COUNT(*) AS total_items,
  COUNT(CASE WHEN sc.score = '2' THEN 1 END) AS score_2_count,
  COUNT(CASE WHEN sc.score = '1' THEN 1 END) AS score_1_count,
  COUNT(CASE WHEN sc.score = '0' THEN 1 END) AS score_0_count,
  COUNT(CASE WHEN sc.score = 'NA' THEN 1 END) AS na_count,
  COUNT(CASE WHEN sc.score = 'NT' OR sc.score IS NULL THEN 1 END) AS not_tested_count,
  ROUND(
    (
      COUNT(CASE WHEN sc.score = '2' THEN 1 END)::NUMERIC
      + COUNT(CASE WHEN sc.score = '1' THEN 1 END)::NUMERIC * 0.5
    ) / NULLIF(COUNT(CASE WHEN sc.score IN ('0', '1', '2') THEN 1 END), 0) * 100,
    1
  ) AS pass_rate
FROM public.assessment_sessions s
JOIN public.elem_integration_items i ON s.tool_type = 'elem_integration'
LEFT JOIN public.elem_integration_scores sc
  ON sc.session_id = s.id AND sc.item_id = i.id
GROUP BY s.id, s.student_id, s.session_date, i.section, i.domain, i.domain_label_zh
ORDER BY i.section, MIN(i.sort_order);

GRANT SELECT ON public.v_elem_integration_summary TO authenticated;

