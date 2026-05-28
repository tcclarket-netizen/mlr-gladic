alter table public.user_billing
  add column if not exists stripe_default_payment_method_id text,
  add column if not exists reports_charged_count integer not null default 0;

create index if not exists user_billing_default_pm_idx on public.user_billing (stripe_default_payment_method_id);
