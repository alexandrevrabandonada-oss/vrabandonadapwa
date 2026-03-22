create extension if not exists pgcrypto;

create table if not exists public.admin_email_allowlist (
  email text primary key,
  created_at timestamptz not null default timezone('utc', now())
);

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

create table if not exists public.memory_items (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null default '',
  body text not null default '',
  memory_type text not null default 'registro',
  memory_collection text not null default 'acervo-bruto',
  period_label text not null default 'Sem data',
  year_start integer,
  year_end integer,
  place_label text,
  source_note text,
  archive_status text not null default 'active'
    check (archive_status in ('featured', 'active', 'archived')),
  highlight_in_memory boolean not null default false,
  related_editorial_slug text,
  related_series_slug text,
  cover_image_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by text,
  updated_by text
);

create table if not exists public.memory_collections (
  slug text primary key,
  title text not null,
  description text not null default '',
  display_order integer not null default 0,
  featured boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

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

create index if not exists memory_items_collection_idx
  on public.memory_items (memory_collection, highlight_in_memory desc, year_start desc);

create index if not exists memory_items_period_idx
  on public.memory_items (period_label, year_start desc);

create index if not exists memory_items_highlight_idx
  on public.memory_items (highlight_in_memory desc, year_start desc);

create index if not exists memory_items_collection_slug_idx
  on public.memory_items (collection_slug, timeline_rank asc nulls last, year_start desc);

create index if not exists memory_items_editorial_status_idx
  on public.memory_items (editorial_status, published_at desc);

create index if not exists memory_items_timeline_rank_idx
  on public.memory_items (timeline_rank asc nulls last, year_start desc);

alter table public.memory_items enable row level security;
alter table public.memory_collections enable row level security;

drop policy if exists "public can read memory items" on public.memory_items;
create policy "public can read memory items"
  on public.memory_items
  for select
  to anon
  using (true);

drop policy if exists "authenticated admins can manage memory items" on public.memory_items;
create policy "authenticated admins can manage memory items"
  on public.memory_items
  for all
  to authenticated
  using (public.is_admin_email(auth.jwt() ->> 'email'))
  with check (public.is_admin_email(auth.jwt() ->> 'email'));

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

insert into storage.buckets (id, name, public)
values ('memory-covers', 'memory-covers', true)
on conflict (id) do update
set public = excluded.public;

drop policy if exists "public can read memory covers bucket" on storage.objects;
create policy "public can read memory covers bucket"
  on storage.objects
  for select
  to anon
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
