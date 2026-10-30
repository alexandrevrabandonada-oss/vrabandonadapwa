-- V8.2 / PROPOSTA DE DDL SOMENTE PARA STAGING ISOLADO.
-- NÃO É MIGRAÇÃO DE PRODUÇÃO. NÃO colocar em supabase/migrations.
-- Pré-condição: Supabase de testes separado, sem dados/copias de denúncias,
-- sessão revisada e a confirmação manual:
--   SET vrabandonada.editorial_staging_approved = 'yes';
-- A confirmação acima NÃO prova o destino. Verificar URL/projeto antes.
-- Requer execução por dono do schema em transação. Falha caso já existam tabelas.
-- Zero INSERTs/seeds. Sem GRANT de escrita a anon/authenticated.
begin;

do $guard$
begin
  if current_setting('vrabandonada.editorial_staging_approved', true) is distinct from 'yes' then
    raise exception 'V8.2 bloqueado: confirme staging isolado e a sessão antes de qualquer DDL';
  end if;
end;
$guard$;

create table public.investigation_dossiers (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) >= 5),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  excerpt text,
  description text,
  status text not null default 'draft'
    check (status in ('draft', 'in_progress', 'monitoring', 'concluded', 'archived')),
  cover_image_url text,
  featured boolean not null default false,
  public_visibility boolean not null default false,
  sort_order integer not null default 0 check (sort_order >= 0),
  lead_question text,
  period_label text,
  territory_label text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by text,
  updated_by text
);

create table public.investigation_dossier_links (
  id uuid primary key default gen_random_uuid(),
  dossier_id uuid not null references public.investigation_dossiers (id) on delete cascade,
  link_type text not null check (link_type in (
    'editorial','materia','memory','archive','collection','series'
  )),
  link_key text not null check (length(trim(link_key)) > 0),
  link_role text not null default 'context'
    check (link_role in ('lead','evidence','context','followup','archive')),
  timeline_year integer check (timeline_year between 1800 and 2100),
  timeline_label text,
  timeline_note text,
  featured boolean not null default false,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (dossier_id, link_type, link_key),
  constraint dossier_git_slug_check check (
    link_type <> 'materia' or link_key ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
  )
);

create table public.investigation_dossier_updates (
  id uuid primary key default gen_random_uuid(),
  dossier_id uuid not null references public.investigation_dossiers (id) on delete cascade,
  title text not null check (length(trim(title)) > 0),
  slug text,
  excerpt text,
  body text not null,
  update_type text not null default 'note'
    check (update_type in ('development','evidence','monitoring','note','call','correction')),
  published boolean not null default false,
  published_at timestamptz,
  featured boolean not null default false,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by text,
  updated_by text,
  unique (dossier_id, slug),
  constraint dossier_update_date_check check (not published or published_at is not null)
);

create table public.place_hubs (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) >= 3),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  excerpt text,
  description text,
  lead_question text,
  place_type text not null default 'outro'
    check (place_type in (
      'bairro','escola','hospital','usina','rua','praca','predio',
      'unidade_publica','ponto_critico','memorial','outro'
    )),
  parent_place_slug text,
  territory_label text,
  address_label text,
  latitude numeric(10,7) check (latitude between -90 and 90),
  longitude numeric(10,7) check (longitude between -180 and 180),
  cover_image_url text,
  featured boolean not null default false,
  public_visibility boolean not null default false,
  status text not null default 'draft'
    check (status in ('active','monitoring','archive','draft')),
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by text,
  updated_by text
);

create table public.place_hub_links (
  id uuid primary key default gen_random_uuid(),
  place_hub_id uuid not null references public.place_hubs (id) on delete cascade,
  link_type text not null check (link_type in (
    'editorial','materia','memory','archive','collection','dossier',
    'campaign','impact','hub','page','external'
  )),
  link_key text not null check (length(trim(link_key)) > 0),
  link_role text not null default 'context'
    check (link_role in ('lead','evidence','context','followup','archive')),
  timeline_year integer check (timeline_year between 1800 and 2100),
  timeline_label text,
  timeline_note text,
  featured boolean not null default false,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (place_hub_id, link_type, link_key, link_role),
  constraint hub_git_slug_check check (
    link_type <> 'materia' or link_key ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
  )
);

create index investigation_dossiers_public_idx on public.investigation_dossiers
  (public_visibility, status, featured, sort_order);
create index dossier_links_parent_idx on public.investigation_dossier_links
  (dossier_id, featured, timeline_year, sort_order, created_at);
create index dossier_updates_parent_idx on public.investigation_dossier_updates
  (dossier_id, published, featured, published_at desc, sort_order);
create index place_hubs_public_idx on public.place_hubs
  (public_visibility, status, featured, sort_order);
create index place_hub_links_parent_idx on public.place_hub_links
  (place_hub_id, featured, timeline_year, sort_order, created_at);

alter table public.investigation_dossiers enable row level security;
alter table public.investigation_dossier_links enable row level security;
alter table public.investigation_dossier_updates enable row level security;
alter table public.place_hubs enable row level security;
alter table public.place_hub_links enable row level security;

-- O Supabase pode conceder TODOS os privilégios por default no schema public.
-- Revogar explicitamente também INSERT/UPDATE/DELETE/TRUNCATE/REFERENCES/TRIGGER.
revoke all on table
  public.investigation_dossiers,
  public.investigation_dossier_links,
  public.investigation_dossier_updates,
  public.place_hubs,
  public.place_hub_links
from public, anon, authenticated;

grant select on table
  public.investigation_dossiers,
  public.investigation_dossier_links,
  public.investigation_dossier_updates,
  public.place_hubs,
  public.place_hub_links
to anon, authenticated;

-- Sem políticas de escrita: editor autenticado não pode gravar até a
-- etapa separada de identidade editorial e controle de propriedade/autorização.
create policy dossier_public_select on public.investigation_dossiers
  for select to anon, authenticated
  using (public_visibility = true and status <> 'draft');

create policy dossier_link_public_select on public.investigation_dossier_links
  for select to anon, authenticated
  using (exists (
    select 1 from public.investigation_dossiers parent
    where parent.id = investigation_dossier_links.dossier_id
      and parent.public_visibility = true and parent.status <> 'draft'
  ));

create policy dossier_update_public_select on public.investigation_dossier_updates
  for select to anon, authenticated
  using (published = true and exists (
    select 1 from public.investigation_dossiers parent
    where parent.id = investigation_dossier_updates.dossier_id
      and parent.public_visibility = true and parent.status <> 'draft'
  ));

create policy hub_public_select on public.place_hubs
  for select to anon, authenticated
  using (public_visibility = true and status <> 'draft');

create policy hub_link_public_select on public.place_hub_links
  for select to anon, authenticated
  using (exists (
    select 1 from public.place_hubs parent
    where parent.id = place_hub_links.place_hub_id
      and parent.public_visibility = true and parent.status <> 'draft'
  ));

commit;
