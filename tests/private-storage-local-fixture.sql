create table public.admin_email_allowlist (email text primary key);
insert into public.admin_email_allowlist values ('vr-admin@example.com');
alter table public.admin_email_allowlist enable row level security;
revoke all on public.admin_email_allowlist from public,anon,authenticated;
create function public.is_admin_email(p_email text) returns boolean language sql security definer set search_path=public as $$ select exists(select 1 from public.admin_email_allowlist where email=p_email) $$;
grant execute on function public.is_admin_email(text) to anon,authenticated;
create table public.universal_captures (id uuid primary key, raw_text text);
alter table public.universal_captures enable row level security;
grant select,insert on public.universal_captures to authenticated;
create policy "test admins" on public.universal_captures for all to authenticated using (public.is_admin_email(auth.jwt()->>'email')) with check (public.is_admin_email(auth.jwt()->>'email'));
insert into public.universal_captures values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','fixture');

