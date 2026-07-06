-- 评估会话：学年 / 学期 / 计划起止（供 IEP 生成使用）

alter table public.assessment_sessions
  add column if not exists school_year text,
  add column if not exists semester text check (semester is null or semester in ('上学期', '下学期')),
  add column if not exists plan_start_date date,
  add column if not exists plan_end_date date;
