create extension if not exists pgcrypto;

alter table public.editorial_items
  add column if not exists series_slug text,
  add column if not exists series_title text,
  add column if not exists primary_tag text,
  add column if not exists secondary_tags text[] not null default '{}'::text[],
  add column if not exists reading_time integer not null default 5,
  add column if not exists featured_order integer,
  add column if not exists cover_variant text not null default 'concrete';

alter table public.editorial_items
  drop constraint if exists editorial_items_cover_variant_check;

alter table public.editorial_items
  add constraint editorial_items_cover_variant_check
  check (cover_variant in ('steel', 'ember', 'concrete', 'night'));

update public.editorial_items
set
  primary_tag = coalesce(primary_tag, category),
  secondary_tags = case
    when array_length(secondary_tags, 1) is null or array_length(secondary_tags, 1) = 0
      then array[coalesce(primary_tag, category)]
    else secondary_tags
  end,
  reading_time = coalesce(reading_time, 5),
  cover_variant = coalesce(cover_variant, 'concrete')
where primary_tag is null
   or array_length(secondary_tags, 1) is null
   or reading_time is null
   or cover_variant is null;

create index if not exists editorial_items_series_slug_idx
  on public.editorial_items (series_slug, featured_order, published_at desc);

create index if not exists editorial_items_primary_tag_idx
  on public.editorial_items (primary_tag, published_at desc);

create index if not exists editorial_items_featured_order_idx
  on public.editorial_items (featured_order asc nulls last, published_at desc);
