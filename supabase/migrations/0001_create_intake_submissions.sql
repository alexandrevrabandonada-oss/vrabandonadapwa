create table if not exists public.intake_submissions (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  title text not null,
  location text,
  details text not null,
  contact text,
  anonymous boolean not null default false,
  status text not null default 'new',
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists intake_submissions_created_at_idx
  on public.intake_submissions (created_at desc);

create index if not exists intake_submissions_status_idx
  on public.intake_submissions (status);
