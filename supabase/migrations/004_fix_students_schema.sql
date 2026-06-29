-- 修复 students 表缺失字段（适用于早期手动建表或未执行完整 migration 的情况）
-- 在 Supabase Dashboard → SQL Editor 中执行本文件

alter table public.students
  add column if not exists disability_types text[] not null default '{}';

alter table public.students
  add column if not exists birth_date date;

alter table public.students
  add column if not exists school text;

alter table public.students
  add column if not exists grade text;

alter table public.students
  add column if not exists class_name text;

alter table public.students
  add column if not exists placement_type text;

alter table public.students
  add column if not exists parent_name text;

alter table public.students
  add column if not exists parent_phone text;

alter table public.students
  add column if not exists family_notes text;

alter table public.students
  add column if not exists created_at timestamptz not null default now();

alter table public.students
  add column if not exists updated_at timestamptz not null default now();

-- 若 gender 列不存在则添加
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'students'
      and column_name = 'gender'
  ) then
    alter table public.students add column gender text;
  end if;
end $$;

-- 刷新 PostgREST schema cache（Supabase API 立即识别新列）
notify pgrst, 'reload schema';
