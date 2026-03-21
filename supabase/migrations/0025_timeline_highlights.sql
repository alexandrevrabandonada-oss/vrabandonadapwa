create extension if not exists pgcrypto;

create table if not exists public.timeline_highlights (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  description text,
  highlight_type text not null default 'investigation_marker' check (highlight_type in ('origin', 'rupture', 'recurrence', 'consequence', 'turning_point', 'archive_marker', 'investigation_marker')),
  date_label text,
  year_start integer,
  year_end integer,
  period_label text,
  lead_question text,
  cover_image_url text,
  featured boolean not null default false,
  public_visibility boolean not null default true,
  status text not null default 'draft' check (status in ('draft', 'active', 'monitoring', 'archive')),
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by text,
  updated_by text
);

create table if not exists public.timeline_highlight_links (
  id uuid primary key default gen_random_uuid(),
  timeline_highlight_id uuid not null references public.timeline_highlights (id) on delete cascade,
  link_type text not null check (link_type in ('editorial', 'memory', 'archive', 'collection', 'dossier', 'dossier_update', 'campaign', 'impact', 'hub', 'territory', 'actor', 'pattern', 'edition', 'page', 'external')),
  link_key text not null,
  link_role text not null default 'context' check (link_role in ('lead', 'evidence', 'context', 'followup', 'archive')),
  timeline_year integer,
  timeline_label text,
  timeline_note text,
  featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists timeline_highlights_slug_idx on public.timeline_highlights (slug);
create index if not exists timeline_highlights_public_visibility_idx on public.timeline_highlights (public_visibility);
create index if not exists timeline_highlights_status_idx on public.timeline_highlights (status);
create index if not exists timeline_highlights_featured_idx on public.timeline_highlights (featured);
create index if not exists timeline_highlights_sort_order_idx on public.timeline_highlights (sort_order);
create index if not exists timeline_highlights_year_start_idx on public.timeline_highlights (year_start desc);
create index if not exists timeline_highlight_links_highlight_id_idx on public.timeline_highlight_links (timeline_highlight_id);
create index if not exists timeline_highlight_links_sort_order_idx on public.timeline_highlight_links (sort_order);
create unique index if not exists timeline_highlight_links_unique_idx on public.timeline_highlight_links (timeline_highlight_id, link_type, link_key, link_role, sort_order);

create or replace function public.set_timeline_highlights_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create trigger timeline_highlights_set_updated_at
before update on public.timeline_highlights
for each row
execute function public.set_timeline_highlights_updated_at();

create or replace function public.set_timeline_highlight_links_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create trigger timeline_highlight_links_set_updated_at
before update on public.timeline_highlight_links
for each row
execute function public.set_timeline_highlight_links_updated_at();

alter table public.timeline_highlights enable row level security;
alter table public.timeline_highlight_links enable row level security;

drop policy if exists "Public timeline highlights are visible when published" on public.timeline_highlights;
create policy "Public timeline highlights are visible when published"
  on public.timeline_highlights
  for select
  using (public_visibility = true and status <> 'draft');

drop policy if exists "Authenticated users can manage timeline highlights" on public.timeline_highlights;
create policy "Authenticated users can manage timeline highlights"
  on public.timeline_highlights
  for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Public timeline highlight links are visible when highlight is public" on public.timeline_highlight_links;
create policy "Public timeline highlight links are visible when highlight is public"
  on public.timeline_highlight_links
  for select
  using (
    exists (
      select 1
      from public.timeline_highlights highlight
      where highlight.id = timeline_highlight_id
        and highlight.public_visibility = true
        and highlight.status <> 'draft'
    )
  );

drop policy if exists "Authenticated users can manage timeline highlight links" on public.timeline_highlight_links;
create policy "Authenticated users can manage timeline highlight links"
  on public.timeline_highlight_links
  for all
  to authenticated
  using (true)
  with check (true);
