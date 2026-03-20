create extension if not exists pgcrypto;

create table if not exists public.editorial_editions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  description text,
  edition_type text not null default 'city_pulse' check (edition_type in ('weekly', 'thematic', 'campaign', 'dossier', 'city_pulse', 'archive', 'special')),
  period_label text,
  published_at timestamptz,
  cover_image_url text,
  featured boolean not null default false,
  public_visibility boolean not null default true,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by text,
  updated_by text
);

create table if not exists public.editorial_edition_links (
  id uuid primary key default gen_random_uuid(),
  edition_id uuid not null references public.editorial_editions (id) on delete cascade,
  link_type text not null check (link_type in ('editorial', 'memory', 'archive', 'collection', 'dossier', 'campaign', 'impact', 'hub', 'territory', 'actor', 'pattern', 'radar', 'page', 'external')),
  link_key text not null,
  link_role text not null default 'context' check (link_role in ('lead', 'evidence', 'context', 'followup', 'archive')),
  note text,
  featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists editorial_editions_slug_idx on public.editorial_editions (slug);
create index if not exists editorial_editions_public_visibility_idx on public.editorial_editions (public_visibility);
create index if not exists editorial_editions_status_idx on public.editorial_editions (status);
create index if not exists editorial_editions_featured_idx on public.editorial_editions (featured);
create index if not exists editorial_editions_sort_order_idx on public.editorial_editions (sort_order);
create index if not exists editorial_editions_published_at_idx on public.editorial_editions (published_at desc);
create index if not exists editorial_edition_links_edition_id_idx on public.editorial_edition_links (edition_id);
create index if not exists editorial_edition_links_sort_order_idx on public.editorial_edition_links (sort_order);
create unique index if not exists editorial_edition_links_unique_idx on public.editorial_edition_links (edition_id, link_type, link_key, link_role, sort_order);

create or replace function public.set_editorial_editions_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create trigger editorial_editions_set_updated_at
before update on public.editorial_editions
for each row
execute function public.set_editorial_editions_updated_at();

create or replace function public.set_editorial_edition_links_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create trigger editorial_edition_links_set_updated_at
before update on public.editorial_edition_links
for each row
execute function public.set_editorial_edition_links_updated_at();

alter table public.editorial_editions enable row level security;
alter table public.editorial_edition_links enable row level security;

drop policy if exists "Public editions are visible when published" on public.editorial_editions;
create policy "Public editions are visible when published"
  on public.editorial_editions
  for select
  using (public_visibility = true and status in ('published', 'archived'));

drop policy if exists "Authenticated users can manage editions" on public.editorial_editions;
create policy "Authenticated users can manage editions"
  on public.editorial_editions
  for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Public edition links are visible when edition is public" on public.editorial_edition_links;
create policy "Public edition links are visible when edition is public"
  on public.editorial_edition_links
  for select
  using (
    exists (
      select 1
      from public.editorial_editions edition
      where edition.id = edition_id
        and edition.public_visibility = true
        and edition.status in ('published', 'archived')
    )
  );

drop policy if exists "Authenticated users can manage edition links" on public.editorial_edition_links;
create policy "Authenticated users can manage edition links"
  on public.editorial_edition_links
  for all
  to authenticated
  using (true)
  with check (true);

insert into public.editorial_editions (
  title,
  slug,
  excerpt,
  description,
  edition_type,
  period_label,
  published_at,
  cover_image_url,
  featured,
  public_visibility,
  status,
  sort_order
)
values
  (
    'Edição do momento: o que está quente agora',
    'edicao-do-momento-o-que-esta-quente-agora',
    'Síntese editorial do pulso atual do VR Abandonada.',
    'Esta edição condensa o radar, uma campanha ativa, o impacto observado e as leituras que ajudam a entender por que a cidade voltou a ferver editorialmente. É a porta curta para quem quer acompanhar o momento sem perder o fio.',
    'city_pulse',
    'Semana de 20 a 27 de março de 2026',
    '2026-03-20 12:00:00+00',
    '/editorial/covers/arquivo-inicial.svg',
    true,
    true,
    'published',
    1
  ),
  (
    'Poluição e CSN: o que se respira e o que volta',
    'poluicao-e-csn-o-que-se-respira-e-o-que-volta',
    'Caderno temático sobre ar, fumaça, território e pressão pública.',
    'Uma edição temática para reunir a frente ambiental, os documentos de base e a memória do entorno industrial. O objetivo é mostrar como a recorrência do problema atravessa pauta, impacto, território e atores.',
    'thematic',
    'Caderno temático',
    '2026-03-19 12:00:00+00',
    '/archive/assets/acervo-recorte-jornal.svg',
    false,
    true,
    'published',
    2
  ),
  (
    'Arquivo que volta a falar',
    'arquivo-que-volta-a-falar',
    'Edição especial sobre memória, acervo e correção editorial.',
    'Um caderno curto para mostrar o que acontece quando o arquivo deixa de ser repouso e volta a produzir consequência pública: revisão, vínculo, correção e memória reativada.',
    'special',
    'Edição especial',
    '2026-03-18 12:00:00+00',
    '/archive/assets/acervo-foto-oficina.svg',
    false,
    true,
    'archived',
    3
  )
on conflict (slug) do update set
  excerpt = excluded.excerpt,
  description = excluded.description,
  edition_type = excluded.edition_type,
  period_label = excluded.period_label,
  published_at = excluded.published_at,
  cover_image_url = excluded.cover_image_url,
  featured = excluded.featured,
  public_visibility = excluded.public_visibility,
  status = excluded.status,
  sort_order = excluded.sort_order,
  updated_at = timezone('utc', now());

insert into public.editorial_edition_links (edition_id, link_type, link_key, link_role, note, featured, sort_order)
select edition.id, link_seed.link_type, link_seed.link_key, link_seed.link_role, link_seed.note, link_seed.featured, link_seed.sort_order
from public.editorial_editions edition
join (
  values
    ('edicao-do-momento-o-que-esta-quente-agora', 'radar', 'agora', 'lead', 'Radar do momento que sintetiza o pulso atual.', true, 1),
    ('edicao-do-momento-o-que-esta-quente-agora', 'campaign', 'respira-volta-redonda', 'context', 'Campanha que concentra a mobilização pública.', true, 2),
    ('edicao-do-momento-o-que-esta-quente-agora', 'impact', 'respira-volta-redonda', 'evidence', 'Efeito público observado da frente.', false, 3),
    ('edicao-do-momento-o-que-esta-quente-agora', 'dossier', 'ar-fumaca-e-rotina-industrial', 'context', 'Dossiê que organiza o caso de base.', false, 4),
    ('edicao-do-momento-o-que-esta-quente-agora', 'editorial', 'ar-poeira-e-pressao', 'followup', 'Pauta para seguir a leitura e compartilhar.', false, 5),
    ('edicao-do-momento-o-que-esta-quente-agora', 'page', 'participe', 'followup', 'Caminho de colaboração pública.', false, 6),
    ('poluicao-e-csn-o-que-se-respira-e-o-que-volta', 'campaign', 'respira-volta-redonda', 'lead', 'Campanha que condensa a frente ambiental.', true, 1),
    ('poluicao-e-csn-o-que-se-respira-e-o-que-volta', 'dossier', 'ar-fumaca-e-rotina-industrial', 'context', 'Dossiê de base da linha de investigação.', true, 2),
    ('poluicao-e-csn-o-que-se-respira-e-o-que-volta', 'pattern', 'a-poeira-que-volta', 'evidence', 'Padrão de recorrência estrutural.', false, 3),
    ('poluicao-e-csn-o-que-se-respira-e-o-que-volta', 'memory', 'poluicao-e-industria', 'archive', 'Memória que ajuda a sustentar a leitura do tema.', false, 4),
    ('poluicao-e-csn-o-que-se-respira-e-o-que-volta', 'territory', 'csn-e-entorno', 'context', 'Território onde o tema reaparece com força.', false, 5),
    ('poluicao-e-csn-o-que-se-respira-e-o-que-volta', 'actor', 'companhia-siderurgica-nacional', 'context', 'Ator que atravessa a recorrência temática.', false, 6),
    ('arquivo-que-volta-a-falar', 'memory', 'cidade-operaria', 'lead', 'Memória-base que reapareceu com força pública.', true, 1),
    ('arquivo-que-volta-a-falar', 'collection', 'cidade-operaria', 'context', 'Coleção que reúne o recorte temático.', false, 2),
    ('arquivo-que-volta-a-falar', 'archive', 'archive-mock-4', 'evidence', 'Material preservado que volta a circular.', false, 3),
    ('arquivo-que-volta-a-falar', 'dossier', 'cidade-e-abandono', 'followup', 'Dossiê conectado à disputa do território.', false, 4)
) as link_seed (slug, link_type, link_key, link_role, note, featured, sort_order)
  on edition.slug = link_seed.slug
on conflict (edition_id, link_type, link_key, link_role, sort_order) do nothing;
