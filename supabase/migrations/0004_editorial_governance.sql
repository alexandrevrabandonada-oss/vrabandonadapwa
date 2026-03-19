create extension if not exists pgcrypto;

alter table public.editorial_items
  add column if not exists review_status text not null default 'pending',
  add column if not exists publication_reason text,
  add column if not exists sensitivity_check_passed boolean not null default false,
  add column if not exists fact_check_note text,
  add column if not exists last_reviewed_at timestamptz,
  add column if not exists last_reviewed_by text,
  add column if not exists published_by text,
  add column if not exists archived_reason text;

alter table public.editorial_items
  drop constraint if exists editorial_items_editorial_status_check;

alter table public.editorial_items
  add constraint editorial_items_editorial_status_check
  check (editorial_status in ('draft', 'in_review', 'ready', 'published', 'archived'));

update public.editorial_items
set
  review_status = case when published = true then 'reviewed' else review_status end,
  last_reviewed_at = coalesce(last_reviewed_at, updated_at),
  last_reviewed_by = coalesce(last_reviewed_by, updated_by),
  published_by = case when published = true then coalesce(published_by, updated_by, created_by) else published_by end
where published = true;

create table if not exists public.editorial_audit_log (
  id uuid primary key default gen_random_uuid(),
  editorial_item_id uuid not null references public.editorial_items(id) on delete cascade,
  actor_email text,
  event_type text not null check (event_type in (
    'draft_created',
    'content_updated',
    'sent_to_review',
    'returned_to_draft',
    'published',
    'unpublished',
    'archived'
  )),
  from_status text,
  to_status text,
  note text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists editorial_audit_log_item_idx
  on public.editorial_audit_log (editorial_item_id, created_at desc);

alter table public.editorial_audit_log enable row level security;

drop policy if exists "authenticated admins can manage editorial audit" on public.editorial_audit_log;

create policy "authenticated admins can manage editorial audit"
  on public.editorial_audit_log
  for all
  to authenticated
  using (public.is_admin_email(auth.jwt() ->> 'email'))
  with check (public.is_admin_email(auth.jwt() ->> 'email'));
