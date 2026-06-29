-- 短期目标进度追踪字段说明
-- progress、progress_notes 存储在 iep_goals.short_term_goals JSONB 数组的每个元素中：
-- {
--   "content": "...",
--   "assessmentMethod": "...",
--   "startDate": "YYYY-MM-DD",
--   "endDate": "YYYY-MM-DD",
--   "progress": "P" | "C" | "D" | "S" | "E",
--   "progress_notes": "备注文本",
--   "progress_updated_at": "YYYY-MM-DD"
-- }

comment on column public.iep_goals.short_term_goals is
  '短期目标 JSON 数组，含 progress（进度状态）、progress_notes（进度备注）、progress_updated_at（更新日期）';
