-- 过渡评估评分与障碍评估统一为 0-4 严重度（原 0-5 量表）
-- 在 Supabase SQL Editor 粘贴执行（若已执行 017 且仍允许 score=5）

UPDATE public.vb_mapp_transition_scores
SET score = 4
WHERE score = 5;

ALTER TABLE public.vb_mapp_transition_scores
  DROP CONSTRAINT IF EXISTS vb_mapp_transition_scores_score_check;

ALTER TABLE public.vb_mapp_transition_scores
  ADD CONSTRAINT vb_mapp_transition_scores_score_check
  CHECK (score IN (-1, 0, 1, 2, 3, 4));

NOTIFY pgrst, 'reload schema';
