create table if not exists public.universal_captures (
  id uuid primary key default gen_random_uuid(),
  title text,
  raw_text text,
  file_url text,
  file_type text check (file_type in ('image', 'pdf', 'document', 'audio', 'video', 'other')),
  suggested_type text, -- 'post', 'doc', 'photo', etc. (calculated at insert or on client)
  status text not null default 'inbox' check (status in ('inbox', 'archived', 'published', 'enriched', 'discarded')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by text,
  updated_by text
);

create index if not exists universal_captures_status_idx on public.universal_captures (status, created_at desc);

alter table public.universal_captures enable row level security;

drop policy if exists "Authenticated admins can manage universal_captures" on public.universal_captures;
create policy "Authenticated admins can manage universal_captures"
  on public.universal_captures
  for all
  to authenticated
  using (public.is_admin_email(auth.jwt() ->> 'email'))
  with check (public.is_admin_email(auth.jwt() ->> 'email'));

-- Also create a generic bucket for rapid intake if it doesn't exist
insert into storage.buckets (id, name, public) 
values ('universal_captures', 'universal_captures', true)
on conflict (id) do nothing;

drop policy if exists "Admins can upload to universal captures" on storage.objects;
create policy "Admins can upload to universal captures"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'universal_captures' and public.is_admin_email(auth.jwt() ->> 'email'));

drop policy if exists "Public universally readable captures" on storage.objects;
create policy "Public universally readable captures"
  on storage.objects for select to public
  using (bucket_id = 'universal_captures');
