create extension if not exists pgcrypto;

create table if not exists public.place_hubs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  description text,
  lead_question text,
  place_type text not null default 'outro'
    check (place_type in (
      'bairro',
      'escola',
      'hospital',
      'usina',
      'rua',
      'praca',
      'predio',
      'unidade_publica',
      'ponto_critico',
      'memorial',
      'outro'
    )),
  parent_place_slug text,
  territory_label text,
  address_label text,
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  cover_image_url text,
  featured boolean not null default false,
  public_visibility boolean not null default false,
  status text not null default 'draft'
    check (status in ('active', 'monitoring', 'archive', 'draft')),
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by text,
  updated_by text
);

create table if not exists public.place_hub_links (
  id uuid primary key default gen_random_uuid(),
  place_hub_id uuid not null references public.place_hubs(id) on delete cascade,
  link_type text not null
    check (link_type in ('editorial', 'memory', 'archive', 'collection', 'dossier', 'campaign', 'impact', 'hub', 'page', 'external')),
  link_key text not null,
  link_role text not null default 'context'
    check (link_role in ('lead', 'evidence', 'context', 'followup', 'archive')),
  timeline_year integer,
  timeline_label text,
  timeline_note text,
  featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists place_hub_links_unique_idx
  on public.place_hub_links (place_hub_id, link_type, link_key, link_role);

create index if not exists place_hubs_public_visibility_idx
  on public.place_hubs (public_visibility, status, featured, sort_order);

create index if not exists place_hubs_slug_idx
  on public.place_hubs (slug);

create index if not exists place_hub_links_place_hub_id_idx
  on public.place_hub_links (place_hub_id, featured, sort_order);

alter table public.place_hubs enable row level security;
alter table public.place_hub_links enable row level security;

drop policy if exists "place_hubs_public_read" on public.place_hubs;
create policy "place_hubs_public_read"
  on public.place_hubs
  for select
  using (public_visibility = true and status <> 'draft');

drop policy if exists "place_hubs_admin_all" on public.place_hubs;
create policy "place_hubs_admin_all"
  on public.place_hubs
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "place_hub_links_public_read" on public.place_hub_links;
create policy "place_hub_links_public_read"
  on public.place_hub_links
  for select
  using (
    exists (
      select 1
      from public.place_hubs place_hub
      where place_hub.id = place_hub_links.place_hub_id
        and place_hub.public_visibility = true
        and place_hub.status <> 'draft'
    )
  );

drop policy if exists "place_hub_links_admin_all" on public.place_hub_links;
create policy "place_hub_links_admin_all"
  on public.place_hub_links
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

insert into public.place_hubs (
  title,
  slug,
  excerpt,
  description,
  lead_question,
  place_type,
  parent_place_slug,
  territory_label,
  address_label,
  cover_image_url,
  featured,
  public_visibility,
  status,
  sort_order,
  created_at,
  updated_at
) values
  (
    'Cidade operária',
    'cidade-operaria',
    'Bairro e memória de origem da cidade do trabalho.',
    'Cidade operária funciona como porta de entrada para entender como a cidade foi moldada entre fábrica, bairro e conflito público.',
    'Como o bairro operário ainda organiza a cidade de hoje?',
    'bairro',
    null,
    'Vila Santa Cecília',
    'Volta Redonda, RJ',
    '/archive/assets/acervo-foto-oficina.svg',
    true,
    true,
    'active',
    1,
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    'CSN e entorno',
    'csn-e-entorno',
    'Usina e zona crítica para ler ar, fumaça e custo ambiental.',
    'O entorno da CSN ajuda a entender como indústria, bairro e saúde pública continuam acoplados no cotidiano da cidade.',
    'Quem respira o custo do entorno industrial?',
    'usina',
    null,
    'Cidade e entorno industrial',
    'Volta Redonda, RJ',
    '/archive/assets/acervo-recorte-jornal.svg',
    true,
    true,
    'monitoring',
    2,
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    'Hospital São João Batista',
    'hospital-sao-joao-batista',
    'Equipamento público onde saúde, fila e desgaste ganham forma concreta.',
    'O hospital organiza uma parte importante da leitura sobre saúde, atendimento e consequências do trabalho e do ambiente na vida urbana.',
    'O que a cidade joga para dentro da fila do hospital?',
    'hospital',
    'cidade-operaria',
    'Cidade do trabalho',
    'Volta Redonda, RJ',
    '/archive/assets/acervo-relatorio.svg',
    false,
    true,
    'active',
    3,
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    'Rodoviária Nova',
    'rodoviaria-nova',
    'Ponto de circulação e espera onde a cidade mostra sua fricção cotidiana.',
    'O terminal funciona como lugar de passagem, atraso e disputa por mobilidade, conectando abandono urbano e tempo roubado.',
    'Quem paga o tempo da espera?',
    'ponto_critico',
    'cidade-operaria',
    'Cidade em circulação',
    'Volta Redonda, RJ',
    '/archive/assets/acervo-mapa.svg',
    true,
    true,
    'monitoring',
    4,
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    'Praça Sávio Gama',
    'praca-savio-gama',
    'Marco urbano onde memória, circulação e apagamento se encontram.',
    'A praça ajuda a ler como centro, comércio e requalificação urbana reescrevem a paisagem da cidade e seus marcos públicos.',
    'O que some quando o centro é refeito?',
    'praca',
    null,
    'Centro de Volta Redonda',
    'Volta Redonda, RJ',
    '/archive/assets/acervo-mapa.svg',
    false,
    true,
    'archive',
    5,
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    'Vila Santa Cecília',
    'vila-santa-cecilia',
    'Lugar onde o bairro operário ainda organiza o mapa afetivo da cidade.',
    'A Vila ajuda a conectar arquitetura, trabalho, memória e vida de rua num mesmo percurso editorial.',
    'O bairro ainda dita o ritmo da cidade?',
    'bairro',
    'cidade-operaria',
    'Cidade operária',
    'Volta Redonda, RJ',
    '/archive/assets/acervo-foto-oficina.svg',
    false,
    true,
    'active',
    6,
    timezone('utc', now()),
    timezone('utc', now())
  )
on conflict (slug) do update set
  title = excluded.title,
  excerpt = excluded.excerpt,
  description = excluded.description,
  lead_question = excluded.lead_question,
  place_type = excluded.place_type,
  parent_place_slug = excluded.parent_place_slug,
  territory_label = excluded.territory_label,
  address_label = excluded.address_label,
  cover_image_url = excluded.cover_image_url,
  featured = excluded.featured,
  public_visibility = excluded.public_visibility,
  status = excluded.status,
  sort_order = excluded.sort_order,
  updated_at = excluded.updated_at;

insert into public.place_hub_links (
  place_hub_id,
  link_type,
  link_key,
  link_role,
  timeline_year,
  timeline_label,
  timeline_note,
  featured,
  sort_order,
  created_at,
  updated_at
)
select
  hub.id,
  data.link_type,
  data.link_key,
  data.link_role,
  data.timeline_year,
  data.timeline_label,
  data.timeline_note,
  data.featured,
  data.sort_order,
  timezone('utc', now()),
  timezone('utc', now())
from (
  values
    ('cidade-operaria', 'editorial', 'o-que-sobrou-da-promessa-industrial', 'lead', 2026, '2026', 'Pauta de entrada sobre bairro e promessa industrial.', true, 1),
    ('cidade-operaria', 'dossier', 'cidade-e-abandono', 'context', 2026, '2026', 'Dossiê que amarra o abandono urbano ao território.', true, 2),
    ('cidade-operaria', 'memory', 'greve-e-fabrica', 'archive', 1950, 'década de 1950', 'Memória de origem operária do bairro.', false, 3),
    ('cidade-operaria', 'archive', 'archive-mock-1', 'evidence', 1998, '1998', 'Foto-base para ler a vida de bairro.', false, 4),
    ('cidade-operaria', 'campaign', 'respira-volta-redonda', 'followup', 2026, '2026', 'Chamado que recorta o entorno industrial da cidade.', false, 5),
    ('cidade-operaria', 'impact', 'arquivo-que-volta-a-falar', 'followup', 2026, '2026', 'Consequência pública ligada à memória do bairro.', false, 6),
    ('csn-e-entorno', 'editorial', 'ar-poeira-e-pressao', 'lead', 2026, '2026', 'Pauta de entrada sobre ar e fumaça.', true, 1),
    ('csn-e-entorno', 'dossier', 'ar-fumaca-e-rotina-industrial', 'context', 2026, '2026', 'Dossiê de base para a disputa do ar.', true, 2),
    ('csn-e-entorno', 'memory', 'poeira-e-fumaca', 'archive', 1997, 'fim dos anos 1990', 'Memória territorial da fumaça recorrente.', false, 3),
    ('csn-e-entorno', 'archive', 'archive-mock-2', 'evidence', 2001, '2001', 'Recorte documental ligado ao tema ambiental.', false, 4),
    ('csn-e-entorno', 'campaign', 'respira-volta-redonda', 'followup', 2026, '2026', 'Chamado público que mantém a frente ativa.', false, 5),
    ('csn-e-entorno', 'impact', 'respira-volta-redonda', 'followup', 2026, '2026', 'Efeito público observado da mobilização.', false, 6),
    ('hospital-sao-joao-batista', 'editorial', 'turno-risco-e-lesao', 'lead', 2026, '2026', 'Pauta de entrada sobre risco e lesão.', true, 1),
    ('hospital-sao-joao-batista', 'dossier', 'trabalho-ferido-corpo-insistente', 'context', 2026, '2026', 'Dossiê que organiza o caso de trabalho.', true, 2),
    ('hospital-sao-joao-batista', 'memory', 'acidente-e-turno', 'archive', 2004, '2004', 'Memória do corpo em turno e acidente.', false, 3),
    ('hospital-sao-joao-batista', 'archive', 'archive-mock-3', 'evidence', 2006, '2006', 'Documento-base para o percurso do lugar.', false, 4),
    ('hospital-sao-joao-batista', 'impact', 'trabalho-sob-observacao', 'followup', 2026, '2026', 'Impacto de monitoramento do caso.', false, 5),
    ('rodoviaria-nova', 'editorial', 'linha-tarifa-e-espera', 'lead', 2026, '2026', 'Pauta sobre espera e mobilidade no terminal.', true, 1),
    ('rodoviaria-nova', 'dossier', 'cidade-e-abandono', 'context', 2026, '2026', 'Dossiê sobre abandono urbano e tempo roubado.', true, 2),
    ('rodoviaria-nova', 'campaign', 'trabalho-sob-observacao', 'followup', 2026, '2026', 'Chamado que ajuda a puxar atenção pública para o deslocamento e o desgaste.', false, 3),
    ('praca-savio-gama', 'memory', 'apagamentos-do-centro', 'lead', 1985, 'requalificações urbanas', 'Memória que ajuda a ler apagamentos no centro.', true, 1),
    ('praca-savio-gama', 'archive', 'archive-mock-4', 'evidence', 2010, '2010', 'Mapa e recorte que sustentam a leitura do lugar.', false, 2),
    ('praca-savio-gama', 'hub', 'cidade-e-abandono', 'context', 2026, '2026', 'Eixo que organiza o tema urbano do lugar.', false, 3),
    ('vila-santa-cecilia', 'editorial', 'o-que-sobrou-da-promessa-industrial', 'lead', 2026, '2026', 'Pauta que abre o território do bairro operário.', true, 1),
    ('vila-santa-cecilia', 'memory', 'greve-e-fabrica', 'context', 1950, 'década de 1950', 'Memória de organização popular no bairro.', false, 2),
    ('vila-santa-cecilia', 'impact', 'arquivo-que-volta-a-falar', 'followup', 2026, '2026', 'Consequência pública ligada à memória reativada.', false, 3)
) as data(place_slug, link_type, link_key, link_role, timeline_year, timeline_label, timeline_note, featured, sort_order)
join public.place_hubs hub on hub.slug = data.place_slug
on conflict (place_hub_id, link_type, link_key, link_role) do update set
  timeline_year = excluded.timeline_year,
  timeline_label = excluded.timeline_label,
  timeline_note = excluded.timeline_note,
  featured = excluded.featured,
  sort_order = excluded.sort_order,
  updated_at = excluded.updated_at;
