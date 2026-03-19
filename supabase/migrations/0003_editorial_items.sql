create table if not exists public.editorial_items (
  id uuid primary key default gen_random_uuid(),
  intake_submission_id uuid unique references public.intake_submissions(id) on delete set null,
  title text not null,
  slug text not null unique,
  excerpt text not null default '',
  body text not null default '',
  category text not null,
  neighborhood text,
  cover_image_url text,
  published boolean not null default false,
  published_at timestamptz,
  editorial_status text not null default 'draft'
    check (editorial_status in ('draft', 'ready', 'published', 'archived')),
  featured boolean not null default false,
  source_visibility_note text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by text,
  updated_by text
);

create index if not exists editorial_items_status_idx
  on public.editorial_items (editorial_status);

create index if not exists editorial_items_published_idx
  on public.editorial_items (published, published_at desc);

create index if not exists editorial_items_featured_idx
  on public.editorial_items (featured, published_at desc);

alter table public.editorial_items enable row level security;

drop policy if exists "public can read published editorial" on public.editorial_items;
drop policy if exists "admins can manage editorial" on public.editorial_items;

create policy "public can read published editorial"
  on public.editorial_items
  for select
  to anon
  using (published = true and editorial_status = 'published');

create policy "authenticated admins can manage editorial"
  on public.editorial_items
  for all
  to authenticated
  using (public.is_admin_email(auth.jwt() ->> 'email'))
  with check (public.is_admin_email(auth.jwt() ->> 'email'));
