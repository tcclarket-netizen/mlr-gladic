-- Add commission % for partners created before this column existed.

alter table public.referral_partners
  add column if not exists commission_percent numeric(5, 2) not null default 0;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'referral_partners_commission_percent_check'
  ) then
    alter table public.referral_partners
      add constraint referral_partners_commission_percent_check
      check (commission_percent >= 0 and commission_percent <= 100);
  end if;
end $$;
