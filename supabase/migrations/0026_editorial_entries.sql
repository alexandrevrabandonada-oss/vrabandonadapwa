create table if not exists public.editorial_entries (
  id uuid primary key default gen_random_uuid(),
  entry_type text not null check (entry_type in ('post', 'document', 'image')),
  entry_status text not null default 'draft' check (entry_status in ('draft', 'stored', 'ready_for_enrichment', 'published', 'archived')),
  target_surface text null check (target_surface in ('agora', 'acervo', 'memoria', 'dossie', 'campaign', 'impacto', 'edition')),
  title text not null,
  summary text null,
  details text null,
  file_url text null,
  file_path text null,
  file_name text null,
  source_label text null,
  year_label text null,
  approximate_year integer null,
  place_label text null,
  territory_label text null,
  actor_label text null,
  axis_label text null,
  notes text null,
  featured boolean not null default false,
  sort_order integer not null default 0,
  published_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by text null,
  updated_by text null
);

create index if not exists editorial_entries_status_idx on public.editorial_entries (entry_status, updated_at desc);
create index if not exists editorial_entries_type_idx on public.editorial_entries (entry_type, updated_at desc);
create index if not exists editorial_entries_surface_idx on public.editorial_entries (target_surface, updated_at desc);
create index if not exists editorial_entries_published_at_idx on public.editorial_entries (published_at desc nulls last, updated_at desc);

alter table public.editorial_entries enable row level security;

drop policy if exists "Authenticated users can manage editorial entries" on public.editorial_entries;
create policy "Authenticated users can manage editorial entries"
  on public.editorial_entries
  for all
  to authenticated
  using (true)
  with check (true);
