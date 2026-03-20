create extension if not exists pgcrypto;

create table if not exists public.participation_paths (
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

create table if not exists public.participation_path_items (
  id uuid primary key default gen_random_uuid(),
  path_id uuid not null references public.participation_paths (id) on delete cascade,
  item_type text not null check (item_type in ('page', 'editorial', 'dossier', 'memory', 'archive', 'collection', 'hub', 'series', 'external')),
  item_key text not null,
  role text not null default 'context' check (role in ('start', 'context', 'proof', 'deepen', 'follow')),
  sort_order integer not null default 0,
  note text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (path_id, item_type, item_key, role)
);

create index if not exists participation_paths_public_idx on public.participation_paths (public_visibility, status, featured, sort_order);
create index if not exists participation_path_items_path_idx on public.participation_path_items (path_id, role, sort_order, created_at);

alter table public.participation_paths enable row level security;
alter table public.participation_path_items enable row level security;

insert into public.participation_paths (title, slug, excerpt, description, audience_label, featured, public_visibility, sort_order, status, created_at, updated_at)
values
  (
    'Enviar pista, relato ou documento',
    'enviar-pista-relato-ou-documento',
    'Para quem tem material e quer abrir uma porta responsável para o projeto.',
    'Caminho para denúncia, pista, relato e documento. Começa com cuidado editorial e termina em envio direto para o intake.',
    'Quem tem algo para contar',
    true,
    true,
    1,
    'active',
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    'Apoiar o VR Abandonada',
    'apoiar-o-vr-abandonada',
    'Para quem quer fortalecer a continuidade do projeto.',
    'Rota de apoio que explica o que sustenta o trabalho, como contribuir e por que a continuidade depende de base coletiva.',
    'Quem quer fortalecer',
    true,
    true,
    2,
    'active',
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    'Colaborar com memória e acervo',
    'colaborar-com-memoria-e-acervo',
    'Para quem tem foto, recorte, documento ou lembrança da cidade.',
    'Entrada para o arquivo vivo, com foco em material histórico, correção de dados e lastro documental.',
    'Quem preserva memória',
    true,
    true,
    3,
    'active',
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    'Acompanhar e compartilhar o que está em curso',
    'acompanhar-e-compartilhar-o-que-esta-em-curso',
    'Para quem quer voltar ao site e seguir as investigações vivas.',
    'Caminho para radar, dossiês, eixos e rotas de entrada. Ajuda a transformar leitura em retorno recorrente.',
    'Quem quer acompanhar',
    true,
    true,
    4,
    'active',
    timezone('utc', now()),
    timezone('utc', now())
  )
on conflict (slug) do nothing;

insert into public.participation_path_items (path_id, item_type, item_key, role, sort_order, note, created_at, updated_at)
select p.id, x.item_type, x.item_key, x.role, x.sort_order, x.note, timezone('utc', now()), timezone('utc', now())
from public.participation_paths p
join (
  values
    ('enviar-pista-relato-ou-documento', 'page', '/envie', 'start', 1, 'Comece pelo canal de envio.'),
    ('enviar-pista-relato-ou-documento', 'dossier', 'ar-fumaca-e-rotina-industrial', 'context', 2, 'Se a pista tocar um caso em curso, veja o dossiê.'),
    ('enviar-pista-relato-ou-documento', 'page', '/comecar', 'deepen', 3, 'Se estiver em dúvida, entre pelas rotas.'),
    ('apoiar-o-vr-abandonada', 'page', '/apoie', 'start', 1, 'Entenda o apoio disponível.'),
    ('apoiar-o-vr-abandonada', 'page', '/manifesto', 'context', 2, 'Veja por que esse apoio importa.'),
    ('apoiar-o-vr-abandonada', 'page', '/comecar/entenda-o-projeto-em-5-minutos', 'deepen', 3, 'Conheça o projeto antes de apoiar.'),
    ('colaborar-com-memoria-e-acervo', 'page', '/memoria', 'start', 1, 'Entre pelo arquivo vivo.'),
    ('colaborar-com-memoria-e-acervo', 'page', '/acervo', 'proof', 2, 'Veja documentos, fotos e fontes.'),
    ('colaborar-com-memoria-e-acervo', 'page', '/acervo/colecoes/cidade-operaria', 'deepen', 3, 'Comece por um recorte temático.'),
    ('acompanhar-e-compartilhar-o-que-esta-em-curso', 'page', '/agora', 'start', 1, 'Veja o pulso do momento.'),
    ('acompanhar-e-compartilhar-o-que-esta-em-curso', 'page', '/dossies', 'context', 2, 'Siga as investigações em curso.'),
    ('acompanhar-e-compartilhar-o-que-esta-em-curso', 'page', '/comecar', 'follow', 3, 'Se chegou agora, entre pelas rotas.')
  as x(slug, item_type, item_key, role, sort_order, note)
  on p.slug = x.slug
on conflict (path_id, item_type, item_key, role) do nothing;

drop policy if exists "Public can read published participation paths" on public.participation_paths;
create policy "Public can read published participation paths"
  on public.participation_paths
  for select
  using (public_visibility = true and status <> 'draft');

drop policy if exists "Authenticated users can manage participation paths" on public.participation_paths;
create policy "Authenticated users can manage participation paths"
  on public.participation_paths
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "Public can read participation path items" on public.participation_path_items;
create policy "Public can read participation path items"
  on public.participation_path_items
  for select
  using (
    exists (
      select 1 from public.participation_paths p
      where p.id = path_id and p.public_visibility = true and p.status <> 'draft'
    )
  );

drop policy if exists "Authenticated users can manage participation path items" on public.participation_path_items;
create policy "Authenticated users can manage participation path items"
  on public.participation_path_items
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');