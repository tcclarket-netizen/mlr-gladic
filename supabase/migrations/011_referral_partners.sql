-- Partner referral program: partners, user attribution, billing ledger for admin reporting.

create table if not exists public.referral_partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null,
  contact_email text,
  notes text,
  -- Partner share of attributed revenue (0–100).
  commission_percent numeric(5, 2) not null default 0
    check (commission_percent >= 0 and commission_percent <= 100),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint referral_partners_code_format check (code ~ '^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$' or code ~ '^[a-z0-9]{1,2}$')
);

create unique index if not exists referral_partners_code_lower_idx
  on public.referral_partners (lower(code));

create table if not exists public.user_referrals (
  user_id uuid primary key references auth.users (id) on delete cascade,
  partner_id uuid not null references public.referral_partners (id) on delete restrict,
  referral_code text not null,
  attributed_at timestamptz not null default now()
);

create index if not exists user_referrals_partner_id_idx
  on public.user_referrals (partner_id);

create table if not exists public.billing_ledger_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  partner_id uuid references public.referral_partners (id) on delete set null,
  entry_type text not null check (entry_type in ('subscription', 'pay_per_report', 'other')),
  amount_cents integer not null default 0 check (amount_cents >= 0),
  currency text not null default 'usd',
  description text,
  stripe_reference_id text,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create unique index if not exists billing_ledger_stripe_reference_idx
  on public.billing_ledger_entries (stripe_reference_id)
  where stripe_reference_id is not null;

create index if not exists billing_ledger_partner_occurred_idx
  on public.billing_ledger_entries (partner_id, occurred_at desc);

create index if not exists billing_ledger_user_occurred_idx
  on public.billing_ledger_entries (user_id, occurred_at desc);

grant select, insert, update, delete on public.referral_partners to service_role;
grant select, insert, update, delete on public.user_referrals to service_role;
grant select, insert, update, delete on public.billing_ledger_entries to service_role;

alter table public.referral_partners enable row level security;
alter table public.user_referrals enable row level security;
alter table public.billing_ledger_entries enable row level security;
