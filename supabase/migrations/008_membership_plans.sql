-- Membership-only billing: product entitlements per case per billing period.

alter table public.user_billing
  drop constraint if exists user_billing_plan_key_check;

update public.user_billing
set plan_key = 'none'
where plan_key in ('free_trial', 'pay_per_report', 'consultant', 'agency');

alter table public.user_billing
  alter column plan_key set default 'none';

alter table public.user_billing
  add constraint user_billing_plan_key_check
  check (plan_key in ('none', 'basic_i', 'basic_ii', 'basic_iii', 'accuracy', 'dispute', 'resolute'));

alter table public.user_billing
  add column if not exists current_period_start timestamptz;

create table if not exists public.case_product_entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  case_id uuid not null references public.cases (id) on delete cascade,
  product text not null check (product in ('opposition', 'legal', 'self')),
  billing_period_start timestamptz not null,
  unlocked_at timestamptz not null default now(),
  unique (user_id, case_id, product, billing_period_start)
);

create index if not exists case_product_entitlements_user_period_idx
  on public.case_product_entitlements (user_id, billing_period_start);

create index if not exists case_product_entitlements_case_idx
  on public.case_product_entitlements (case_id);

grant select, insert on public.case_product_entitlements to authenticated;
grant select, insert, update, delete on public.case_product_entitlements to service_role;

alter table public.case_product_entitlements enable row level security;

drop policy if exists "Users can view own case product entitlements" on public.case_product_entitlements;
create policy "Users can view own case product entitlements"
  on public.case_product_entitlements for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own case product entitlements" on public.case_product_entitlements;
create policy "Users can insert own case product entitlements"
  on public.case_product_entitlements for insert
  with check (auth.uid() = user_id);
