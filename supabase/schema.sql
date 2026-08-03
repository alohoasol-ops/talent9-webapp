-- 9才能 人的資本ポートフォリオ — Supabase schema
-- Supabaseダッシュボードの SQL Editor に貼り付けて実行してください。
-- 実行順に依存関係があるため、上から一括で実行することを想定しています。

create extension if not exists pgcrypto;

-- ========== companies ==========
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

-- ========== profiles (1:1 with auth.users) ==========
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  company_id uuid references public.companies(id) on delete set null,
  role text not null check (role in ('hq_admin', 'company_admin')),
  display_name text,
  created_at timestamptz not null default now()
);

-- company_admin は必ずどこかの会社に属し、hq_admin は会社に属さない
alter table public.profiles
  drop constraint if exists profiles_role_company_check;
alter table public.profiles
  add constraint profiles_role_company_check check (
    (role = 'hq_admin' and company_id is null)
    or (role = 'company_admin' and company_id is not null)
  );

-- ========== team_members ==========
create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  measured_date date,
  raw_scores jsonb not null,
  talent_scores jsonb not null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index if not exists team_members_company_id_idx on public.team_members(company_id);

-- ========== helper functions (RLSの再帰参照を避けるため SECURITY DEFINER で定義) ==========
create or replace function public.is_hq_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists(
    select 1 from public.profiles where id = auth.uid() and role = 'hq_admin'
  );
$$;

create or replace function public.my_company_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select company_id from public.profiles where id = auth.uid();
$$;

-- ========== RLS 有効化 ==========
alter table public.companies enable row level security;
alter table public.profiles enable row level security;
alter table public.team_members enable row level security;

-- ---------- companies ----------
drop policy if exists companies_select on public.companies;
create policy companies_select on public.companies
  for select using (
    public.is_hq_admin() or id = public.my_company_id()
  );

drop policy if exists companies_write on public.companies;
create policy companies_write on public.companies
  for all using (public.is_hq_admin())
  with check (public.is_hq_admin());

-- ---------- profiles ----------
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select using (
    id = auth.uid() or public.is_hq_admin()
  );

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update using (id = auth.uid())
  with check (id = auth.uid());

-- profiles の新規作成・会社への割当ては Service Role(サーバー側API)からのみ行う想定のため
-- 一般ユーザー向けの insert ポリシーはあえて用意していません。

-- ---------- team_members ----------
drop policy if exists team_members_select on public.team_members;
create policy team_members_select on public.team_members
  for select using (
    public.is_hq_admin() or company_id = public.my_company_id()
  );

-- 本部(hq_admin)は横断閲覧のみ・書き込みは不可(各社の運用データを本部が改変しない設計)
drop policy if exists team_members_insert on public.team_members;
create policy team_members_insert on public.team_members
  for insert with check (company_id = public.my_company_id());

drop policy if exists team_members_update on public.team_members;
create policy team_members_update on public.team_members
  for update using (company_id = public.my_company_id())
  with check (company_id = public.my_company_id());

drop policy if exists team_members_delete on public.team_members;
create policy team_members_delete on public.team_members
  for delete using (company_id = public.my_company_id());

-- ========== セットアップの最後の手順 ==========
-- 1. 上記を SQL Editor で実行
-- 2. Authentication > Users で最初の本部管理者ユーザーを作成(Add user)
-- 3. 作成した user の UUID を確認し、以下を実行して hq_admin として登録
--    insert into public.profiles (id, role, display_name)
--    values ('ここにユーザーのUUID', 'hq_admin', '本部管理者');
-- 以降の会社アカウント作成はアプリの本部画面(/hq/companies/new)から行えます。
