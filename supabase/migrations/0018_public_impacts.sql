create extension if not exists pgcrypto;

create table if not exists public.public_impacts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  description text,
  lead_question text,
  impact_type text not null
    check (impact_type in ('correction', 'response', 'mobilization', 'document', 'archive_growth', 'public_pressure', 'media_echo', 'institutional_move', 'continuity')),
  status text not null
    default 'observed'
    check (status in ('observed', 'partial', 'ongoing', 'consolidated', 'disputed', 'archived')),
  date_label text,
  happened_at timestamptz,
  territory_label text,
  cover_image_url text,
  featured boolean not null default false,
  public_visibility boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid,
  updated_by uuid
);

create table if not exists public.public_impact_links (
  id uuid primary key default gen_random_uuid(),
  impact_id uuid not null references public.public_impacts(id) on delete cascade,
  link_type text not null
    check (link_type in ('editorial', 'memory', 'archive', 'collection', 'dossier', 'series', 'hub', 'page', 'external')),
  link_key text not null,
  link_role text not null
    check (link_role in ('lead', 'evidence', 'context', 'followup', 'archive')),
  note text,
  featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists public_impacts_public_visibility_idx on public.public_impacts (public_visibility);
create index if not exists public_impacts_status_idx on public.public_impacts (status);
create index if not exists public_impacts_featured_idx on public.public_impacts (featured);
create index if not exists public_impacts_sort_order_idx on public.public_impacts (sort_order);
create index if not exists public_impacts_happened_at_idx on public.public_impacts (happened_at desc);
create index if not exists public_impacts_slug_idx on public.public_impacts (slug);
create index if not exists public_impact_links_impact_id_idx on public.public_impact_links (impact_id);
create index if not exists public_impact_links_featured_idx on public.public_impact_links (featured);
create index if not exists public_impact_links_sort_order_idx on public.public_impact_links (sort_order);

alter table public.public_impacts enable row level security;
alter table public.public_impact_links enable row level security;

drop policy if exists "public can read published impacts" on public.public_impacts;
create policy "public can read published impacts"
  on public.public_impacts
  for select
  using (public_visibility = true);

drop policy if exists "authenticated can manage impacts" on public.public_impacts;
create policy "authenticated can manage impacts"
  on public.public_impacts
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "public can read links for published impacts" on public.public_impact_links;
create policy "public can read links for published impacts"
  on public.public_impact_links
  for select
  using (
    exists (
      select 1
      from public.public_impacts impact
      where impact.id = public_impact_links.impact_id
        and impact.public_visibility = true
    )
  );

drop policy if exists "authenticated can manage impact links" on public.public_impact_links;
create policy "authenticated can manage impact links"
  on public.public_impact_links
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

insert into public.public_impacts (
  title,
  slug,
  excerpt,
  description,
  lead_question,
  impact_type,
  status,
  date_label,
  happened_at,
  territory_label,
  cover_image_url,
  featured,
  public_visibility,
  sort_order
)
select * from (
  values
    (
      'Respira Volta Redonda',
      'respira-volta-redonda',
      'Chamado público sobre ar, fumaça e consequência industrial no cotidiano da cidade.',
      'Uma frente pública para condensar investigação, relato, memória e acervo em torno da poluição e do direito de respirar. O foco é manter o tema em circulação, reunir material de base e reforçar a pressão pública sem prometer resolução instantânea.',
      'O que mudou no ar da cidade e o que ainda precisa de prova?',
      'public_pressure',
      'ongoing',
      'março de 2026',
      '2026-03-19 12:00:00+00',
      'Cidade e entorno industrial',
      '/editorial/covers/arquivo-inicial.svg',
      true,
      true,
      1
    ),
    (
      'Trabalho sob observação',
      'trabalho-sob-observacao',
      'Linha de acompanhamento sobre risco, lesão e normalização do desgaste no trabalho.',
      'Uma frente de monitoramento para reunir relatos, documentos e retornos ligados a acidentes e à rotina laboral. O foco é manter o caso em circulação pública e registrar o que ainda está em disputa.',
      'O que segue sendo normalizado no chão de fábrica?',
      'continuity',
      'partial',
      'março de 2026',
      '2026-03-19 12:00:00+00',
      'Chão de fábrica e cidade operária',
      '/editorial/covers/arquivo-inicial.svg',
      false,
      true,
      2
    ),
    (
      'Arquivo que volta a falar',
      'arquivo-que-volta-a-falar',
      'Preservação de memória e ampliação de acervo a partir de materiais que voltaram ao circuito público.',
      'Uma consequência pública ligada ao crescimento do arquivo vivo: fotos, recortes e relatos que passaram a circular de novo, reorganizando memória, contexto e leitura histórica do território.',
      'O que volta quando o arquivo reaparece?',
      'archive_growth',
      'observed',
      'fevereiro de 2026',
      '2026-02-28 12:00:00+00',
      'Memória da cidade',
      '/editorial/covers/arquivo-inicial.svg',
      false,
      true,
      3
    )
) as seed (
  title,
  slug,
  excerpt,
  description,
  lead_question,
  impact_type,
  status,
  date_label,
  happened_at,
  territory_label,
  cover_image_url,
  featured,
  public_visibility,
  sort_order
)
on conflict (slug) do update
set
  excerpt = excluded.excerpt,
  description = excluded.description,
  lead_question = excluded.lead_question,
  impact_type = excluded.impact_type,
  status = excluded.status,
  date_label = excluded.date_label,
  happened_at = excluded.happened_at,
  territory_label = excluded.territory_label,
  cover_image_url = excluded.cover_image_url,
  featured = excluded.featured,
  public_visibility = excluded.public_visibility,
  sort_order = excluded.sort_order,
  updated_at = timezone('utc', now());

insert into public.public_impact_links (impact_id, link_type, link_key, link_role, note, featured, sort_order)
select impact.id, link_seed.link_type, link_seed.link_key, link_seed.link_role, link_seed.note, link_seed.featured, link_seed.sort_order
from public.public_impacts impact
join (
  values
    ('respira-volta-redonda', 'editorial', 'ar-poeira-e-pressao', 'lead', 'Pauta de entrada para o chamado.', true, 1),
    ('respira-volta-redonda', 'dossier', 'ar-fumaca-e-rotina-industrial', 'context', 'Dossiê que organiza a investigação de base.', true, 2),
    ('respira-volta-redonda', 'hub', 'poluicao-e-csn', 'context', 'Eixo maior que sustenta o foco do momento.', false, 3),
    ('respira-volta-redonda', 'memory', 'poluicao-e-industria', 'archive', 'Memória que ajuda a entender a duração do problema.', false, 4),
    ('respira-volta-redonda', 'archive', 'archive-mock-2', 'evidence', 'Documento-base do acervo.', false, 5),
    ('respira-volta-redonda', 'page', 'envie', 'followup', 'Canal público de envio para relatos e pistas.', false, 6),
    ('respira-volta-redonda', 'page', 'metodo', 'followup', 'Método e cuidado editorial do projeto.', false, 7),
    ('respira-volta-redonda', 'page', 'participe', 'followup', 'Outras formas de colaboração pública.', false, 8),
    ('respira-volta-redonda', 'page', 'apoie', 'followup', 'Sustentação do projeto.', false, 9),
    ('trabalho-sob-observacao', 'dossier', 'trabalho-ferido-corpo-insistente', 'lead', 'Caso principal do monitoramento.', true, 1),
    ('trabalho-sob-observacao', 'editorial', 'turno-risco-e-lesao', 'evidence', 'Pauta atual que mantém o caso vivo.', true, 2),
    ('trabalho-sob-observacao', 'hub', 'trabalho-e-acidentes', 'context', 'Eixo temático maior.', false, 3),
    ('trabalho-sob-observacao', 'memory', 'trabalho-e-acidentes', 'archive', 'Memória que sustenta o contexto histórico.', false, 4),
    ('trabalho-sob-observacao', 'archive', 'archive-mock-3', 'evidence', 'Documento-base do acervo.', false, 5),
    ('trabalho-sob-observacao', 'page', 'agora', 'followup', 'Radar vivo do projeto.', false, 6),
    ('arquivo-que-volta-a-falar', 'memory', 'cidade-operaria', 'lead', 'Memória-base que reapareceu com força pública.', true, 1),
    ('arquivo-que-volta-a-falar', 'collection', 'cidade-operaria', 'context', 'Coleção que reúne o recorte temático.', false, 2),
    ('arquivo-que-volta-a-falar', 'archive', 'archive-mock-1', 'evidence', 'Material preservado que volta a circular.', false, 3),
    ('arquivo-que-volta-a-falar', 'dossier', 'cidade-e-abandono', 'followup', 'Dossiê conectado à disputa do território.', false, 4)
) as link_seed (slug, link_type, link_key, link_role, note, featured, sort_order)
  on impact.slug = link_seed.slug
on conflict do nothing;
