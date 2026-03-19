-- Security and triage layer for intake submissions.

alter table if exists public.intake_submissions
  add column if not exists source_type text,
  add column if not exists is_sensitive boolean not null default false,
  add column if not exists internal_notes text,
  add column if not exists reviewed_at timestamptz,
  add column if not exists reviewed_by text,
  add column if not exists contact_allowed boolean not null default false,
  add column if not exists safe_public_summary text;

update public.intake_submissions
set source_type = coalesce(source_type, category)
where source_type is null;

alter table if exists public.intake_submissions
  drop constraint if exists intake_submissions_status_check;

alter table public.intake_submissions
  add constraint intake_submissions_status_check
  check (status in ('new', 'reviewing', 'archived', 'published'));

create table if not exists public.admin_email_allowlist (
  email text primary key,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.admin_email_allowlist enable row level security;
alter table public.intake_submissions enable row level security;

create or replace function public.is_admin_email(p_email text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_email_allowlist
    where email = p_email
  );
$$;

grant execute on function public.is_admin_email(text) to anon, authenticated;

drop policy if exists "public can submit intake" on public.intake_submissions;
drop policy if exists "admins can read intake" on public.intake_submissions;
drop policy if exists "admins can update intake" on public.intake_submissions;

create policy "public can submit intake"
  on public.intake_submissions
  for insert
  to anon
  with check (
    category in ('denuncia', 'memoria', 'pauta', 'apoio')
    and status = 'new'
  );

create policy "admins can read intake"
  on public.intake_submissions
  for select
  to authenticated
  using (public.is_admin_email(auth.jwt() ->> 'email'));

create policy "admins can update intake"
  on public.intake_submissions
  for update
  to authenticated
  using (public.is_admin_email(auth.jwt() ->> 'email'))
  with check (public.is_admin_email(auth.jwt() ->> 'email'));
