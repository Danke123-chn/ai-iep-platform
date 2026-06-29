-- 安置形式改为多选（text[]），并迁移旧 placement_type 数据
alter table public.students
  add column if not exists placement_types text[] not null default '{}';

-- 将旧的单选值迁移到数组
update public.students
set placement_types = array[placement_type]
where placement_type is not null
  and placement_type <> ''
  and (placement_types is null or placement_types = '{}');

-- 移除旧列及其 check 约束
alter table public.students drop constraint if exists students_placement_type_check;
alter table public.students drop column if exists placement_type;

notify pgrst, 'reload schema';
