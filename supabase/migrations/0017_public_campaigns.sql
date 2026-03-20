create extension if not exists pgcrypto;

create table if not exists public.public_campaigns (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  description text,
  status text not null default 'upcoming' check (status in ('upcoming', 'active', 'monitoring', 'closed', 'archived')),
  campaign_type text not null default 'call' check (campaign_type in ('call', 'collection', 'pressure', 'memory', 'support', 'investigation')),
  lead_question text,
  start_date date,
  end_date date,
  cover_image_url text,
  featured boolean not null default false,
  public_visibility boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by text,
  updated_by text
);

create index if not exists public_campaigns_status_idx on public.public_campaigns (status);
create index if not exists public_campaigns_featured_idx on public.public_campaigns (featured);
create index if not exists public_campaigns_sort_order_idx on public.public_campaigns (sort_order);
create index if not exists public_campaigns_public_visibility_idx on public.public_campaigns (public_visibility);

create table if not exists public.public_campaign_links (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.public_campaigns (id) on delete cascade,
  link_type text not null check (link_type in ('editorial', 'memory', 'archive', 'collection', 'dossier', 'series', 'hub', 'page', 'external')),
  link_key text not null,
  link_role text not null default 'context' check (link_role in ('lead', 'evidence', 'context', 'followup', 'archive')),
  note text,
  featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists public_campaign_links_unique_idx
  on public.public_campaign_links (campaign_id, link_type, link_key, link_role, sort_order);

create index if not exists public_campaign_links_campaign_id_idx on public.public_campaign_links (campaign_id);
create index if not exists public_campaign_links_sort_order_idx on public.public_campaign_links (sort_order);

create or replace function public.set_public_campaigns_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create trigger public_campaigns_set_updated_at
before update on public.public_campaigns
for each row
execute function public.set_public_campaigns_updated_at();

create or replace function public.set_public_campaign_links_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create trigger public_campaign_links_set_updated_at
before update on public.public_campaign_links
for each row
execute function public.set_public_campaign_links_updated_at();

alter table public.public_campaigns enable row level security;
alter table public.public_campaign_links enable row level security;

drop policy if exists "Public campaigns are visible when published" on public.public_campaigns;
create policy "Public campaigns are visible when published"
  on public.public_campaigns
  for select
  using (public_visibility = true);

drop policy if exists "Public campaign links are visible when campaign is public" on public.public_campaign_links;
create policy "Public campaign links are visible when campaign is public"
  on public.public_campaign_links
  for select
  using (
    exists (
      select 1
      from public.public_campaigns campaign
      where campaign.id = campaign_id and campaign.public_visibility = true
    )
  );

drop policy if exists "Authenticated users can manage campaigns" on public.public_campaigns;
create policy "Authenticated users can manage campaigns"
  on public.public_campaigns
  for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated users can manage campaign links" on public.public_campaign_links;
create policy "Authenticated users can manage campaign links"
  on public.public_campaign_links
  for all
  to authenticated
  using (true)
  with check (true);

insert into public.public_campaigns (
  title,
  slug,
  excerpt,
  description,
  status,
  campaign_type,
  lead_question,
  start_date,
  end_date,
  cover_image_url,
  featured,
  public_visibility,
  sort_order
)
values
  (
    'Respira Volta Redonda',
    'respira-volta-redonda',
    'Chamado público sobre ar, fumaça e impacto industrial no cotidiano da cidade.',
    'Uma campanha temporária para condensar investigação, relato, memória e acervo em torno da poluição e da experiência de respirar a cidade. Ela serve para reunir documentos, escutar quem vive o problema e puxar leitura responsável para o projeto.',
    'active',
    'call',
    'O que a cidade está respirando quando a fumaça vira costume?',
    '2026-03-19',
    null,
    '/editorial/covers/arquivo-inicial.svg',
    true,
    true,
    1
  ),
  (
    'Trabalho sob observação',
    'trabalho-sob-observacao',
    'Linha de acompanhamento sobre risco, lesão e normalização do desgaste no trabalho.',
    'Uma campanha de monitoramento para reunir novos relatos, documentos e retornos ligados a acidentes e à rotina laboral. O foco é manter o caso em circulação pública sem transformar o gesto em promessa privada de acompanhamento.',
    'monitoring',
    'investigation',
    'O que falta ver quando o acidente é tratado como rotina?',
    '2026-03-19',
    null,
    '/editorial/covers/arquivo-inicial.svg',
    false,
    true,
    2
  )
on conflict (slug) do update set
  excerpt = excluded.excerpt,
  description = excluded.description,
  status = excluded.status,
  campaign_type = excluded.campaign_type,
  lead_question = excluded.lead_question,
  start_date = excluded.start_date,
  end_date = excluded.end_date,
  cover_image_url = excluded.cover_image_url,
  featured = excluded.featured,
  public_visibility = excluded.public_visibility,
  sort_order = excluded.sort_order;

insert into public.public_campaign_links (campaign_id, link_type, link_key, link_role, note, featured, sort_order)
select campaign.id, 'editorial', 'ar-poeira-e-pressao', 'lead', 'Pauta de entrada para o chamado.', true, 1
from public.public_campaigns campaign
where campaign.slug = 'respira-volta-redonda'
on conflict (campaign_id, link_type, link_key, link_role, sort_order) do nothing;

insert into public.public_campaign_links (campaign_id, link_type, link_key, link_role, note, featured, sort_order)
select campaign.id, 'dossier', 'ar-fumaca-e-rotina-industrial', 'context', 'Dossiê que organiza a investigação de base.', true, 2
from public.public_campaigns campaign
where campaign.slug = 'respira-volta-redonda'
on conflict (campaign_id, link_type, link_key, link_role, sort_order) do nothing;

insert into public.public_campaign_links (campaign_id, link_type, link_key, link_role, note, featured, sort_order)
select campaign.id, 'hub', 'poluicao-e-csn', 'context', 'Eixo maior que sustenta o foco do momento.', false, 3
from public.public_campaigns campaign
where campaign.slug = 'respira-volta-redonda'
on conflict (campaign_id, link_type, link_key, link_role, sort_order) do nothing;

insert into public.public_campaign_links (campaign_id, link_type, link_key, link_role, note, featured, sort_order)
select campaign.id, 'memory', 'poeira-e-fumaca', 'archive', 'Memória que ajuda a entender a duração do problema.', false, 4
from public.public_campaigns campaign
where campaign.slug = 'respira-volta-redonda'
on conflict (campaign_id, link_type, link_key, link_role, sort_order) do nothing;

insert into public.public_campaign_links (campaign_id, link_type, link_key, link_role, note, featured, sort_order)
select campaign.id, 'archive', 'archive-mock-2', 'evidence', 'Documento-base do acervo.', false, 5
from public.public_campaigns campaign
where campaign.slug = 'respira-volta-redonda'
on conflict (campaign_id, link_type, link_key, link_role, sort_order) do nothing;

insert into public.public_campaign_links (campaign_id, link_type, link_key, link_role, note, featured, sort_order)
select campaign.id, 'page', 'envie', 'followup', 'Canal público de envio para relatos e pistas.', false, 6
from public.public_campaigns campaign
where campaign.slug = 'respira-volta-redonda'
on conflict (campaign_id, link_type, link_key, link_role, sort_order) do nothing;

insert into public.public_campaign_links (campaign_id, link_type, link_key, link_role, note, featured, sort_order)
select campaign.id, 'page', 'metodo', 'followup', 'Método e cuidado editorial do projeto.', false, 7
from public.public_campaigns campaign
where campaign.slug = 'respira-volta-redonda'
on conflict (campaign_id, link_type, link_key, link_role, sort_order) do nothing;

insert into public.public_campaign_links (campaign_id, link_type, link_key, link_role, note, featured, sort_order)
select campaign.id, 'page', 'participe', 'followup', 'Outras formas de colaboração pública.', false, 8
from public.public_campaigns campaign
where campaign.slug = 'respira-volta-redonda'
on conflict (campaign_id, link_type, link_key, link_role, sort_order) do nothing;

insert into public.public_campaign_links (campaign_id, link_type, link_key, link_role, note, featured, sort_order)
select campaign.id, 'page', 'apoie', 'followup', 'Sustentação do projeto.', false, 9
from public.public_campaigns campaign
where campaign.slug = 'respira-volta-redonda'
on conflict (campaign_id, link_type, link_key, link_role, sort_order) do nothing;

insert into public.public_campaign_links (campaign_id, link_type, link_key, link_role, note, featured, sort_order)
select campaign.id, 'dossier', 'trabalho-ferido-corpo-insistente', 'lead', 'Caso principal do monitoramento.', true, 1
from public.public_campaigns campaign
where campaign.slug = 'trabalho-sob-observacao'
on conflict (campaign_id, link_type, link_key, link_role, sort_order) do nothing;

insert into public.public_campaign_links (campaign_id, link_type, link_key, link_role, note, featured, sort_order)
select campaign.id, 'editorial', 'turno-risco-e-lesao', 'evidence', 'Pauta atual que mantém o caso vivo.', true, 2
from public.public_campaigns campaign
where campaign.slug = 'trabalho-sob-observacao'
on conflict (campaign_id, link_type, link_key, link_role, sort_order) do nothing;

insert into public.public_campaign_links (campaign_id, link_type, link_key, link_role, note, featured, sort_order)
select campaign.id, 'hub', 'trabalho-e-acidentes', 'context', 'Eixo temático maior.', false, 3
from public.public_campaigns campaign
where campaign.slug = 'trabalho-sob-observacao'
on conflict (campaign_id, link_type, link_key, link_role, sort_order) do nothing;

insert into public.public_campaign_links (campaign_id, link_type, link_key, link_role, note, featured, sort_order)
select campaign.id, 'memory', 'acidente-e-turno', 'archive', 'Memória que sustenta o contexto histórico.', false, 4
from public.public_campaigns campaign
where campaign.slug = 'trabalho-sob-observacao'
on conflict (campaign_id, link_type, link_key, link_role, sort_order) do nothing;

insert into public.public_campaign_links (campaign_id, link_type, link_key, link_role, note, featured, sort_order)
select campaign.id, 'archive', 'archive-mock-3', 'evidence', 'Documento-base do acervo.', false, 5
from public.public_campaigns campaign
where campaign.slug = 'trabalho-sob-observacao'
on conflict (campaign_id, link_type, link_key, link_role, sort_order) do nothing;

insert into public.public_campaign_links (campaign_id, link_type, link_key, link_role, note, featured, sort_order)
select campaign.id, 'page', 'agora', 'followup', 'Radar vivo do projeto.', false, 6
from public.public_campaigns campaign
where campaign.slug = 'trabalho-sob-observacao'
on conflict (campaign_id, link_type, link_key, link_role, sort_order) do nothing;
