-- VB-MAPP 未测分值由 -1 改为 NT（TEXT 存储）
-- 在 Supabase SQL Editor 执行（可重复运行）

-- 必须先删除依赖 score 列的视图
DROP VIEW IF EXISTS public.v_vbmapp_milestone_summary;

-- ============================================================
-- 里程碑评分
-- ============================================================
ALTER TABLE public.vb_mapp_milestone_scores
  DROP CONSTRAINT IF EXISTS vb_mapp_milestone_scores_score_check;

ALTER TABLE public.vb_mapp_milestone_scores
  ALTER COLUMN score DROP DEFAULT;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'vb_mapp_milestone_scores'
      AND column_name = 'score'
      AND data_type <> 'text'
  ) THEN
    ALTER TABLE public.vb_mapp_milestone_scores
      ALTER COLUMN score TYPE TEXT USING (
        CASE
          WHEN score::numeric = -1 THEN 'NT'
          WHEN score::numeric = 0 THEN '0'
          WHEN score::numeric = 0.5 THEN '0.5'
          WHEN score::numeric = 1 THEN '1'
          ELSE 'NT'
        END
      );
  END IF;
END $$;

-- 规范化已有 TEXT 行（如 1.0、0.0 或上次迁移中断留下的值）
UPDATE public.vb_mapp_milestone_scores
SET score = CASE
  WHEN score IS NULL OR trim(score) IN ('-1', '-1.0', 'NT') THEN 'NT'
  WHEN score::numeric = 0 THEN '0'
  WHEN score::numeric = 0.5 THEN '0.5'
  WHEN score::numeric = 1 THEN '1'
  ELSE 'NT'
END;

ALTER TABLE public.vb_mapp_milestone_scores
  ALTER COLUMN score SET DEFAULT '0';

ALTER TABLE public.vb_mapp_milestone_scores
  ADD CONSTRAINT vb_mapp_milestone_scores_score_check
  CHECK (score IN ('NT', '0', '0.5', '1'));

-- ============================================================
-- 障碍评分
-- ============================================================
ALTER TABLE public.vb_mapp_barrier_scores
  DROP CONSTRAINT IF EXISTS vb_mapp_barrier_scores_score_check;

ALTER TABLE public.vb_mapp_barrier_scores
  ALTER COLUMN score DROP DEFAULT;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'vb_mapp_barrier_scores'
      AND column_name = 'score'
      AND data_type <> 'text'
  ) THEN
    ALTER TABLE public.vb_mapp_barrier_scores
      ALTER COLUMN score TYPE TEXT USING (
        CASE
          WHEN score::numeric = -1 THEN 'NT'
          WHEN score::numeric BETWEEN 0 AND 4 THEN score::numeric::int::text
          ELSE 'NT'
        END
      );
  END IF;
END $$;

UPDATE public.vb_mapp_barrier_scores
SET score = CASE
  WHEN score IS NULL OR trim(score) IN ('-1', 'NT') THEN 'NT'
  WHEN score::numeric BETWEEN 0 AND 4 THEN score::numeric::int::text
  ELSE 'NT'
END;

ALTER TABLE public.vb_mapp_barrier_scores
  ALTER COLUMN score SET DEFAULT '0';

ALTER TABLE public.vb_mapp_barrier_scores
  ADD CONSTRAINT vb_mapp_barrier_scores_score_check
  CHECK (score IN ('NT', '0', '1', '2', '3', '4'));

-- ============================================================
-- 过渡评分
-- ============================================================
ALTER TABLE public.vb_mapp_transition_scores
  DROP CONSTRAINT IF EXISTS vb_mapp_transition_scores_score_check;

ALTER TABLE public.vb_mapp_transition_scores
  ALTER COLUMN score DROP DEFAULT;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'vb_mapp_transition_scores'
      AND column_name = 'score'
      AND data_type <> 'text'
  ) THEN
    ALTER TABLE public.vb_mapp_transition_scores
      ALTER COLUMN score TYPE TEXT USING (
        CASE
          WHEN score::numeric = -1 THEN 'NT'
          WHEN score::numeric BETWEEN 0 AND 4 THEN score::numeric::int::text
          ELSE 'NT'
        END
      );
  END IF;
END $$;

UPDATE public.vb_mapp_transition_scores
SET score = CASE
  WHEN score IS NULL OR trim(score) IN ('-1', 'NT') THEN 'NT'
  WHEN score::numeric BETWEEN 0 AND 4 THEN score::numeric::int::text
  ELSE 'NT'
END;

ALTER TABLE public.vb_mapp_transition_scores
  ALTER COLUMN score SET DEFAULT '0';

ALTER TABLE public.vb_mapp_transition_scores
  ADD CONSTRAINT vb_mapp_transition_scores_score_check
  CHECK (score IN ('NT', '0', '1', '2', '3', '4'));

-- ============================================================
-- 重建里程碑汇总视图
-- ============================================================
CREATE OR REPLACE VIEW public.v_vbmapp_milestone_summary AS
SELECT
  s.id AS session_id,
  s.student_id,
  s.session_date,
  m.domain,
  m.domain_label_zh,
  m.level,
  COUNT(*) AS total_milestones,
  COUNT(CASE WHEN sc.score = '1' THEN 1 END) AS passed,
  COUNT(CASE WHEN sc.score = '0.5' THEN 1 END) AS partial,
  COUNT(CASE WHEN sc.score = '0' THEN 1 END) AS not_passed,
  COUNT(CASE WHEN sc.score = 'NT' OR sc.score IS NULL THEN 1 END) AS not_tested,
  COALESCE(
    SUM(
      CASE
        WHEN sc.score IN ('0', '0.5', '1') THEN sc.score::numeric
        ELSE 0
      END
    ),
    0
  ) AS total_score
FROM public.assessment_sessions s
JOIN public.vb_mapp_milestones m ON s.tool_type = 'vb_mapp'
LEFT JOIN public.vb_mapp_milestone_scores sc ON sc.session_id = s.id AND sc.milestone_id = m.id
GROUP BY s.id, s.student_id, s.session_date, m.domain, m.domain_label_zh, m.level
ORDER BY m.level, m.domain;

GRANT SELECT ON public.v_vbmapp_milestone_summary TO authenticated;

NOTIFY pgrst, 'reload schema';
