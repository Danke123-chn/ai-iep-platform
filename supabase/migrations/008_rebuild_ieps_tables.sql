-- 一次性对齐 ieps / iep_goals 表结构（推荐：若反复报错，直接执行本文件）
-- 警告：会删除所有已有 IEP 数据

drop table if exists public.iep_goals cascade;
drop table if exists public.ieps cascade;

create table public.ieps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  student_id uuid references public.students(id) on delete cascade not null,
  school_year text not null,
  semester text not null check (semester in ('上学期', '下学期')),
  start_date date not null,
  end_date date not null,
  assessment_data jsonb not null default '{}',
  token_usage jsonb,
  generated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.iep_goals (
  id uuid primary key default gen_random_uuid(),
  iep_id uuid references public.ieps(id) on delete cascade not null,
  domain_name text not null,
  current_level text not null,
  long_term_goal text not null,
  short_term_goals jsonb not null default '[]',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index ieps_user_id_idx on public.ieps (user_id);
create index ieps_student_id_idx on public.ieps (student_id);
create index iep_goals_iep_id_idx on public.iep_goals (iep_id);

alter table public.ieps enable row level security;
alter table public.iep_goals enable row level security;

create policy "Users can view own ieps"
  on public.ieps for select using (auth.uid() = user_id);
create policy "Users can insert own ieps"
  on public.ieps for insert with check (auth.uid() = user_id);
create policy "Users can update own ieps"
  on public.ieps for update using (auth.uid() = user_id);
create policy "Users can delete own ieps"
  on public.ieps for delete using (auth.uid() = user_id);

create policy "Users can view own iep goals"
  on public.iep_goals for select using (
    exists (select 1 from public.ieps where ieps.id = iep_goals.iep_id and ieps.user_id = auth.uid())
  );
create policy "Users can insert own iep goals"
  on public.iep_goals for insert with check (
    exists (select 1 from public.ieps where ieps.id = iep_goals.iep_id and ieps.user_id = auth.uid())
  );
create policy "Users can update own iep goals"
  on public.iep_goals for update using (
    exists (select 1 from public.ieps where ieps.id = iep_goals.iep_id and ieps.user_id = auth.uid())
  );
create policy "Users can delete own iep goals"
  on public.iep_goals for delete using (
    exists (select 1 from public.ieps where ieps.id = iep_goals.iep_id and ieps.user_id = auth.uid())
  );

notify pgrst, 'reload schema';
