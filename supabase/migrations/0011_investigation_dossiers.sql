create table if not exists public.investigation_dossiers (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  description text,
  status text not null default 'draft' check (status in ('draft', 'in_progress', 'published', 'archived')),
  cover_image_url text,
  featured boolean not null default false,
  public_visibility boolean not null default true,
  sort_order integer not null default 0,
  lead_question text,
  period_label text,
  territory_label text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by text,
  updated_by text
);

create table if not exists public.investigation_dossier_links (
  id uuid primary key default gen_random_uuid(),
  dossier_id uuid not null references public.investigation_dossiers (id) on delete cascade,
  link_type text not null check (link_type in ('editorial', 'memory', 'archive', 'collection', 'series')),
  link_key text not null,
  featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (dossier_id, link_type, link_key)
);

create index if not exists investigation_dossiers_public_idx
  on public.investigation_dossiers (public_visibility, status, featured, sort_order);

create index if not exists investigation_dossier_links_dossier_idx
  on public.investigation_dossier_links (dossier_id, featured, sort_order, created_at);

alter table public.investigation_dossiers enable row level security;
alter table public.investigation_dossier_links enable row level security;

insert into public.investigation_dossiers (title, slug, excerpt, description, status, cover_image_url, featured, public_visibility, sort_order, lead_question, period_label, territory_label, created_at, updated_at)
values
  (
    'Ar, fumaça e rotina industrial',
    'ar-fumaca-e-rotina-industrial',
    'Um dossiê vivo sobre poluição, corpo e custo cotidiano em volta da siderurgia.',
    'Este dossiê reúne pauta, memória e acervo para investigar o que o entorno industrial produz no ar, no bairro e no modo de viver a cidade.',
    'published',
    '/archive/assets/acervo-recorte-jornal.svg',
    true,
    true,
    1,
    'Quem paga o custo ambiental da cidade e como isso se naturalizou?',
    'Anos 1990-2020',
    'Aterrado e entorno industrial',
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    'Trabalho ferido, corpo insistente',
    'trabalho-ferido-corpo-insistente',
    'Investigação sobre acidente, desgaste e o que o trabalho deixa como marca pública.',
    'Dossiê sobre lesão, turno, pressão e a normalização do risco. Junta relato, documento e pauta para entender o problema como estrutura.',
    'published',
    '/archive/assets/acervo-relatorio.svg',
    true,
    true,
    2,
    'Quando o acidente deixa de ser exceção e vira rotina administrativa?',
    'Anos 2000-2020',
    'Volta Grande e bairros operários',
    timezone('utc', now()),
    timezone('utc', now())
  )
on conflict (slug) do nothing;

insert into public.investigation_dossier_links (dossier_id, link_type, link_key, featured, sort_order, created_at, updated_at)
select d.id, v.link_type, v.link_key, v.featured, v.sort_order, timezone('utc', now()), timezone('utc', now())
from public.investigation_dossiers d
join (
  values
    ('ar-fumaca-e-rotina-industrial', 'editorial', 'ar-poeira-e-pressao', true, 1),
    ('ar-fumaca-e-rotina-industrial', 'memory', 'poeira-e-fumaca', true, 2),
    ('ar-fumaca-e-rotina-industrial', 'archive', 'archive-mock-2', false, 3),
    ('ar-fumaca-e-rotina-industrial', 'collection', 'poluicao-e-industria', false, 4),
    ('ar-fumaca-e-rotina-industrial', 'series', 'poluicao-e-csn', false, 5),
    ('trabalho-ferido-corpo-insistente', 'editorial', 'turno-risco-e-lesao', true, 1),
    ('trabalho-ferido-corpo-insistente', 'memory', 'acidente-e-turno', true, 2),
    ('trabalho-ferido-corpo-insistente', 'archive', 'archive-mock-3', false, 3),
    ('trabalho-ferido-corpo-insistente', 'collection', 'trabalho-e-acidentes', false, 4),
    ('trabalho-ferido-corpo-insistente', 'series', 'trabalho-e-acidentes', false, 5)
) as v(slug, link_type, link_key, featured, sort_order)
  on d.slug = v.slug
on conflict (dossier_id, link_type, link_key) do nothing;

drop policy if exists "Public can read published dossiers" on public.investigation_dossiers;
create policy "Public can read published dossiers"
  on public.investigation_dossiers
  for select
  using (public_visibility = true and status = 'published');

drop policy if exists "Authenticated users can manage dossiers" on public.investigation_dossiers;
create policy "Authenticated users can manage dossiers"
  on public.investigation_dossiers
  for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Public can read dossier links" on public.investigation_dossier_links;
create policy "Public can read dossier links"
  on public.investigation_dossier_links
  for select
  using (
    exists (
      select 1
      from public.investigation_dossiers d
      where d.id = dossier_id
        and d.public_visibility = true
        and d.status = 'published'
    )
  );

drop policy if exists "Authenticated users can manage dossier links" on public.investigation_dossier_links;
create policy "Authenticated users can manage dossier links"
  on public.investigation_dossier_links
  for all
  to authenticated
  using (true)
  with check (true);
