create extension if not exists pgcrypto;

create table if not exists public.archive_assets (
  id uuid primary key default gen_random_uuid(),
  memory_item_id uuid references public.memory_items(id) on delete set null,
  editorial_item_id uuid references public.editorial_items(id) on delete set null,
  title text not null,
  asset_type text not null default 'other'
    check (asset_type in ('photo', 'scan', 'newspaper', 'document', 'pdf', 'audio', 'other')),
  file_url text not null,
  file_path text not null,
  thumb_url text,
  thumb_path text,
  source_label text not null default '',
  source_date_label text not null default '',
  approximate_year integer,
  place_label text,
  rights_note text,
  description text,
  public_visibility boolean not null default false,
  featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by text,
  updated_by text
);

create index if not exists archive_assets_memory_item_idx
  on public.archive_assets (memory_item_id, public_visibility desc, featured desc, sort_order asc, created_at desc);

create index if not exists archive_assets_editorial_item_idx
  on public.archive_assets (editorial_item_id, public_visibility desc, featured desc, sort_order asc, created_at desc);

create index if not exists archive_assets_visibility_idx
  on public.archive_assets (public_visibility, featured desc, sort_order asc, created_at desc);

alter table public.archive_assets enable row level security;

drop policy if exists "public can read archive assets" on public.archive_assets;
create policy "public can read archive assets"
  on public.archive_assets
  for select
  to anon
  using (public_visibility = true);

drop policy if exists "authenticated admins can manage archive assets" on public.archive_assets;
create policy "authenticated admins can manage archive assets"
  on public.archive_assets
  for all
  to authenticated
  using (public.is_admin_email(auth.jwt() ->> 'email'))
  with check (public.is_admin_email(auth.jwt() ->> 'email'));

insert into storage.buckets (id, name, public)
values ('archive-assets', 'archive-assets', true)
on conflict (id) do update
set public = excluded.public;

alter table storage.objects enable row level security;

drop policy if exists "public can read archive assets bucket" on storage.objects;
create policy "public can read archive assets bucket"
  on storage.objects
  for select
  to anon
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
