create extension if not exists pgcrypto;

create table if not exists public.entry_routes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  description text,
  audience_label text,
  featured boolean not null default false,
  public_visibility boolean not null default true,
  sort_order integer not null default 0,
  status text not null default 'draft' check (status in ('draft', 'active', 'archive')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by text,
  updated_by text
);

create table if not exists public.entry_route_items (
  id uuid primary key default gen_random_uuid(),
  route_id uuid not null references public.entry_routes (id) on delete cascade,
  item_type text not null check (item_type in ('editorial', 'dossier', 'memory', 'archive', 'collection', 'hub', 'series')),
  item_key text not null,
  role text not null default 'context' check (role in ('start', 'context', 'proof', 'deepen', 'follow')),
  sort_order integer not null default 0,
  note text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (route_id, item_type, item_key, role)
);

create index if not exists entry_routes_public_idx on public.entry_routes (public_visibility, status, featured, sort_order);
create index if not exists entry_route_items_route_idx on public.entry_route_items (route_id, role, sort_order, created_at);

alter table public.entry_routes enable row level security;
alter table public.entry_route_items enable row level security;

insert into public.entry_routes (title, slug, excerpt, description, audience_label, featured, public_visibility, sort_order, status, created_at, updated_at)
values
  (
    'Entenda o projeto em 5 minutos',
    'entenda-o-projeto-em-5-minutos',
    'Um caminho curto para quem chega agora e quer entender o que é o VR Abandonada.',
    'Rota de entrada para visitantes novos. Começa pelo manifesto, atravessa pauta, memória e arquivo, e termina em um convite claro para seguir acompanhando o projeto.',
    'Primeira visita',
    true,
    true,
    1,
    'active',
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    'Comece pela poluição e CSN',
    'comece-pela-poluicao-e-csn',
    'A porta de entrada para quem quer ler a cidade a partir do conflito ambiental e industrial.',
    'Uma rota temática que começa no eixo, passa pelo dossiê, mostra evidências documentais e termina em memória e pauta.',
    'Quem quer tema',
    true,
    true,
    2,
    'active',
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    'Comece pela memória da cidade',
    'comece-pela-memoria-da-cidade',
    'Para quem quer entender o arquivo vivo antes de entrar nas pautas.',
    'Percurso que parte da memória, sobe para o acervo e volta para os casos e eixos que ajudam a ler o presente.',
    'Arquivo e história',
    true,
    true,
    3,
    'active',
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    'Acompanhe o que está em curso agora',
    'acompanhe-o-que-esta-em-curso-agora',
    'Para quem quer entender o ritmo presente do projeto sem se perder.',
    'Rota voltada ao radar editorial e aos dossiês em andamento. Mostra o que mudou, o que está quente e o que convoca retorno.',
    'Retorno recorrente',
    true,
    true,
    4,
    'active',
    timezone('utc', now()),
    timezone('utc', now())
  )
on conflict (slug) do nothing;

insert into public.entry_route_items (route_id, item_type, item_key, role, sort_order, note, created_at, updated_at)
select r.id, x.item_type, x.item_key, x.role, x.sort_order, x.note, timezone('utc', now()), timezone('utc', now())
from public.entry_routes r
join (
  values
    ('entenda-o-projeto-em-5-minutos', 'editorial', 'o-que-sobrou-da-promessa-industrial', 'start', 1, 'Abrir com uma pauta forte e atual.'),
    ('entenda-o-projeto-em-5-minutos', 'dossier', 'ar-fumaca-e-rotina-industrial', 'context', 2, 'Amarra o caso em curso.'),
    ('entenda-o-projeto-em-5-minutos', 'memory', 'cidade-operaria', 'proof', 3, 'Memória-base da cidade operária.'),
    ('entenda-o-projeto-em-5-minutos', 'archive', 'archive-mock-4', 'deepen', 4, 'Recorte documental para aprofundar.'),
    ('comece-pela-poluicao-e-csn', 'hub', 'poluicao-e-csn', 'start', 1, 'Comece pelo tema.'),
    ('comece-pela-poluicao-e-csn', 'dossier', 'ar-fumaca-e-rotina-industrial', 'proof', 2, 'Dossiê que organiza a investigação.'),
    ('comece-pela-poluicao-e-csn', 'archive', 'archive-mock-1', 'proof', 3, 'Material de base do conflito.'),
    ('comece-pela-poluicao-e-csn', 'memory', 'poluicao-e-industria', 'context', 4, 'Memória histórica do eixo.'),
    ('comece-pela-memoria-da-cidade', 'memory', 'cidade-operaria', 'start', 1, 'Entrada por arquivo vivo.'),
    ('comece-pela-memoria-da-cidade', 'archive', 'archive-mock-2', 'proof', 2, 'Fonte visual do arquivo.'),
    ('comece-pela-memoria-da-cidade', 'editorial', 'linha-tarifa-e-espera', 'follow', 3, 'Mostra como a memória atravessa a pauta atual.'),
    ('acompanhe-o-que-esta-em-curso-agora', 'dossier', 'trabalho-ferido-corpo-insistente', 'start', 1, 'Caso em andamento.'),
    ('acompanhe-o-que-esta-em-curso-agora', 'editorial', 'turno-risco-e-lesao', 'context', 2, 'Pauta que acompanha o caso.'),
    ('acompanhe-o-que-esta-em-curso-agora', 'hub', 'trabalho-e-acidentes', 'deepen', 3, 'Frente temática maior.'),
    ('acompanhe-o-que-esta-em-curso-agora', 'archive', 'archive-mock-3', 'proof', 4, 'Documento para ancorar a leitura.')
  as x(slug, item_type, item_key, role, sort_order, note)
  on r.slug = x.slug
on conflict (route_id, item_type, item_key, role) do nothing;

drop policy if exists "Public can read published entry routes" on public.entry_routes;
create policy "Public can read published entry routes"
  on public.entry_routes
  for select
  using (public_visibility = true and status <> 'draft');

drop policy if exists "Authenticated users can manage entry routes" on public.entry_routes;
create policy "Authenticated users can manage entry routes"
  on public.entry_routes
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "Public can read entry route items" on public.entry_route_items;
create policy "Public can read entry route items"
  on public.entry_route_items
  for select
  using (
    exists (
      select 1 from public.entry_routes r
      where r.id = route_id and r.public_visibility = true and r.status <> 'draft'
    )
  );

drop policy if exists "Authenticated users can manage entry route items" on public.entry_route_items;
create policy "Authenticated users can manage entry route items"
  on public.entry_route_items
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
