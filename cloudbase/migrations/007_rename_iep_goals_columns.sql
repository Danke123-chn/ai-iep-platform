-- 修复 iep_goals 表列名不一致（domain → domain_name 等）
-- 在 Supabase SQL Editor 粘贴执行

-- domain → domain_name
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'iep_goals'
      and column_name = 'domain'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'iep_goals'
      and column_name = 'domain_name'
  ) then
    alter table public.iep_goals rename column domain to domain_name;
  end if;
end $$;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'iep_goals'
      and column_name = 'domain'
  ) and exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'iep_goals'
      and column_name = 'domain_name'
  ) then
    update public.iep_goals
    set domain_name = domain
    where (domain_name is null or domain_name = '')
      and domain is not null;

    alter table public.iep_goals drop column domain;
  end if;
end $$;

-- long_term → long_term_goal（若存在旧列名）
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'iep_goals'
      and column_name = 'long_term'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'iep_goals'
      and column_name = 'long_term_goal'
  ) then
    alter table public.iep_goals rename column long_term to long_term_goal;
  end if;
end $$;

-- short_term → short_term_goals（若存在旧列名）
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'iep_goals'
      and column_name = 'short_term'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'iep_goals'
      and column_name = 'short_term_goals'
  ) then
    alter table public.iep_goals rename column short_term to short_term_goals;
  end if;
end $$;

-- 确保程序所需列都存在
alter table public.iep_goals add column if not exists domain_name text not null default '';
alter table public.iep_goals add column if not exists current_level text not null default '';
alter table public.iep_goals add column if not exists long_term_goal text not null default '';
alter table public.iep_goals add column if not exists short_term_goals jsonb not null default '[]';
alter table public.iep_goals add column if not exists sort_order int not null default 0;
alter table public.iep_goals add column if not exists created_at timestamptz not null default now();

