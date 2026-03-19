create extension if not exists pgcrypto;

create table if not exists public.memory_items (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null default '',
  body text not null default '',
  memory_type text not null,
  memory_collection text not null,
  period_label text not null,
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

create index if not exists memory_items_collection_idx
  on public.memory_items (memory_collection, highlight_in_memory desc, year_start desc);

create index if not exists memory_items_period_idx
  on public.memory_items (period_label, year_start desc);

create index if not exists memory_items_highlight_idx
  on public.memory_items (highlight_in_memory desc, year_start desc);

alter table public.memory_items enable row level security;

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
