create extension if not exists pgcrypto;

alter table public.investigation_dossiers
  drop constraint if exists investigation_dossiers_status_check;

alter table public.investigation_dossiers
  add constraint investigation_dossiers_status_check
  check (status in ('draft', 'in_progress', 'monitoring', 'concluded', 'archived'));

alter table public.investigation_dossier_links
  add column if not exists link_role text not null default 'context';

alter table public.investigation_dossier_links
  add column if not exists timeline_year integer;

alter table public.investigation_dossier_links
  add column if not exists timeline_label text;

alter table public.investigation_dossier_links
  add column if not exists timeline_note text;

alter table public.investigation_dossier_links
  drop constraint if exists investigation_dossier_links_link_role_check;

alter table public.investigation_dossier_links
  add constraint investigation_dossier_links_link_role_check
  check (link_role in ('lead', 'evidence', 'context', 'followup', 'archive'));

update public.investigation_dossiers
set status = case slug
  when 'ar-fumaca-e-rotina-industrial' then 'in_progress'
  when 'trabalho-ferido-corpo-insistente' then 'monitoring'
  when 'cidade-e-abandono' then 'concluded'
  else status
end,
updated_at = timezone('utc', now())
where slug in ('ar-fumaca-e-rotina-industrial', 'trabalho-ferido-corpo-insistente', 'cidade-e-abandono');

update public.investigation_dossier_links
set link_role = v.link_role,
    timeline_year = v.timeline_year,
    timeline_label = v.timeline_label,
    timeline_note = v.timeline_note,
    updated_at = timezone('utc', now())
from (
  values
    ('dossier-link-1', 'lead', 2024, '2024', 'Entrada principal da investigação sobre poeira, pressão e custo cotidiano.'),
    ('dossier-link-2', 'context', 1997, 'fim dos anos 1990', 'Memória territorial sobre a permanência da fumaça no bairro.'),
    ('dossier-link-3', 'evidence', 2008, '2008', 'Documento-base ligado a poeira industrial e pressão cotidiana.'),
    ('dossier-link-4', 'archive', 2016, '2016', 'Coleção que concentra o recorte documental da poluição.'),
    ('dossier-link-5', 'followup', 2025, '2025', 'Linha em curso que mantém a pergunta aberta.'),
    ('dossier-link-6', 'lead', 2025, '2025', 'Peça central sobre acidente, turno e desgaste corporal.'),
    ('dossier-link-7', 'context', 2004, '2004', 'Memória sobre a normalização do risco no turno.'),
    ('dossier-link-8', 'evidence', 2010, '2010', 'Arquivo que sustenta a leitura sobre lesão e pressão.'),
    ('dossier-link-9', 'archive', 2018, '2018', 'Coleção de documentos e recortes sobre acidentes e trabalho.'),
    ('dossier-link-10', 'followup', 2026, '2026', 'Desdobramento público do caso no tempo presente.'),
    ('dossier-link-11', 'lead', 2026, '2026', 'Entrada central do dossiê sobre abandono urbano.'),
    ('dossier-link-12', 'context', 1990, 'anos 1990', 'Memória sobre apagamentos e disputa do território.'),
    ('dossier-link-13', 'evidence', 2012, '2012', 'Fonte documental sobre a cidade deixada em suspenso.'),
    ('dossier-link-14', 'archive', 2019, '2019', 'Coleção que concentra o recorte urbano-operário.'),
    ('dossier-link-15', 'followup', 2026, '2026', 'Linha de continuidade do abandono urbano.')
) as v(id, link_role, timeline_year, timeline_label, timeline_note)
  on public.investigation_dossier_links.id = v.id;

insert into public.investigation_dossiers (title, slug, excerpt, description, status, cover_image_url, featured, public_visibility, sort_order, lead_question, period_label, territory_label, created_at, updated_at)
values
  (
    'Ar, fumaça e rotina industrial',
    'ar-fumaca-e-rotina-industrial',
    'Um dossiê vivo sobre poluição, corpo e custo cotidiano em volta da siderurgia.',
    'Este dossiê reúne pauta, memória e acervo para investigar o que o entorno industrial produz no ar, no bairro e no modo de viver a cidade.',
    'in_progress',
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
    'monitoring',
    '/archive/assets/acervo-relatorio.svg',
    true,
    true,
    2,
    'Quando o acidente deixa de ser exceção e vira rotina administrativa?',
    'Anos 2000-2020',
    'Volta Grande e bairros operários',
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    'Cidade e abandono',
    'cidade-e-abandono',
    'Como o desgaste urbano reorganiza o acesso à cidade e normaliza a espera.',
    'Dossiê sobre transporte, saneamento, equipamentos públicos e o modo como a manutenção falha no cotidiano.',
    'concluded',
    '/archive/assets/acervo-foto-oficina.svg',
    false,
    true,
    3,
    'O que a cidade deixa cair quando o abandono vira política normal?',
    'Anos 2010-2026',
    'Centro e bairros espraiados',
    timezone('utc', now()),
    timezone('utc', now())
  )
on conflict (slug) do nothing;

insert into public.investigation_dossier_links (dossier_id, link_type, link_key, link_role, timeline_year, timeline_label, timeline_note, featured, sort_order, created_at, updated_at)
select d.id, v.link_type, v.link_key, v.link_role, v.timeline_year, v.timeline_label, v.timeline_note, v.featured, v.sort_order, timezone('utc', now()), timezone('utc', now())
from public.investigation_dossiers d
join (
  values
    ('ar-fumaca-e-rotina-industrial', 'editorial', 'ar-poeira-e-pressao', 'lead', 2024, '2024', 'Entrada principal da investigação sobre poeira, pressão e custo cotidiano.', true, 1),
    ('ar-fumaca-e-rotina-industrial', 'memory', 'poeira-e-fumaca', 'context', 1997, 'fim dos anos 1990', 'Memória territorial sobre a permanência da fumaça no bairro.', true, 2),
    ('ar-fumaca-e-rotina-industrial', 'archive', 'archive-mock-2', 'evidence', 2008, '2008', 'Documento-base ligado a poeira industrial e pressão cotidiana.', false, 3),
    ('ar-fumaca-e-rotina-industrial', 'collection', 'poluicao-e-industria', 'archive', 2016, '2016', 'Coleção que concentra o recorte documental da poluição.', false, 4),
    ('ar-fumaca-e-rotina-industrial', 'series', 'poluicao-e-csn', 'followup', 2025, '2025', 'Linha em curso que mantém a pergunta aberta.', false, 5),
    ('trabalho-ferido-corpo-insistente', 'editorial', 'turno-risco-e-lesao', 'lead', 2025, '2025', 'Peça central sobre acidente, turno e desgaste corporal.', true, 1),
    ('trabalho-ferido-corpo-insistente', 'memory', 'acidente-e-turno', 'context', 2004, '2004', 'Memória sobre a normalização do risco no turno.', true, 2),
    ('trabalho-ferido-corpo-insistente', 'archive', 'archive-mock-3', 'evidence', 2010, '2010', 'Arquivo que sustenta a leitura sobre lesão e pressão.', false, 3),
    ('trabalho-ferido-corpo-insistente', 'collection', 'trabalho-e-acidentes', 'archive', 2018, '2018', 'Coleção de documentos e recortes sobre acidentes e trabalho.', false, 4),
    ('trabalho-ferido-corpo-insistente', 'series', 'trabalho-e-acidentes', 'followup', 2026, '2026', 'Desdobramento público do caso no tempo presente.', false, 5),
    ('cidade-e-abandono', 'editorial', 'o-que-sobrou-da-promessa-industrial', 'lead', 2026, '2026', 'Entrada central do dossiê sobre abandono urbano.', true, 1),
    ('cidade-e-abandono', 'memory', 'apagamentos-e-disputas', 'context', 1990, 'anos 1990', 'Memória sobre apagamentos e disputa do território.', true, 2),
    ('cidade-e-abandono', 'archive', 'archive-mock-1', 'evidence', 2012, '2012', 'Fonte documental sobre a cidade deixada em suspenso.', false, 3),
    ('cidade-e-abandono', 'collection', 'cidade-operaria', 'archive', 2019, '2019', 'Coleção que concentra o recorte urbano-operário.', false, 4),
    ('cidade-e-abandono', 'series', 'cidade-e-abandono', 'followup', 2026, '2026', 'Linha de continuidade do abandono urbano.', false, 5)
) as v(slug, link_type, link_key, link_role, timeline_year, timeline_label, timeline_note, featured, sort_order)
  on d.slug = v.slug
on conflict (dossier_id, link_type, link_key) do nothing;

drop policy if exists "Public can read published dossiers" on public.investigation_dossiers;
create policy "Public can read published dossiers"
  on public.investigation_dossiers
  for select
  using (public_visibility = true and status <> 'draft');

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
        and d.status <> 'draft'
    )
  );

drop policy if exists "Authenticated users can manage dossier links" on public.investigation_dossier_links;
create policy "Authenticated users can manage dossier links"
  on public.investigation_dossier_links
  for all
  to authenticated
  using (true)
  with check (true);
