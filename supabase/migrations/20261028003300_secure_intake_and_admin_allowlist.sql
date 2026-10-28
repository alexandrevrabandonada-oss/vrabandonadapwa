-- Protect the existing allowlist and intake data without changing stored rows.
-- The existing SECURITY DEFINER is_admin_email function is owned by postgres;
-- it continues to check the allowlist for server-side and RLS authorization.
begin;

alter table public.admin_email_allowlist enable row level security;
revoke all on table public.admin_email_allowlist from public, anon, authenticated;

alter table public.intake_submissions enable row level security;
revoke all on table public.intake_submissions from public, anon, authenticated;
grant insert on table public.intake_submissions to anon, authenticated;
grant select, update on table public.intake_submissions to authenticated;

drop policy if exists "public can submit intake" on public.intake_submissions;
drop policy if exists "admins can read intake" on public.intake_submissions;
drop policy if exists "admins can update intake" on public.intake_submissions;

create policy "public can submit intake" on public.intake_submissions
  for insert to anon, authenticated
  with check (category in ('denuncia', 'memoria', 'pauta', 'apoio') and status = 'new');

create policy "admins can read intake" on public.intake_submissions
  for select to authenticated
  using (public.is_admin_email(auth.jwt() ->> 'email'));

create policy "admins can update intake" on public.intake_submissions
  for update to authenticated
  using (public.is_admin_email(auth.jwt() ->> 'email'))
  with check (public.is_admin_email(auth.jwt() ->> 'email'));

commit;
