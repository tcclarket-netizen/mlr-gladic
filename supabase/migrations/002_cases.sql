-- Cases: one consumer file per user (consultants manage multiple)
create table if not exists public.cases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  client_name text not null,
  state text not null,
  notes text,
  status text not null default 'draft'
    check (status in ('draft', 'active', 'review', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists cases_user_id_idx on public.cases (user_id);
create index if not exists cases_updated_at_idx on public.cases (updated_at desc);

alter table public.cases enable row level security;

create policy "Users can view own cases"
  on public.cases for select
  using (auth.uid() = user_id);

create policy "Users can create own cases"
  on public.cases for insert
  with check (auth.uid() = user_id);

create policy "Users can update own cases"
  on public.cases for update
  using (auth.uid() = user_id);

create policy "Users can delete own cases"
  on public.cases for delete
  using (auth.uid() = user_id);

-- Bureau PDF uploads metadata (files live in Storage)
create table if not exists public.uploaded_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  case_id uuid not null references public.cases (id) on delete cascade,
  bureau text not null
    check (bureau in ('experian', 'equifax', 'transunion')),
  file_path text not null,
  file_name text not null,
  file_size bigint,
  mime_type text not null default 'application/pdf',
  status text not null default 'uploaded'
    check (status in ('uploaded', 'processing', 'processed', 'failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (case_id, bureau)
);

create index if not exists uploaded_reports_case_id_idx on public.uploaded_reports (case_id);

alter table public.uploaded_reports enable row level security;

create policy "Users can view own uploaded reports"
  on public.uploaded_reports for select
  using (auth.uid() = user_id);

create policy "Users can insert own uploaded reports"
  on public.uploaded_reports for insert
  with check (auth.uid() = user_id);

create policy "Users can update own uploaded reports"
  on public.uploaded_reports for update
  using (auth.uid() = user_id);

create policy "Users can delete own uploaded reports"
  on public.uploaded_reports for delete
  using (auth.uid() = user_id);

-- Case timeline events
create table if not exists public.case_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  case_id uuid not null references public.cases (id) on delete cascade,
  event_type text not null,
  title text not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists case_events_case_id_idx on public.case_events (case_id, created_at desc);

alter table public.case_events enable row level security;

create policy "Users can view own case events"
  on public.case_events for select
  using (auth.uid() = user_id);

create policy "Users can insert own case events"
  on public.case_events for insert
  with check (auth.uid() = user_id);

-- Auto-update updated_at on cases
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists cases_set_updated_at on public.cases;
create trigger cases_set_updated_at
  before update on public.cases
  for each row execute function public.set_updated_at();

drop trigger if exists uploaded_reports_set_updated_at on public.uploaded_reports;
create trigger uploaded_reports_set_updated_at
  before update on public.uploaded_reports
  for each row execute function public.set_updated_at();

-- Storage bucket for bureau PDFs (path: {user_id}/{case_id}/{bureau}/{filename})
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'credit-reports',
  'credit-reports',
  false,
  52428800,
  array['application/pdf']::text[]
)
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Users can read own credit report files"
  on storage.objects for select
  using (
    bucket_id = 'credit-reports'
    and auth.uid()::text = (storage.foldername (name))[1]
  );

create policy "Users can upload own credit report files"
  on storage.objects for insert
  with check (
    bucket_id = 'credit-reports'
    and auth.uid()::text = (storage.foldername (name))[1]
  );

create policy "Users can update own credit report files"
  on storage.objects for update
  using (
    bucket_id = 'credit-reports'
    and auth.uid()::text = (storage.foldername (name))[1]
  );

create policy "Users can delete own credit report files"
  on storage.objects for delete
  using (
    bucket_id = 'credit-reports'
    and auth.uid()::text = (storage.foldername (name))[1]
  );
