create table if not exists public.weekly_board_items (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null, -- 'intake', 'editorial', 'dossier', 'campaign', 'impact', 'edition'
  entity_id uuid not null,
  board_column text not null, -- 'main_front', 'radar', 'fast_publish', 'observe', 'enrich', 'pull_edition', 'pull_circulation'
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (entity_type, entity_id)
);

create table if not exists public.weekly_focus (
  id uuid primary key default gen_random_uuid(),
  focus_key text not null unique, -- 'main_front', 'current_edition', 'campaign_focus', 'share_pack', 'publish_today'
  custom_text text,
  entity_type text,
  entity_id uuid,
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists weekly_board_items_col_idx on public.weekly_board_items (board_column);

alter table public.weekly_board_items enable row level security;
alter table public.weekly_focus enable row level security;

drop policy if exists "Authenticated admins can manage weekly_board_items" on public.weekly_board_items;
create policy "Authenticated admins can manage weekly_board_items"
  on public.weekly_board_items
  for all
  to authenticated
  using (public.is_admin_email(auth.jwt() ->> 'email'))
  with check (public.is_admin_email(auth.jwt() ->> 'email'));

drop policy if exists "Authenticated admins can manage weekly_focus" on public.weekly_focus;
create policy "Authenticated admins can manage weekly_focus"
  on public.weekly_focus
  for all
  to authenticated
  using (public.is_admin_email(auth.jwt() ->> 'email'))
  with check (public.is_admin_email(auth.jwt() ->> 'email'));

-- Insert default rows for weekly_focus to easily update them
insert into public.weekly_focus (focus_key, custom_text)
values
  ('main_front', 'Nenhuma frente prioritária definida.'),
  ('current_edition', 'Nenhuma edição rolando.'),
  ('campaign_focus', 'Nenhuma campanha ativada.'),
  ('share_pack', 'Nenhum share pack prioritário.'),
  ('publish_today', '')
on conflict (focus_key) do nothing;
