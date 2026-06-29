-- 一次性修复 ieps / iep_goals 表结构（Supabase SQL Editor 粘贴执行）

-- ========== ieps 表 ==========
create table if not exists public.ieps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  student_id uuid references public.students(id) on delete cascade not null,
  school_year text not null default '',
  semester text not null default '上学期',
  start_date date not null default current_date,
  end_date date not null default current_date,
  assessment_data jsonb not null default '{}',
  token_usage jsonb,
  generated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ieps add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.ieps add column if not exists student_id uuid references public.students(id) on delete cascade;
alter table public.ieps add column if not exists school_year text not null default '';
alter table public.ieps add column if not exists semester text not null default '上学期';
alter table public.ieps add column if not exists start_date date not null default current_date;
alter table public.ieps add column if not exists end_date date not null default current_date;
alter table public.ieps add column if not exists assessment_data jsonb not null default '{}';
alter table public.ieps add column if not exists token_usage jsonb;
alter table public.ieps add column if not exists generated_at timestamptz;
alter table public.ieps add column if not exists created_at timestamptz not null default now();
alter table public.ieps add column if not exists updated_at timestamptz not null default now();

-- ========== iep_goals 表 ==========
create table if not exists public.iep_goals (
  id uuid primary key default gen_random_uuid(),
  iep_id uuid references public.ieps(id) on delete cascade not null,
  domain_name text not null default '',
  current_level text not null default '',
  long_term_goal text not null default '',
  short_term_goals jsonb not null default '[]',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.iep_goals add column if not exists iep_id uuid references public.ieps(id) on delete cascade;
alter table public.iep_goals add column if not exists domain_name text not null default '';
alter table public.iep_goals add column if not exists current_level text not null default '';
alter table public.iep_goals add column if not exists long_term_goal text not null default '';
alter table public.iep_goals add column if not exists short_term_goals jsonb not null default '[]';
alter table public.iep_goals add column if not exists sort_order int not null default 0;
alter table public.iep_goals add column if not exists created_at timestamptz not null default now();

-- ========== RLS ==========
alter table public.ieps enable row level security;
alter table public.iep_goals enable row level security;

-- 刷新 API 缓存
notify pgrst, 'reload schema';
