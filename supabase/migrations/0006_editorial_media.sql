create extension if not exists pgcrypto;

alter table public.editorial_items
  add column if not exists cover_image_path text;

insert into storage.buckets (id, name, public)
values ('editorial-covers', 'editorial-covers', true)
on conflict (id) do update
set public = excluded.public;

alter table storage.objects enable row level security;

drop policy if exists "public can read editorial covers" on storage.objects;
create policy "public can read editorial covers"
  on storage.objects
  for select
  to anon
  using (bucket_id = 'editorial-covers');

drop policy if exists "authenticated admins can manage editorial covers" on storage.objects;
create policy "authenticated admins can manage editorial covers"
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
