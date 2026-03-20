create extension if not exists pgcrypto;

create table if not exists public.investigation_dossier_updates (
  id uuid primary key default gen_random_uuid(),
  dossier_id uuid not null references public.investigation_dossiers (id) on delete cascade,
  title text not null,
  slug text,
  excerpt text,
  body text not null,
  update_type text not null default 'note' check (update_type in ('development', 'evidence', 'monitoring', 'note', 'call', 'correction')),
  published boolean not null default false,
  published_at timestamptz,
  featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by text,
  updated_by text,
  unique (dossier_id, slug)
);

create index if not exists investigation_dossier_updates_dossier_idx
  on public.investigation_dossier_updates (dossier_id, published, featured, sort_order, published_at desc, created_at desc);

alter table public.investigation_dossier_updates enable row level security;

insert into public.investigation_dossier_updates (dossier_id, title, slug, excerpt, body, update_type, published, published_at, featured, sort_order, created_at, updated_at)
select d.id, v.title, v.slug, v.excerpt, v.body, v.update_type, v.published, v.published_at, v.featured, v.sort_order, timezone('utc', now()), timezone('utc', now())
from public.investigation_dossiers d
join (
  values
    ('ar-fumaca-e-rotina-industrial', 'nova-rodada-relatos-pressao-borda-industrial', 'Nova rodada de relatos reforça a pressão na borda industrial', 'Moradores voltaram a descrever poeira, odor e piora em horários de pico.', 'A investigação recebeu novos relatos no entorno do recorte principal. O material reforça a leitura de que o problema não é episódico: ele reaparece em horários previsíveis, atravessa rotinas de trabalho e volta a reorganizar o cotidiano do bairro.', 'development', true, '2026-03-18T18:30:00.000Z', true, 1),
    ('ar-fumaca-e-rotina-industrial', 'documento-apoio-confirma-linha-tempo-recorte', 'Documento de apoio confirma a linha de tempo do recorte', 'Um anexo de arquivo ajuda a costurar a cronologia pública do caso.', 'A checagem do documento-base confirmou a sequência temporal que já aparecia em relatos e memórias territoriais. O dossiê segue em aberto para receber novas pistas e localizar o lastro material do problema.', 'evidence', true, '2026-03-17T11:00:00.000Z', false, 2),
    ('ar-fumaca-e-rotina-industrial', 'seguimos-recebendo-pistas-ponto-maior-impacto', 'Seguimos recebendo pistas sobre o ponto de maior impacto', 'Quem tiver relato, documento ou foto pode ajudar a fechar a próxima etapa.', 'Há uma etapa ainda em aberto sobre a concentração do impacto no território. Se você tem documento, relato ou material visual, o canal de envio continua disponível para cruzamento editorial.', 'call', true, '2026-03-19T09:00:00.000Z', false, 3),
    ('trabalho-ferido-corpo-insistente', 'nova-fala-trabalhador-normalizacao-risco', 'Nova fala de trabalhador reforça a normalização do risco', 'A rotina do turno continua aparecendo como zona de pressão contínua.', 'O dossiê recebeu um novo relato que mostra como a pressão do turno não aparece apenas no acidente: ela se espalha pela preparação, pela expectativa de produção e pela gestão do tempo de trabalho.', 'monitoring', true, '2026-03-18T14:20:00.000Z', true, 1),
    ('trabalho-ferido-corpo-insistente', 'correcao-trecho-data-registro', 'Correção de trecho sobre a data de um registro', 'Um registro anterior foi corrigido para manter a cronologia fiel.', 'Corrigimos a data de um trecho relacionado ao arquivo de apoio. A mudança não altera a hipótese central; ela apenas ajusta a leitura temporal para evitar ruído e preservar precisão editorial.', 'correction', true, '2026-03-19T10:10:00.000Z', false, 2),
    ('cidade-e-abandono', 'investigacao-concluida-desgaste-urbano-continua', 'A investigação foi concluída, mas o desgaste urbano continua', 'O dossiê fecha uma etapa e deixa o arquivo aberto para desdobramentos futuros.', 'Este recorte chegou a uma conclusão editorial sobre o estado do abandono em partes da cidade. Ainda assim, o tema continua vivo como arquivo: novos documentos ou relatos podem reabrir partes do percurso em outra linha investigativa.', 'note', true, '2026-03-16T15:00:00.000Z', true, 1)
) as v(slug_dossier, slug, title, excerpt, body, update_type, published, published_at, featured, sort_order)
  on d.slug = v.slug_dossier
on conflict (dossier_id, slug) do nothing;

drop policy if exists "Public can read published dossier updates" on public.investigation_dossier_updates;
create policy "Public can read published dossier updates"
  on public.investigation_dossier_updates
  for select
  using (
    published = true
    and exists (
      select 1
      from public.investigation_dossiers d
      where d.id = dossier_id
        and d.public_visibility = true
        and d.status <> 'draft'
    )
  );

drop policy if exists "Authenticated users can manage dossier updates" on public.investigation_dossier_updates;
create policy "Authenticated users can manage dossier updates"
  on public.investigation_dossier_updates
  for all
  to authenticated
  using (true)
  with check (true);
