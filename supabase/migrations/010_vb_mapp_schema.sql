-- VB-MAPP 表结构 + RLS + 种子数据
-- 在 Supabase SQL Editor 粘贴执行（复制本文件内容，不要输入文件路径）
-- 前提：已执行 009_assessment_sessions.sql

-- VB-MAPP 里程碑定义（170项，16个领域，3个发展层级）
CREATE TABLE IF NOT EXISTS public.vb_mapp_milestones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  domain TEXT NOT NULL,
  domain_label_zh TEXT NOT NULL,
  level INTEGER NOT NULL CHECK (level IN (1, 2, 3)),
  milestone_number INTEGER NOT NULL,
  description TEXT NOT NULL,
  age_range TEXT NOT NULL,
  UNIQUE(domain, level, milestone_number)
);

-- VB-MAPP 障碍评估定义（24项）
CREATE TABLE IF NOT EXISTS public.vb_mapp_barriers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  barrier_name TEXT NOT NULL,
  barrier_name_zh TEXT NOT NULL,
  category TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  UNIQUE(barrier_name)
);

-- VB-MAPP 过渡评估定义（18项）
CREATE TABLE IF NOT EXISTS public.vb_mapp_transitions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transition_name TEXT NOT NULL,
  transition_name_zh TEXT NOT NULL,
  category TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  UNIQUE(transition_name)
);

-- ============================================================
-- 第三部分：VB-MAPP 评分表（用户数据，RLS保护）
-- ============================================================

-- 里程碑评分
CREATE TABLE IF NOT EXISTS public.vb_mapp_milestone_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.assessment_sessions(id) ON DELETE CASCADE,
  milestone_id UUID NOT NULL REFERENCES public.vb_mapp_milestones(id) ON DELETE RESTRICT,
  score NUMERIC(2,1) NOT NULL DEFAULT 0 CHECK (score IN (0, 0.5, 1)),
  notes TEXT,
  assessed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, milestone_id)
);

-- 障碍评分
CREATE TABLE IF NOT EXISTS public.vb_mapp_barrier_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.assessment_sessions(id) ON DELETE CASCADE,
  barrier_id UUID NOT NULL REFERENCES public.vb_mapp_barriers(id) ON DELETE RESTRICT,
  score INTEGER NOT NULL DEFAULT 0 CHECK (score BETWEEN 0 AND 4),
  notes TEXT,
  UNIQUE(session_id, barrier_id)
);

-- 过渡评分
CREATE TABLE IF NOT EXISTS public.vb_mapp_transition_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.assessment_sessions(id) ON DELETE CASCADE,
  transition_id UUID NOT NULL REFERENCES public.vb_mapp_transitions(id) ON DELETE RESTRICT,
  score INTEGER NOT NULL DEFAULT 0 CHECK (score BETWEEN 0 AND 5),
  notes TEXT,
  UNIQUE(session_id, transition_id)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_vbmapp_milestone_domain ON vb_mapp_milestones(domain);
CREATE INDEX IF NOT EXISTS idx_vbmapp_milestone_level ON vb_mapp_milestones(level);

CREATE INDEX IF NOT EXISTS idx_vbmapp_ms_scores_session ON vb_mapp_milestone_scores(session_id);
CREATE INDEX IF NOT EXISTS idx_vbmapp_br_scores_session ON vb_mapp_barrier_scores(session_id);
CREATE INDEX IF NOT EXISTS idx_vbmapp_tr_scores_session ON vb_mapp_transition_scores(session_id);

-- RLS
ALTER TABLE public.vb_mapp_milestone_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vb_mapp_barrier_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vb_mapp_transition_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vb_mapp_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vb_mapp_barriers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vb_mapp_transitions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "定义表所有认证用户可读" ON public.vb_mapp_milestones;
CREATE POLICY "定义表所有认证用户可读" ON public.vb_mapp_milestones
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "定义表所有认证用户可读" ON public.vb_mapp_barriers;
CREATE POLICY "定义表所有认证用户可读" ON public.vb_mapp_barriers
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "定义表所有认证用户可读" ON public.vb_mapp_transitions;
CREATE POLICY "定义表所有认证用户可读" ON public.vb_mapp_transitions
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "查看自己的里程碑评分" ON public.vb_mapp_milestone_scores;
CREATE POLICY "查看自己的里程碑评分" ON public.vb_mapp_milestone_scores
  FOR SELECT TO authenticated USING (
    session_id IN (SELECT id FROM assessment_sessions WHERE assessor_id = auth.uid())
  );
DROP POLICY IF EXISTS "创建里程碑评分" ON public.vb_mapp_milestone_scores;
CREATE POLICY "创建里程碑评分" ON public.vb_mapp_milestone_scores
  FOR INSERT TO authenticated WITH CHECK (
    session_id IN (SELECT id FROM assessment_sessions WHERE assessor_id = auth.uid())
  );
DROP POLICY IF EXISTS "修改里程碑评分" ON public.vb_mapp_milestone_scores;
CREATE POLICY "修改里程碑评分" ON public.vb_mapp_milestone_scores
  FOR UPDATE TO authenticated USING (
    session_id IN (SELECT id FROM assessment_sessions WHERE assessor_id = auth.uid())
  );
DROP POLICY IF EXISTS "删除里程碑评分" ON public.vb_mapp_milestone_scores;
CREATE POLICY "删除里程碑评分" ON public.vb_mapp_milestone_scores
  FOR DELETE TO authenticated USING (
    session_id IN (SELECT id FROM assessment_sessions WHERE assessor_id = auth.uid())
  );

-- VB-MAPP 障碍评分策略
DROP POLICY IF EXISTS "查看自己的障碍评分" ON public.vb_mapp_barrier_scores;
CREATE POLICY "查看自己的障碍评分" ON public.vb_mapp_barrier_scores
  FOR SELECT TO authenticated USING (
    session_id IN (SELECT id FROM assessment_sessions WHERE assessor_id = auth.uid())
  );
DROP POLICY IF EXISTS "创建障碍评分" ON public.vb_mapp_barrier_scores;
CREATE POLICY "创建障碍评分" ON public.vb_mapp_barrier_scores
  FOR INSERT TO authenticated WITH CHECK (
    session_id IN (SELECT id FROM assessment_sessions WHERE assessor_id = auth.uid())
  );
DROP POLICY IF EXISTS "修改障碍评分" ON public.vb_mapp_barrier_scores;
CREATE POLICY "修改障碍评分" ON public.vb_mapp_barrier_scores
  FOR UPDATE TO authenticated USING (
    session_id IN (SELECT id FROM assessment_sessions WHERE assessor_id = auth.uid())
  );
DROP POLICY IF EXISTS "删除障碍评分" ON public.vb_mapp_barrier_scores;
CREATE POLICY "删除障碍评分" ON public.vb_mapp_barrier_scores
  FOR DELETE TO authenticated USING (
    session_id IN (SELECT id FROM assessment_sessions WHERE assessor_id = auth.uid())
  );

-- VB-MAPP 过渡评分策略
DROP POLICY IF EXISTS "查看自己的过渡评分" ON public.vb_mapp_transition_scores;
CREATE POLICY "查看自己的过渡评分" ON public.vb_mapp_transition_scores
  FOR SELECT TO authenticated USING (
    session_id IN (SELECT id FROM assessment_sessions WHERE assessor_id = auth.uid())
  );
DROP POLICY IF EXISTS "创建过渡评分" ON public.vb_mapp_transition_scores;
CREATE POLICY "创建过渡评分" ON public.vb_mapp_transition_scores
  FOR INSERT TO authenticated WITH CHECK (
    session_id IN (SELECT id FROM assessment_sessions WHERE assessor_id = auth.uid())
  );
DROP POLICY IF EXISTS "修改过渡评分" ON public.vb_mapp_transition_scores;
CREATE POLICY "修改过渡评分" ON public.vb_mapp_transition_scores
  FOR UPDATE TO authenticated USING (
    session_id IN (SELECT id FROM assessment_sessions WHERE assessor_id = auth.uid())
  );
DROP POLICY IF EXISTS "删除过渡评分" ON public.vb_mapp_transition_scores;
CREATE POLICY "删除过渡评分" ON public.vb_mapp_transition_scores
  FOR DELETE TO authenticated USING (
    session_id IN (SELECT id FROM assessment_sessions WHERE assessor_id = auth.uid())
  );

-- ============================================================
-- 第九部分：种子数据 - VB-MAPP 障碍定义（24项）
-- ============================================================

INSERT INTO public.vb_mapp_barriers (barrier_name, barrier_name_zh, category, sort_order) VALUES
('negative_behavior', '负面行为（攻击/发脾气）', '行为问题', 1),
('prompt_dependency', '提示依赖', '学习障碍', 2),
('long_delays', '反应延迟过长', '学习障碍', 3),
('scrolling', '滚动行为（连续无效应答）', '学习障碍', 4),
('roaming', '游走行为', '行为问题', 5),
('response_requirements', '回应要求过高', '学习障碍', 6),
('sensory_deficits', '感觉缺陷', '生理障碍', 7),
('tactile_defensiveness', '触觉防御', '感觉障碍', 8),
('defective_mand', '提要求能力缺陷', '语言障碍', 9),
('defective_tact', '命名能力缺陷', '语言障碍', 10),
('defective_intraverbal', '对话能力缺陷', '语言障碍', 11),
('defective_mts', '配对能力缺陷', '学习障碍', 12),
('defective_lrffc', '听者功能特征类别缺陷', '语言障碍', 13),
('defective_echoic_mand', '仿说/提要求缺陷', '语言障碍', 14),
('defective_imitation', '模仿能力缺陷', '学习障碍', 15),
('self_stimulation', '自我刺激行为', '行为问题', 16),
('defective_listener_responding', '听者技能缺陷', '语言障碍', 17),
('articulation_problems', '发音问题', '语言障碍', 18),
('obsessive_compulsive', '强迫行为', '行为问题', 19),
('hyperactivity', '过度活跃', '行为问题', 20),
('visual_stimulation', '视觉自我刺激', '行为问题', 21),
('scattered_skills', '能力散碎不连贯', '学习障碍', 22),
('failure_to_generalize', '泛化失败', '学习障碍', 23),
('position_bias', '位置偏倚', '学习障碍', 24)
ON CONFLICT (barrier_name) DO NOTHING;

-- ============================================================
-- 第十部分：种子数据 - VB-MAPP 过渡评估定义（18项）
-- ============================================================

INSERT INTO public.vb_mapp_transitions (transition_name, transition_name_zh, category, sort_order) VALUES
('negative_behaviors_others', '对他人负面行为', '行为评估', 1),
('self_injurious_behavior', '自伤行为', '行为评估', 2),
('independence', '独立性', '能力评估', 3),
('change_routines', '适应日常变化能力', '适应能力', 4),
('interact_peers', '与同伴互动能力', '社交能力', 5),
('follow_group_instructions', '遵循集体指令能力', '学习能力', 6),
('repertoire_mand', '现有提要求技能库', '技能评估', 7),
('repertoire_tact', '现有命名技能库', '技能评估', 8),
('repertoire_lr', '现有听者技能库', '技能评估', 9),
('repertoire_iv', '现有对话技能库', '技能评估', 10),
('repertoire_play', '现有游戏技能库', '技能评估', 11),
('repertoire_social', '现有社交技能库', '技能评估', 12),
('rate_acquisition', '技能习得速度', '学习效率', 13),
('adaptability_change', '适应变化能力', '适应能力', 14),
('rate_retention', '技能保持速度', '学习效率', 15),
('natural_environment_learning', '自然环境学习', '学习能力', 16),
('trainability', '可训练性', '学习效率', 17),
('potential_prior_learning', '先前学习潜力', '学习效率', 18)
ON CONFLICT (transition_name) DO NOTHING;

-- ============================================================
-- 第十一部分：种子数据 - VB-MAPP 里程碑定义（170项）
-- 通过 DO 块批量生成
-- ============================================================

DO $$
DECLARE
  d text;
  d_label_zh text;
  i int;
  level1 text[] := ARRAY['mand','tact','listener_responding','vp_mts','independent_play','social_behavior','motor_imitation','spontaneous_vocal','echoic'];
  level2_extra text[] := ARRAY['intraverbal','lrffc','syntax_grammar'];
  level3_extra text[] := ARRAY['reading'];
  labels jsonb := '{
    "mand": "提要求",
    "tact": "命名",
    "listener_responding": "听者技能",
    "vp_mts": "视觉感知与配对",
    "independent_play": "独立游戏",
    "social_behavior": "社交行为与社交游戏",
    "motor_imitation": "动作模仿",
    "spontaneous_vocal": "自发发声行为",
    "echoic": "仿说",
    "intraverbal": "对话/互动语言",
    "lrffc": "听者功能特征类别",
    "syntax_grammar": "句法与语法",
    "reading": "阅读"
  }';
BEGIN
  -- Level 1 (0-18个月): 9个领域 x 5项 = 45项
  FOREACH d IN ARRAY level1 LOOP
    d_label_zh := labels->>d;
    FOR i IN 1..5 LOOP
      INSERT INTO public.vb_mapp_milestones (domain, domain_label_zh, level, milestone_number, description, age_range)
      VALUES (d, d_label_zh, 1, i,
        d_label_zh || ' 第一级(0-18月) 里程碑 ' || i || ': 参见VB-MAPP评估手册',
        '0-18个月')
      ON CONFLICT (domain, level, milestone_number) DO NOTHING;
    END LOOP;
  END LOOP;

  -- Level 2 (18-30个月): 12个领域 x 5项 = 60项
  FOREACH d IN ARRAY level1 || level2_extra LOOP
    d_label_zh := labels->>d;
    FOR i IN 1..5 LOOP
      INSERT INTO public.vb_mapp_milestones (domain, domain_label_zh, level, milestone_number, description, age_range)
      VALUES (d, d_label_zh, 2, i,
        d_label_zh || ' 第二级(18-30月) 里程碑 ' || i || ': 参见VB-MAPP评估手册',
        '18-30个月')
      ON CONFLICT (domain, level, milestone_number) DO NOTHING;
    END LOOP;
  END LOOP;

  -- Level 3 (30-48个月): 13个领域 x 5项 = 65项
  FOREACH d IN ARRAY level1 || level2_extra || level3_extra LOOP
    d_label_zh := labels->>d;
    FOR i IN 1..5 LOOP
      INSERT INTO public.vb_mapp_milestones (domain, domain_label_zh, level, milestone_number, description, age_range)
      VALUES (d, d_label_zh, 3, i,
        d_label_zh || ' 第三级(30-48月) 里程碑 ' || i || ': 参见VB-MAPP评估手册',
        '30-48个月')
      ON CONFLICT (domain, level, milestone_number) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

notify pgrst, 'reload schema';