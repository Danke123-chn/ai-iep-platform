-- 修复 ieps 表列名不一致（academic_year → school_year）
-- 在 Supabase SQL Editor 粘贴执行

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'ieps'
      and column_name = 'academic_year'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'ieps'
      and column_name = 'school_year'
  ) then
    alter table public.ieps rename column academic_year to school_year;
  end if;
end $$;

-- 若两列同时存在，合并后删除旧列
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'ieps'
      and column_name = 'academic_year'
  ) and exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'ieps'
      and column_name = 'school_year'
  ) then
    update public.ieps
    set school_year = academic_year
    where (school_year is null or school_year = '')
      and academic_year is not null;

    alter table public.ieps drop column academic_year;
  end if;
end $$;

-- 确保 school_year 存在
alter table public.ieps
  add column if not exists school_year text not null default '';

notify pgrst, 'reload schema';
