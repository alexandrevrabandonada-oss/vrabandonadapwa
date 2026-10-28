-- New isolated bucket; never change the legacy bucket or its objects here.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('editorial-private', 'editorial-private', false, 921600,
        array['image/jpeg','image/png','application/pdf','audio/mpeg','audio/wav','audio/ogg']);

-- Restrictive policy also protects against unrelated permissive Storage policies.
create policy "deny direct client access to private editorial documents"
on storage.objects as restrictive for all to anon, authenticated
using (bucket_id <> 'editorial-private')
with check (bucket_id <> 'editorial-private');

create table public.private_editorial_documents (
  id uuid primary key,
  capture_id uuid not null references public.universal_captures(id),
  object_path text not null unique,
  mime_type text not null,
  byte_size integer not null check (byte_size > 0 and byte_size <= 921600),
  origin text not null check (origin in ('captura', 'apuração', 'acervo')),
  purpose text not null check (purpose in ('revisão', 'referência', 'investigação')),
  created_by uuid not null,
  created_at timestamptz not null default now()
);
alter table public.private_editorial_documents enable row level security;
revoke all on public.private_editorial_documents from public, anon, authenticated;
grant select, insert on public.private_editorial_documents to service_role;

create table public.private_document_events (
  id bigint generated always as identity primary key,
  document_id uuid not null references public.private_editorial_documents(id),
  actor_id uuid not null,
  action text not null check (action in ('uploaded', 'accessed')),
  occurred_at timestamptz not null default now()
);
alter table public.private_document_events enable row level security;
revoke all on public.private_document_events from public, anon, authenticated;
grant insert on public.private_document_events to service_role;
grant usage on sequence public.private_document_events_id_seq to service_role;

create function public.record_private_document_upload() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.private_document_events(document_id, actor_id, action)
  values (new.id, new.created_by, 'uploaded');
  return new;
end $$;
revoke all on function public.record_private_document_upload() from public, anon, authenticated;
create trigger private_document_upload_event after insert on public.private_editorial_documents
for each row execute function public.record_private_document_upload();

-- No authenticated storage.objects policies are created: only the server's
-- privileged client may access the new bucket after checking an admin session.
