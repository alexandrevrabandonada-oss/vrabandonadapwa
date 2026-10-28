do $$ begin create role anon nologin; exception when duplicate_object then null; end $$;
do $$ begin create role authenticated nologin; exception when duplicate_object then null; end $$;
create schema auth;
create function auth.jwt() returns jsonb language sql stable as $$
  select coalesce(nullif(current_setting('request.jwt.claims', true), '')::jsonb, '{}'::jsonb)
$$;
grant usage on schema auth to anon, authenticated;
grant execute on function auth.jwt() to anon, authenticated;
create table public.admin_email_allowlist (email text primary key, created_at timestamptz default now());
insert into public.admin_email_allowlist(email) values ('admin@example.invalid');
create function public.is_admin_email(p_email text) returns boolean language sql security definer set search_path=public as $$
  select exists(select 1 from public.admin_email_allowlist where email=p_email)
$$;
grant execute on function public.is_admin_email(text) to anon, authenticated;
create table public.intake_submissions (
  id uuid primary key default gen_random_uuid(), category text not null, title text not null,
  location text, details text not null, contact text, anonymous boolean not null default false,
  status text not null default 'new', created_at timestamptz default now()
);
grant all on public.intake_submissions, public.admin_email_allowlist to anon, authenticated;
create table public.universal_captures (id uuid primary key default gen_random_uuid(), raw_text text);
insert into public.universal_captures(raw_text) values ('nota ficticia');
alter table public.universal_captures enable row level security;
grant all on public.universal_captures to anon, authenticated;
create policy "Authenticated admins can manage universal_captures" on public.universal_captures
  for all to authenticated using (public.is_admin_email(auth.jwt() ->> 'email'))
  with check (public.is_admin_email(auth.jwt() ->> 'email'));
