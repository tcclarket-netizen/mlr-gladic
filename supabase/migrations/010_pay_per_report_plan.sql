-- Re-introduce pay-per-report billing (card on file, charge per legal/self unlock).

alter table public.user_billing
  drop constraint if exists user_billing_plan_key_check;

alter table public.user_billing
  add constraint user_billing_plan_key_check
  check (plan_key in (
    'none',
    'pay_per_report',
    'basic_i',
    'basic_ii',
    'basic_iii',
    'accuracy',
    'dispute',
    'resolute',
    'admin'
  ));

alter table public.case_product_entitlements
  add column if not exists billing_mode text
    check (billing_mode in ('subscription', 'pay_per_report')),
  add column if not exists stripe_payment_intent_id text,
  add column if not exists charged_amount_cents integer;
