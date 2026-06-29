-- Prompt 1：评估会话表（VB-MAPP / C-PEP-3 共用）
-- 在 Supabase SQL Editor 粘贴执行

create table if not exists public.assessment_sessions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  assessor_id uuid not null references auth.users(id) on delete cascade,
  tool_type text not null check (tool_type in ('vb_mapp', 'c_pep3')),
  status text not null default 'in_progress' check (status in ('in_progress', 'completed')),
  session_date date not null default current_date,
  total_score numeric,
  summary text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_sessions_student on public.assessment_sessions(student_id);
create index if not exists idx_sessions_assessor on public.assessment_sessions(assessor_id);

alter table public.assessment_sessions enable row level security;

drop policy if exists "查看自己的评估记录" on public.assessment_sessions;
drop policy if exists "创建评估记录" on public.assessment_sessions;
drop policy if exists "修改自己的评估记录" on public.assessment_sessions;
drop policy if exists "删除自己的评估记录" on public.assessment_sessions;

create policy "查看自己的评估记录"
  on public.assessment_sessions for select
  to authenticated using (assessor_id = auth.uid());

create policy "创建评估记录"
  on public.assessment_sessions for insert
  to authenticated with check (assessor_id = auth.uid());

create policy "修改自己的评估记录"
  on public.assessment_sessions for update
  to authenticated using (assessor_id = auth.uid());

create policy "删除自己的评估记录"
  on public.assessment_sessions for delete
  to authenticated using (assessor_id = auth.uid());

notify pgrst, 'reload schema';
