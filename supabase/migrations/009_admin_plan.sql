-- Allow internal admin unlimited plan (no Stripe).

alter table public.user_billing
  drop constraint if exists user_billing_plan_key_check;

alter table public.user_billing
  add constraint user_billing_plan_key_check
  check (plan_key in (
    'none',
    'basic_i',
    'basic_ii',
    'basic_iii',
    'accuracy',
    'dispute',
    'resolute',
    'admin'
  ));
