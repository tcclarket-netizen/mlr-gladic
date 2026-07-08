-- County of residence for self-report / court caption fields
alter table public.cases
  add column if not exists county text;
