create table if not exists public.user_billing (
  user_id uuid primary key references auth.users (id) on delete cascade,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  stripe_price_id text,
  plan_key text not null default 'free_trial'
    check (plan_key in ('free_trial', 'pay_per_report', 'consultant', 'agency')),
  billing_status text not null default 'none'
    check (billing_status in ('trialing', 'active', 'past_due', 'canceled', 'incomplete', 'incomplete_expired', 'unpaid', 'one_time_paid', 'none')),
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update on public.user_billing to authenticated;
grant select, insert, update, delete on public.user_billing to service_role;

alter table public.user_billing enable row level security;

drop policy if exists "Users can view own billing" on public.user_billing;
create policy "Users can view own billing"
  on public.user_billing for select
  using (auth.uid() = user_id);

drop policy if exists "Users can upsert own billing" on public.user_billing;
create policy "Users can upsert own billing"
  on public.user_billing for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own billing" on public.user_billing;
create policy "Users can update own billing"
  on public.user_billing for update
  using (auth.uid() = user_id);

create index if not exists user_billing_plan_key_idx on public.user_billing (plan_key);
create index if not exists user_billing_subscription_idx on public.user_billing (stripe_subscription_id);

create or replace function public.set_billing_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists user_billing_set_updated_at on public.user_billing;
create trigger user_billing_set_updated_at
  before update on public.user_billing
  for each row execute function public.set_billing_updated_at();
