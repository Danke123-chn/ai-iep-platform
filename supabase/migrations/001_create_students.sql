-- 学生档案表
create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  gender text check (gender in ('男', '女', '其他')),
  birth_date date,
  disability_types text[] not null default '{}',
  school text,
  grade text,
  class_name text,
  placement_type text check (placement_type in ('普通班', '资源教室', '特教班', '送教上门')),
  parent_name text,
  parent_phone text,
  family_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists students_user_id_idx on public.students (user_id);

alter table public.students enable row level security;

create policy "Users can view own students"
  on public.students for select
  using (auth.uid() = user_id);

create policy "Users can insert own students"
  on public.students for insert
  with check (auth.uid() = user_id);

create policy "Users can update own students"
  on public.students for update
  using (auth.uid() = user_id);

create policy "Users can delete own students"
  on public.students for delete
  using (auth.uid() = user_id);
