-- 上传评估报告工具类型
-- 前提：已执行 009_assessment_sessions.sql

ALTER TABLE public.assessment_sessions
  DROP CONSTRAINT IF EXISTS assessment_sessions_tool_type_check;

ALTER TABLE public.assessment_sessions
  ADD CONSTRAINT assessment_sessions_tool_type_check
  CHECK (tool_type IN (
    'vb_mapp',
    'c_pep3',
    'kg_integration',
    'elem_integration',
    'uploaded_report'
  ));
