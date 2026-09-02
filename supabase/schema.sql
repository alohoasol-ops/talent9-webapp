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

-- ========== 商談創出AI(Sales AI) ==========
-- 「営業マンを増やす前に、商談を増やす」ための診断・ICP・リード管理モジュール。
-- companies / profiles の会社アカウント単位でデータを持つ(既存の team_members と同じ考え方)。

-- 自社の営業・集客プロフィール(診断・ICP生成の入力。会社ごとに1行)
create table if not exists public.sales_profiles (
  company_id uuid primary key references public.companies(id) on delete cascade,
  industry text,
  area text,
  employee_count text,
  website text,
  product_service text,
  price_range text,
  current_marketing text,
  current_sales_method text,
  monthly_inquiries integer,
  monthly_deals integer,
  monthly_orders integer,
  updated_at timestamptz not null default now()
);

-- AI営業・集客診断結果(実行のたびに1行追加し、最新を表示に使う)
create table if not exists public.sales_diagnoses (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  marketing_scores jsonb not null,
  sales_scores jsonb not null,
  lead_scores jsonb not null,
  bottleneck_category text not null,
  bottleneck_summary text not null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
create index if not exists sales_diagnoses_company_id_idx on public.sales_diagnoses(company_id, created_at desc);

-- ICP(理想顧客像。生成のたびに1行追加し、最新を表示に使う)
create table if not exists public.icps (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  industry text,
  employee_range text,
  area text,
  revenue_range text,
  pain_points text,
  features text,
  decision_maker text,
  buying_trigger text,
  reasoning text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
create index if not exists icps_company_id_idx on public.icps(company_id, created_at desc);

-- 見込み企業(リード)
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  url text,
  industry text,
  area text,
  employee_count text,
  estimated_revenue text,
  contact_name text,
  contact_title text,
  email text,
  phone text,
  sns_url text,
  hiring_status text,
  pain_points text,
  ai_score integer,
  score_reason text,
  status text not null default '未接触' check (status in (
    '未接触','アプローチ済','反応あり','興味あり','商談候補','商談','提案','受注','失注'
  )),
  deal_amount numeric,
  last_contact_date date,
  next_action text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists leads_company_id_idx on public.leads(company_id, created_at desc);
create index if not exists leads_status_idx on public.leads(company_id, status);

-- AIアプローチ文(リードごとの生成履歴。最新を表示に使う)
create table if not exists public.approach_texts (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  email_subject text,
  email_body text,
  form_message text,
  phone_script text,
  first_meeting_script text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
create index if not exists approach_texts_lead_id_idx on public.approach_texts(lead_id, created_at desc);

-- ---------- RLS 有効化 ----------
alter table public.sales_profiles enable row level security;
alter table public.sales_diagnoses enable row level security;
alter table public.icps enable row level security;
alter table public.leads enable row level security;
alter table public.approach_texts enable row level security;

-- ---------- sales_profiles ----------
drop policy if exists sales_profiles_select on public.sales_profiles;
create policy sales_profiles_select on public.sales_profiles
  for select using (public.is_hq_admin() or company_id = public.my_company_id());

drop policy if exists sales_profiles_insert on public.sales_profiles;
create policy sales_profiles_insert on public.sales_profiles
  for insert with check (company_id = public.my_company_id());

drop policy if exists sales_profiles_update on public.sales_profiles;
create policy sales_profiles_update on public.sales_profiles
  for update using (company_id = public.my_company_id())
  with check (company_id = public.my_company_id());

-- ---------- sales_diagnoses ----------
drop policy if exists sales_diagnoses_select on public.sales_diagnoses;
create policy sales_diagnoses_select on public.sales_diagnoses
  for select using (public.is_hq_admin() or company_id = public.my_company_id());

drop policy if exists sales_diagnoses_insert on public.sales_diagnoses;
create policy sales_diagnoses_insert on public.sales_diagnoses
  for insert with check (company_id = public.my_company_id());

-- ---------- icps ----------
drop policy if exists icps_select on public.icps;
create policy icps_select on public.icps
  for select using (public.is_hq_admin() or company_id = public.my_company_id());

drop policy if exists icps_insert on public.icps;
create policy icps_insert on public.icps
  for insert with check (company_id = public.my_company_id());

-- ---------- leads ----------
drop policy if exists leads_select on public.leads;
create policy leads_select on public.leads
  for select using (public.is_hq_admin() or company_id = public.my_company_id());

drop policy if exists leads_insert on public.leads;
create policy leads_insert on public.leads
  for insert with check (company_id = public.my_company_id());

drop policy if exists leads_update on public.leads;
create policy leads_update on public.leads
  for update using (company_id = public.my_company_id())
  with check (company_id = public.my_company_id());

drop policy if exists leads_delete on public.leads;
create policy leads_delete on public.leads
  for delete using (company_id = public.my_company_id());

-- ---------- approach_texts ----------
drop policy if exists approach_texts_select on public.approach_texts;
create policy approach_texts_select on public.approach_texts
  for select using (public.is_hq_admin() or company_id = public.my_company_id());

drop policy if exists approach_texts_insert on public.approach_texts;
create policy approach_texts_insert on public.approach_texts
  for insert with check (company_id = public.my_company_id());

-- ========== セットアップの最後の手順 ==========
-- 1. 上記を SQL Editor で実行
-- 2. Authentication > Users で最初の本部管理者ユーザーを作成(Add user)
-- 3. 作成した user の UUID を確認し、以下を実行して hq_admin として登録
--    insert into public.profiles (id, role, display_name)
--    values ('ここにユーザーのUUID', 'hq_admin', '本部管理者');
-- 以降の会社アカウント作成はアプリの本部画面(/hq/companies/new)から行えます。
