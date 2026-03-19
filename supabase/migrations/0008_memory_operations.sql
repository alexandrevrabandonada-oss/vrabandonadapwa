create extension if not exists pgcrypto;

create table if not exists public.memory_collections (
  slug text primary key,
  title text not null,
  description text not null default '',
  display_order integer not null default 0,
  featured boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.memory_collections enable row level security;

drop policy if exists "public can read memory collections" on public.memory_collections;
create policy "public can read memory collections"
  on public.memory_collections
  for select
  to anon
  using (true);

drop policy if exists "authenticated admins can manage memory collections" on public.memory_collections;
create policy "authenticated admins can manage memory collections"
  on public.memory_collections
  for all
  to authenticated
  using (public.is_admin_email(auth.jwt() ->> 'email'))
  with check (public.is_admin_email(auth.jwt() ->> 'email'));

alter table public.memory_items
  add column if not exists collection_slug text,
  add column if not exists collection_title text,
  add column if not exists editorial_status text not null default 'draft',
  add column if not exists published boolean not null default false,
  add column if not exists published_at timestamptz,
  add column if not exists featured boolean not null default false,
  add column if not exists timeline_rank integer,
  add column if not exists cover_image_path text;

alter table public.memory_items
  drop constraint if exists memory_items_editorial_status_check;

alter table public.memory_items
  add constraint memory_items_editorial_status_check
  check (editorial_status in ('draft', 'ready', 'published', 'archived'));

update public.memory_items
set
  collection_slug = coalesce(collection_slug, memory_collection),
  collection_title = coalesce(collection_title, memory_collection),
  editorial_status = case
    when published = true then 'published'
    when editorial_status not in ('draft', 'ready', 'published', 'archived') then 'draft'
    else editorial_status
  end,
  featured = coalesce(featured, highlight_in_memory),
  published_at = case when published = true then coalesce(published_at, updated_at) else published_at end
where collection_slug is null
   or collection_title is null
   or published is null
   or editorial_status is null;

create index if not exists memory_items_collection_slug_idx
  on public.memory_items (collection_slug, timeline_rank asc nulls last, year_start desc);

create index if not exists memory_items_editorial_status_idx
  on public.memory_items (editorial_status, published_at desc);

create index if not exists memory_items_timeline_rank_idx
  on public.memory_items (timeline_rank asc nulls last, year_start desc);

insert into storage.buckets (id, name, public)
values ('memory-covers', 'memory-covers', true)
on conflict (id) do update
set public = excluded.public;

alter table storage.objects enable row level security;

drop policy if exists "public can read memory covers" on storage.objects;
create policy "public can read memory covers"
  on storage.objects
  for select
  to anon
  using (bucket_id = 'memory-covers');

drop policy if exists "authenticated admins can manage memory covers" on storage.objects;
create policy "authenticated admins can manage memory covers"
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
