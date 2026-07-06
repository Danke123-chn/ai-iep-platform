-- C-PEP-3 表结构 + RLS + 种子数据
-- 在 Supabase SQL Editor 粘贴执行（复制本文件内容，不要输入文件路径）
-- 前提：已执行 009_assessment_sessions.sql

-- C-PEP-3 发展领域项目定义（7大领域）
CREATE TABLE IF NOT EXISTS public.c_pep3_developmental_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  domain TEXT NOT NULL,
  domain_label_zh TEXT NOT NULL,
  item_number INTEGER NOT NULL,
  description TEXT NOT NULL,
  age_range TEXT,
  UNIQUE(domain, item_number)
);

-- C-PEP-3 病理领域项目定义（5大领域）
CREATE TABLE IF NOT EXISTS public.c_pep3_pathological_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  domain TEXT NOT NULL,
  domain_label_zh TEXT NOT NULL,
  item_number INTEGER NOT NULL,
  description TEXT NOT NULL,
  UNIQUE(domain, item_number)
);

-- ============================================================
-- 第五部分：C-PEP-3 评分表（用户数据，RLS保护）
-- ============================================================

-- 发展领域评分（P通过 / E中间反应 / F不通过 / NT未测）
CREATE TABLE IF NOT EXISTS public.c_pep3_developmental_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.assessment_sessions(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.c_pep3_developmental_items(id) ON DELETE RESTRICT,
  score TEXT NOT NULL DEFAULT 'F' CHECK (score IN ('P', 'E', 'F', 'NT')),
  notes TEXT,
  assessed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, item_id)
);

-- 病理领域评分（A适当 / M轻度 / S严重 / NT未测）
CREATE TABLE IF NOT EXISTS public.c_pep3_pathological_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.assessment_sessions(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.c_pep3_pathological_items(id) ON DELETE RESTRICT,
  score TEXT NOT NULL DEFAULT 'A' CHECK (score IN ('A', 'M', 'S', 'NT')),
  notes TEXT,
  UNIQUE(session_id, item_id)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_cpep3_dev_scores_session ON c_pep3_developmental_scores(session_id);
CREATE INDEX IF NOT EXISTS idx_cpep3_pat_scores_session ON c_pep3_pathological_scores(session_id);

CREATE INDEX IF NOT EXISTS idx_cpep3_dev_items_domain ON c_pep3_developmental_items(domain);
CREATE INDEX IF NOT EXISTS idx_cpep3_pat_items_domain ON c_pep3_pathological_items(domain);

-- RLS
ALTER TABLE public.c_pep3_developmental_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.c_pep3_pathological_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.c_pep3_developmental_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.c_pep3_pathological_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "定义表所有认证用户可读" ON public.c_pep3_developmental_items;
CREATE POLICY "定义表所有认证用户可读" ON public.c_pep3_developmental_items
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "定义表所有认证用户可读" ON public.c_pep3_pathological_items;
CREATE POLICY "定义表所有认证用户可读" ON public.c_pep3_pathological_items
  FOR SELECT TO authenticated USING (true);

-- C-PEP-3 发展领域评分策略
DROP POLICY IF EXISTS "查看自己的发展评分" ON public.c_pep3_developmental_scores;
CREATE POLICY "查看自己的发展评分" ON public.c_pep3_developmental_scores
  FOR SELECT TO authenticated USING (
    session_id IN (SELECT id FROM assessment_sessions WHERE assessor_id = auth.uid())
  );
DROP POLICY IF EXISTS "创建发展评分" ON public.c_pep3_developmental_scores;
CREATE POLICY "创建发展评分" ON public.c_pep3_developmental_scores
  FOR INSERT TO authenticated WITH CHECK (
    session_id IN (SELECT id FROM assessment_sessions WHERE assessor_id = auth.uid())
  );
DROP POLICY IF EXISTS "修改发展评分" ON public.c_pep3_developmental_scores;
CREATE POLICY "修改发展评分" ON public.c_pep3_developmental_scores
  FOR UPDATE TO authenticated USING (
    session_id IN (SELECT id FROM assessment_sessions WHERE assessor_id = auth.uid())
  );
DROP POLICY IF EXISTS "删除发展评分" ON public.c_pep3_developmental_scores;
CREATE POLICY "删除发展评分" ON public.c_pep3_developmental_scores
  FOR DELETE TO authenticated USING (
    session_id IN (SELECT id FROM assessment_sessions WHERE assessor_id = auth.uid())
  );

-- C-PEP-3 病理领域评分策略
DROP POLICY IF EXISTS "查看自己的病理评分" ON public.c_pep3_pathological_scores;
CREATE POLICY "查看自己的病理评分" ON public.c_pep3_pathological_scores
  FOR SELECT TO authenticated USING (
    session_id IN (SELECT id FROM assessment_sessions WHERE assessor_id = auth.uid())
  );
DROP POLICY IF EXISTS "创建病理评分" ON public.c_pep3_pathological_scores;
CREATE POLICY "创建病理评分" ON public.c_pep3_pathological_scores
  FOR INSERT TO authenticated WITH CHECK (
    session_id IN (SELECT id FROM assessment_sessions WHERE assessor_id = auth.uid())
  );
DROP POLICY IF EXISTS "修改病理评分" ON public.c_pep3_pathological_scores;
CREATE POLICY "修改病理评分" ON public.c_pep3_pathological_scores
  FOR UPDATE TO authenticated USING (
    session_id IN (SELECT id FROM assessment_sessions WHERE assessor_id = auth.uid())
  );
DROP POLICY IF EXISTS "删除病理评分" ON public.c_pep3_pathological_scores;
CREATE POLICY "删除病理评分" ON public.c_pep3_pathological_scores
  FOR DELETE TO authenticated USING (
    session_id IN (SELECT id FROM assessment_sessions WHERE assessor_id = auth.uid())
  );

-- ============================================================
-- 第十二部分：种子数据 - C-PEP-3 发展领域项目
-- 7大领域，共97项
-- ============================================================

DO $$
DECLARE
  d text;
  d_label_zh text;
  i int;
  max_items int;
  domains text[] := ARRAY['imitation','perception','fine_motor','gross_motor','eye_hand_coordination','cognitive_performance','verbal_cognition'];
  labels jsonb := '{
    "imitation": "模仿",
    "perception": "感知",
    "fine_motor": "精细动作",
    "gross_motor": "粗大动作",
    "eye_hand_coordination": "手眼协调",
    "cognitive_performance": "认知表现",
    "verbal_cognition": "口语认知"
  }';
  item_counts jsonb := '{
    "imitation": 10,
    "perception": 13,
    "fine_motor": 10,
    "gross_motor": 11,
    "eye_hand_coordination": 14,
    "cognitive_performance": 20,
    "verbal_cognition": 19
  }';
BEGIN
  FOREACH d IN ARRAY domains LOOP
    d_label_zh := labels->>d;
    max_items := (item_counts->>d)::int;
    FOR i IN 1..max_items LOOP
      INSERT INTO public.c_pep3_developmental_items (domain, domain_label_zh, item_number, description, age_range)
      VALUES (d, d_label_zh, i,
        d_label_zh || ' 第' || i || '项: 参见C-PEP-3评估手册',
        NULL)
      ON CONFLICT (domain, item_number) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- ============================================================
-- 第十三部分：种子数据 - C-PEP-3 病理领域项目
-- 5大领域，共57项
-- ============================================================

DO $$
DECLARE
  d text;
  d_label_zh text;
  i int;
  max_items int;
  domains text[] := ARRAY['affect','interpersonal','material_play','sensory_modes','language'];
  labels jsonb := '{
    "affect": "情感",
    "interpersonal": "人际关系",
    "material_play": "材料游戏的种类与范围",
    "sensory_modes": "感觉模式",
    "language": "语言"
  }';
  item_counts jsonb := '{
    "affect": 11,
    "interpersonal": 11,
    "material_play": 8,
    "sensory_modes": 16,
    "language": 11
  }';
BEGIN
  FOREACH d IN ARRAY domains LOOP
    d_label_zh := labels->>d;
    max_items := (item_counts->>d)::int;
    FOR i IN 1..max_items LOOP
      INSERT INTO public.c_pep3_pathological_items (domain, domain_label_zh, item_number, description)
      VALUES (d, d_label_zh, i,
        d_label_zh || ' 第' || i || '项: 参见C-PEP-3评估手册')
      ON CONFLICT (domain, item_number) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;
