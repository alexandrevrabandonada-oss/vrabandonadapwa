create extension if not exists pgcrypto;

create table if not exists public.theme_hubs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  description text,
  lead_question text,
  cover_image_url text,
  featured boolean not null default false,
  public_visibility boolean not null default true,
  sort_order integer not null default 0,
  status text not null default 'draft' check (status in ('active', 'monitoring', 'archive', 'draft')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by text,
  updated_by text
);

create table if not exists public.theme_hub_links (
  id uuid primary key default gen_random_uuid(),
  theme_hub_id uuid not null references public.theme_hubs (id) on delete cascade,
  link_type text not null check (link_type in ('editorial', 'memory', 'archive', 'collection', 'dossier', 'series')),
  link_key text not null,
  link_role text not null default 'context' check (link_role in ('lead', 'evidence', 'context', 'followup', 'archive')),
  timeline_year integer,
  timeline_label text,
  timeline_note text,
  featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (theme_hub_id, link_type, link_key)
);

create index if not exists theme_hubs_public_idx
  on public.theme_hubs (public_visibility, status, featured, sort_order);

create index if not exists theme_hub_links_theme_hub_idx
  on public.theme_hub_links (theme_hub_id, featured, sort_order, created_at);

alter table public.theme_hubs enable row level security;
alter table public.theme_hub_links enable row level security;

insert into public.theme_hubs (title, slug, excerpt, description, lead_question, cover_image_url, featured, public_visibility, sort_order, status, created_at, updated_at)
values
  (
    'Poluição e CSN',
    'poluicao-e-csn',
    'Ar, fumaça e impacto cotidiano em torno da siderurgia.',
    'Eixo que reúne o que a cidade respira, o que o entorno industrial produz e o que vira custo ambiental para bairros e corpos.',
    'Quem paga o custo ambiental da cidade e por que isso foi naturalizado?',
    '/editorial/covers/arquivo-inicial.svg',
    true,
    true,
    1,
    'active',
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    'Trabalho e acidentes',
    'trabalho-e-acidentes',
    'Turno, risco e desgaste como rotina pública.',
    'Frente dedicada a lesão, pressão produtiva, adoecimento e a normalização do risco no cotidiano do trabalho operário.',
    'Quando o acidente deixa de ser exceção e vira estrutura?',
    '/archive/assets/acervo-relatorio.svg',
    true,
    true,
    2,
    'monitoring',
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    'Cidade e abandono',
    'cidade-e-abandono',
    'Infraestrutura, espera e desgaste urbano como política cotidiana.',
    'Eixo que trata da falha prolongada do espaço público, da manutenção interrompida e da cidade como território de abandono administrado.',
    'O que a cidade deixa cair quando o abandono vira normalidade?',
    '/archive/assets/acervo-foto-oficina.svg',
    true,
    true,
    3,
    'active',
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    'Memória de Volta Redonda',
    'memoria-de-volta-redonda',
    'Arquivo vivo da cidade, do trabalho e das disputas pela narrativa pública.',
    'Frente que cruza fotografia, relato oral, marcos urbanos e documentos para impedir que a história da cidade vire apagamento.',
    'Que memória a cidade ainda consegue sustentar contra o esquecimento oficial?',
    '/archive/assets/acervo-recorte-jornal.svg',
    false,
    true,
    4,
    'monitoring',
    timezone('utc', now()),
    timezone('utc', now())
  )
on conflict (slug) do nothing;

insert into public.theme_hub_links (theme_hub_id, link_type, link_key, link_role, timeline_year, timeline_label, timeline_note, featured, sort_order, created_at, updated_at)
select h.id, v.link_type, v.link_key, v.link_role, v.timeline_year, v.timeline_label, v.timeline_note, v.featured, v.sort_order, timezone('utc', now()), timezone('utc', now())
from public.theme_hubs h
join (
  values
    ('poluicao-e-csn', 'editorial', 'ar-poeira-e-pressao', 'lead', 2024, '2024', 'Abertura editorial do eixo sobre poeira e pressão.', true, 1),
    ('poluicao-e-csn', 'dossier', 'ar-fumaca-e-rotina-industrial', 'followup', 2026, '2026', 'Dossiê em curso que costura prova, memória e atualização.', true, 2),
    ('poluicao-e-csn', 'memory', 'poeira-e-fumaca', 'context', 1997, 'fim dos anos 1990', 'Memória territorial sobre permanência da fumaça.', false, 3),
    ('poluicao-e-csn', 'archive', 'archive-mock-2', 'evidence', 2008, '2008', 'Documento-base sobre poeira industrial e pressão cotidiana.', false, 4),
    ('poluicao-e-csn', 'collection', 'poluicao-e-industria', 'archive', 2016, '2016', 'Coleção documental da poluição.', false, 5),
    ('poluicao-e-csn', 'series', 'poluicao-e-csn', 'followup', 2025, '2025', 'Série que mantém o eixo em movimento público.', false, 6),
    ('trabalho-e-acidentes', 'editorial', 'turno-risco-e-lesao', 'lead', 2025, '2025', 'Peça central sobre acidente, turno e desgaste corporal.', true, 1),
    ('trabalho-e-acidentes', 'dossier', 'trabalho-ferido-corpo-insistente', 'followup', 2026, '2026', 'Dossiê em acompanhamento sobre rotina de risco.', true, 2),
    ('trabalho-e-acidentes', 'memory', 'acidente-e-turno', 'context', 2004, '2004', 'Memória sobre a normalização do risco no turno.', false, 3),
    ('trabalho-e-acidentes', 'archive', 'archive-mock-3', 'evidence', 2010, '2010', 'Arquivo que sustenta a leitura sobre lesão e pressão.', false, 4),
    ('trabalho-e-acidentes', 'collection', 'trabalho-e-acidentes', 'archive', 2018, '2018', 'Coleção documental de acidentes e trabalho.', false, 5),
    ('trabalho-e-acidentes', 'series', 'trabalho-e-acidentes', 'followup', 2026, '2026', 'Série que atualiza o caso no tempo presente.', false, 6),
    ('cidade-e-abandono', 'editorial', 'o-que-sobrou-da-promessa-industrial', 'lead', 2026, '2026', 'Entrada central do eixo sobre abandono urbano.', true, 1),
    ('cidade-e-abandono', 'dossier', 'cidade-e-abandono', 'followup', 2026, '2026', 'Dossiê concluído que segue como lastro do tema.', true, 2),
    ('cidade-e-abandono', 'memory', 'apagamentos-e-disputas', 'context', 1990, 'anos 1990', 'Memória sobre apagamentos e disputa do território.', false, 3),
    ('cidade-e-abandono', 'archive', 'archive-mock-1', 'evidence', 2012, '2012', 'Fonte documental sobre a cidade deixada em suspenso.', false, 4),
    ('cidade-e-abandono', 'collection', 'cidade-operaria', 'archive', 2019, '2019', 'Coleção de base da memória urbana-operária.', false, 5),
    ('cidade-e-abandono', 'series', 'cidade-e-abandono', 'followup', 2026, '2026', 'Série de continuidade do abandono urbano.', false, 6),
    ('memoria-de-volta-redonda', 'memory', 'cidade-operaria', 'lead', 1979, '1979', 'Memória-base da cidade operária em disputa narrativa.', true, 1),
    ('memoria-de-volta-redonda', 'dossier', 'ar-fumaca-e-rotina-industrial', 'followup', 2026, '2026', 'Dossiê que atualiza o conflito no presente.', false, 2),
    ('memoria-de-volta-redonda', 'dossier', 'cidade-e-abandono', 'followup', 2026, '2026', 'Dossiê concluído que segue como lastro do tema.', false, 3),
    ('memoria-de-volta-redonda', 'archive', 'archive-mock-4', 'evidence', 1998, '1998', 'Recorte documental sobre a memória da cidade.', false, 4),
    ('memoria-de-volta-redonda', 'collection', 'cidade-operaria', 'archive', 2019, '2019', 'Coleção de base da memória urbana-operária.', false, 5)
) as v(slug, link_type, link_key, link_role, timeline_year, timeline_label, timeline_note, featured, sort_order)
  on h.slug = v.slug
on conflict (theme_hub_id, link_type, link_key) do nothing;

drop policy if exists "Public can read published theme hubs" on public.theme_hubs;
create policy "Public can read published theme hubs"
  on public.theme_hubs
  for select
  using (public_visibility = true and status <> 'draft');

drop policy if exists "Authenticated users can manage theme hubs" on public.theme_hubs;
create policy "Authenticated users can manage theme hubs"
  on public.theme_hubs
  for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Public can read theme hub links" on public.theme_hub_links;
create policy "Public can read theme hub links"
  on public.theme_hub_links
  for select
  using (
    exists (
      select 1
      from public.theme_hubs h
      where h.id = theme_hub_id
        and h.public_visibility = true
        and h.status <> 'draft'
    )
  );

drop policy if exists "Authenticated users can manage theme hub links" on public.theme_hub_links;
create policy "Authenticated users can manage theme hub links"
  on public.theme_hub_links
  for all
  to authenticated
  using (true)
  with check (true);
