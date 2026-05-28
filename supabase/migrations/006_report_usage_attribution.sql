alter table public.generated_reports
  add column if not exists billing_mode_at_generation text
    check (billing_mode_at_generation in ('subscription', 'pay_per_report')),
  add column if not exists billing_plan_at_generation text
    check (billing_plan_at_generation in ('free_trial', 'pay_per_report', 'consultant', 'agency')),
  add column if not exists stripe_payment_intent_id text,
  add column if not exists charged_amount_cents integer;

create index if not exists generated_reports_billing_mode_idx
  on public.generated_reports (billing_mode_at_generation);

create index if not exists generated_reports_billing_plan_idx
  on public.generated_reports (billing_plan_at_generation);
