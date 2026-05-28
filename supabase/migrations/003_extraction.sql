-- Case-level computed metrics (TurnKey summary cards)
alter table public.cases
  add column if not exists metrics jsonb not null default '{}';

grant usage on schema public to anon, authenticated, service_role;

-- Raw AI extraction per uploaded bureau PDF
create table if not exists public.bureau_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  case_id uuid not null references public.cases (id) on delete cascade,
  uploaded_report_id uuid not null references public.uploaded_reports (id) on delete cascade,
  bureau text not null
    check (bureau in ('experian', 'equifax', 'transunion')),
  credit_score integer,
  raw_extraction jsonb not null default '{}',
  extracted_at timestamptz not null default now(),
  unique (uploaded_report_id)
);

grant select, insert, update, delete on public.bureau_reports to authenticated;
grant select, insert, update, delete on public.bureau_reports to service_role;

create index if not exists bureau_reports_case_id_idx on public.bureau_reports (case_id);

alter table public.bureau_reports enable row level security;

drop policy if exists "Users can view own bureau reports" on public.bureau_reports;
create policy "Users can view own bureau reports"
  on public.bureau_reports for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own bureau reports" on public.bureau_reports;
create policy "Users can insert own bureau reports"
  on public.bureau_reports for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own bureau reports" on public.bureau_reports;
create policy "Users can update own bureau reports"
  on public.bureau_reports for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own bureau reports" on public.bureau_reports;
create policy "Users can delete own bureau reports"
  on public.bureau_reports for delete using (auth.uid() = user_id);

-- Normalized tradelines (post cross-bureau merge)
create table if not exists public.tradelines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  case_id uuid not null references public.cases (id) on delete cascade,
  normalized_key text not null,
  creditor_name text not null,
  account_type text,
  account_status text,
  bureaus text[] not null default '{}',
  balance numeric,
  credit_limit numeric,
  utilization_pct numeric,
  date_opened text,
  is_negative boolean not null default false,
  verification_status text not null default 'review',
  dispute_basis text,
  raw_by_bureau jsonb not null default '{}',
  created_at timestamptz not null default now()
);

grant select, insert, update, delete on public.tradelines to authenticated;
grant select, insert, update, delete on public.tradelines to service_role;

create index if not exists tradelines_case_id_idx on public.tradelines (case_id);

alter table public.tradelines enable row level security;

drop policy if exists "Users can view own tradelines" on public.tradelines;
create policy "Users can view own tradelines"
  on public.tradelines for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own tradelines" on public.tradelines;
create policy "Users can insert own tradelines"
  on public.tradelines for insert with check (auth.uid() = user_id);

drop policy if exists "Users can delete own tradelines" on public.tradelines;
create policy "Users can delete own tradelines"
  on public.tradelines for delete using (auth.uid() = user_id);

-- Hard / soft inquiries
create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  case_id uuid not null references public.cases (id) on delete cascade,
  bureau text not null
    check (bureau in ('experian', 'equifax', 'transunion')),
  creditor_name text not null,
  inquiry_type text not null default 'hard'
    check (inquiry_type in ('hard', 'soft', 'unknown')),
  inquiry_date text,
  created_at timestamptz not null default now()
);

grant select, insert, update, delete on public.inquiries to authenticated;
grant select, insert, update, delete on public.inquiries to service_role;

create index if not exists inquiries_case_id_idx on public.inquiries (case_id);

alter table public.inquiries enable row level security;

drop policy if exists "Users can view own inquiries" on public.inquiries;
create policy "Users can view own inquiries"
  on public.inquiries for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own inquiries" on public.inquiries;
create policy "Users can insert own inquiries"
  on public.inquiries for insert with check (auth.uid() = user_id);

drop policy if exists "Users can delete own inquiries" on public.inquiries;
create policy "Users can delete own inquiries"
  on public.inquiries for delete using (auth.uid() = user_id);

-- Collections & public records
create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  case_id uuid not null references public.cases (id) on delete cascade,
  bureau text not null,
  creditor_name text not null,
  balance numeric,
  status text,
  created_at timestamptz not null default now()
);

grant select, insert, update, delete on public.collections to authenticated;
grant select, insert, update, delete on public.collections to service_role;

alter table public.collections enable row level security;

drop policy if exists "Users can view own collections" on public.collections;
create policy "Users can view own collections"
  on public.collections for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own collections" on public.collections;
create policy "Users can insert own collections"
  on public.collections for insert with check (auth.uid() = user_id);

drop policy if exists "Users can delete own collections" on public.collections;
create policy "Users can delete own collections"
  on public.collections for delete using (auth.uid() = user_id);

create table if not exists public.public_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  case_id uuid not null references public.cases (id) on delete cascade,
  bureau text not null,
  record_type text not null,
  status text,
  amount numeric,
  filing_date text,
  created_at timestamptz not null default now()
);

grant select, insert, update, delete on public.public_records to authenticated;
grant select, insert, update, delete on public.public_records to service_role;

alter table public.public_records enable row level security;

drop policy if exists "Users can view own public records" on public.public_records;
create policy "Users can view own public records"
  on public.public_records for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own public records" on public.public_records;
create policy "Users can insert own public records"
  on public.public_records for insert with check (auth.uid() = user_id);

drop policy if exists "Users can delete own public records" on public.public_records;
create policy "Users can delete own public records"
  on public.public_records for delete using (auth.uid() = user_id);

-- MY LEGAL REPORT™ and future document types
create table if not exists public.generated_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  case_id uuid not null references public.cases (id) on delete cascade,
  report_type text not null default 'legal_report',
  title text not null default 'MY LEGAL REPORT™',
  content jsonb not null default '{}',
  markdown text,
  status text not null default 'ready'
    check (status in ('generating', 'ready', 'failed')),
  generated_at timestamptz not null default now(),
  unique (case_id, report_type)
);

grant select, insert, update, delete on public.generated_reports to authenticated;
grant select, insert, update, delete on public.generated_reports to service_role;

create index if not exists generated_reports_case_id_idx on public.generated_reports (case_id);

alter table public.generated_reports enable row level security;

drop policy if exists "Users can view own generated reports" on public.generated_reports;
create policy "Users can view own generated reports"
  on public.generated_reports for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own generated reports" on public.generated_reports;
create policy "Users can insert own generated reports"
  on public.generated_reports for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own generated reports" on public.generated_reports;
create policy "Users can update own generated reports"
  on public.generated_reports for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own generated reports" on public.generated_reports;
create policy "Users can delete own generated reports"
  on public.generated_reports for delete using (auth.uid() = user_id);
