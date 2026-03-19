create table if not exists public.archive_collections (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  description text,
  cover_image_url text,
  public_visibility boolean not null default true,
  featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by text,
  updated_by text
);

alter table public.archive_assets
  add column if not exists collection_slug text;

create index if not exists archive_assets_collection_slug_idx
  on public.archive_assets (collection_slug);

alter table public.archive_assets
  drop constraint if exists archive_assets_collection_slug_fkey;

alter table public.archive_assets
  add constraint archive_assets_collection_slug_fkey
  foreign key (collection_slug) references public.archive_collections (slug)
  on update cascade
  on delete set null;

alter table public.archive_collections enable row level security;

drop policy if exists "Public can read public archive collections" on public.archive_collections;`r`n`r`ncreate policy "Public can read public archive collections"
  on public.archive_collections
  for select
  using (public_visibility = true);

drop policy if exists "Authenticated users can manage archive collections" on public.archive_collections;`r`n`r`ncreate policy "Authenticated users can manage archive collections"
  on public.archive_collections
  for all
  to authenticated
  using (true)
  with check (true);

