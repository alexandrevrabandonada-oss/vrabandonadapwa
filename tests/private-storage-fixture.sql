do $$ begin create role service_role nologin bypassrls; exception when duplicate_object then null; end $$;
create schema storage;
create table storage.buckets (id text primary key, name text not null, public boolean not null, file_size_limit bigint, allowed_mime_types text[]);
create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text not null, name text not null);
alter table storage.objects enable row level security;
grant usage on schema storage to anon, authenticated, service_role;
grant all on storage.objects to anon, authenticated, service_role;
create policy "simulated broad legacy policy" on storage.objects for all to anon, authenticated using (true) with check (true);
insert into public.universal_captures(id,raw_text) values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','fixture');
