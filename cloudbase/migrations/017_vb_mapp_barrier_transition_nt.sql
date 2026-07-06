-- VB-MAPP 障碍 / 过渡评分增加「未测」选项（-1）
-- 在 Supabase SQL Editor 粘贴执行

ALTER TABLE public.vb_mapp_barrier_scores
  DROP CONSTRAINT IF EXISTS vb_mapp_barrier_scores_score_check;

ALTER TABLE public.vb_mapp_barrier_scores
  ADD CONSTRAINT vb_mapp_barrier_scores_score_check
  CHECK (score IN (-1, 0, 1, 2, 3, 4));

ALTER TABLE public.vb_mapp_transition_scores
  DROP CONSTRAINT IF EXISTS vb_mapp_transition_scores_score_check;

ALTER TABLE public.vb_mapp_transition_scores
  ADD CONSTRAINT vb_mapp_transition_scores_score_check
  CHECK (score IN (-1, 0, 1, 2, 3, 4));

