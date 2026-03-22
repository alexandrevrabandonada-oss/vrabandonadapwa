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

insert into storage.buckets (id, name, public)
values
  ('archive-assets', 'archive-assets', true),
  ('editorial-covers', 'editorial-covers', true),
  ('memory-covers', 'memory-covers', true),
  ('universal_captures', 'universal_captures', true)
on conflict (id) do nothing;

drop policy if exists "public can read archive assets bucket" on storage.objects;
create policy "public can read archive assets bucket"
  on storage.objects
  for select
  to public
  using (bucket_id = 'archive-assets');

drop policy if exists "authenticated admins can manage archive assets bucket" on storage.objects;
create policy "authenticated admins can manage archive assets bucket"
  on storage.objects
  for all
  to authenticated
  using (
    bucket_id = 'archive-assets'
    and public.is_admin_email(auth.jwt() ->> 'email')
  )
  with check (
    bucket_id = 'archive-assets'
    and public.is_admin_email(auth.jwt() ->> 'email')
  );

drop policy if exists "public can read editorial covers bucket" on storage.objects;
create policy "public can read editorial covers bucket"
  on storage.objects
  for select
  to public
  using (bucket_id = 'editorial-covers');

drop policy if exists "authenticated admins can manage editorial covers bucket" on storage.objects;
create policy "authenticated admins can manage editorial covers bucket"
  on storage.objects
  for all
  to authenticated
  using (
    bucket_id = 'editorial-covers'
    and public.is_admin_email(auth.jwt() ->> 'email')
  )
  with check (
    bucket_id = 'editorial-covers'
    and public.is_admin_email(auth.jwt() ->> 'email')
  );

drop policy if exists "public can read memory covers bucket" on storage.objects;
create policy "public can read memory covers bucket"
  on storage.objects
  for select
  to public
  using (bucket_id = 'memory-covers');

drop policy if exists "authenticated admins can manage memory covers bucket" on storage.objects;
create policy "authenticated admins can manage memory covers bucket"
  on storage.objects
  for all
  to authenticated
  using (
    bucket_id = 'memory-covers'
    and public.is_admin_email(auth.jwt() ->> 'email')
  )
  with check (
    bucket_id = 'memory-covers'
    and public.is_admin_email(auth.jwt() ->> 'email')
  );

drop policy if exists "Admins can upload to universal captures" on storage.objects;
create policy "Admins can upload to universal captures"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'universal_captures'
    and public.is_admin_email(auth.jwt() ->> 'email')
  );

drop policy if exists "Public universally readable captures" on storage.objects;
create policy "Public universally readable captures"
  on storage.objects
  for select
  to public
  using (bucket_id = 'universal_captures');

drop policy if exists "Admins can manage universal captures" on storage.objects;
create policy "Admins can manage universal captures"
  on storage.objects
  for all
  to authenticated
  using (
    bucket_id = 'universal_captures'
    and public.is_admin_email(auth.jwt() ->> 'email')
  )
  with check (
    bucket_id = 'universal_captures'
    and public.is_admin_email(auth.jwt() ->> 'email')
  );
