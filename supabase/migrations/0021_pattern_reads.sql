create extension if not exists pgcrypto;

create table if not exists public.pattern_reads (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  description text,
  pattern_type text not null
    check (pattern_type in ('actor_recurrence', 'territory_recurrence', 'impact_pattern', 'thematic_pattern', 'institution_pattern', 'archive_pattern', 'continuity', 'dispute')),
  lead_question text,
  status text not null default 'draft'
    check (status in ('active', 'monitoring', 'archive', 'draft')),
  cover_image_url text,
  featured boolean not null default false,
  public_visibility boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by text,
  updated_by text
);

create table if not exists public.pattern_read_links (
  id uuid primary key default gen_random_uuid(),
  pattern_read_id uuid not null references public.pattern_reads(id) on delete cascade,
  link_type text not null
    check (link_type in ('editorial', 'memory', 'archive', 'collection', 'dossier', 'campaign', 'impact', 'hub', 'territory', 'actor', 'page', 'external')),
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

create index if not exists pattern_reads_public_visibility_idx on public.pattern_reads (public_visibility);
create index if not exists pattern_reads_status_idx on public.pattern_reads (status);
create index if not exists pattern_reads_featured_idx on public.pattern_reads (featured);
create index if not exists pattern_reads_sort_order_idx on public.pattern_reads (sort_order);
create index if not exists pattern_read_links_pattern_read_id_idx on public.pattern_read_links (pattern_read_id);
create index if not exists pattern_read_links_featured_idx on public.pattern_read_links (featured);
create index if not exists pattern_read_links_sort_order_idx on public.pattern_read_links (sort_order);

alter table public.pattern_reads enable row level security;
alter table public.pattern_read_links enable row level security;

create policy "Public can read published pattern reads"
  on public.pattern_reads
  for select
  using (public_visibility = true and status <> 'draft');

create policy "Authenticated users can manage pattern reads"
  on public.pattern_reads
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Public can read pattern read links for published pattern reads"
  on public.pattern_read_links
  for select
  using (
    exists (
      select 1
      from public.pattern_reads
      where pattern_reads.id = pattern_read_links.pattern_read_id
        and pattern_reads.public_visibility = true
        and pattern_reads.status <> 'draft'
    )
  );

create policy "Authenticated users can manage pattern read links"
  on public.pattern_read_links
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

insert into public.pattern_reads (
  title, slug, excerpt, description, pattern_type, lead_question, status, cover_image_url, featured, public_visibility, sort_order, created_at, updated_at
) values
  (
    'A poeira que volta',
    'a-poeira-que-volta',
    'A recorrência da fumaça e da poeira industrial organiza uma parte central da disputa pública da cidade.',
    'O padrão reúne casos, memória e impacto para mostrar que ar, fumaça e entorno industrial não aparecem como episódio isolado. Eles voltam como experiência territorial, corpo desgastado e conflito repetido.',
    'actor_recurrence',
    'Por que a poeira industrial reaparece em pautas, memórias e efeitos públicos ao longo do tempo?',
    'active',
    '/editorial/covers/arquivo-inicial.svg',
    true,
    true,
    1,
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    'Centro, espera e abandono',
    'centro-espera-e-abandono',
    'Obras, filas e fricções urbanas se repetem no centro e em pontos de passagem da cidade.',
    'Este padrão lê como o abandono urbano volta a aparecer nos mesmos lugares: centro, rodoviária, praças, circulação e serviços públicos. O conflito muda de nome, mas conserva a forma.',
    'territory_recurrence',
    'O que o centro da cidade repete quando a resposta pública demora?',
    'monitoring',
    '/archive/assets/acervo-mapa.svg',
    true,
    true,
    2,
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    'Saúde, espera e desgaste',
    'saude-espera-e-desgaste',
    'Fila, distância e atendimento fragmentado voltam como padrão de consequência pública.',
    'O padrão organiza a repetição de pressão sobre a rede de saúde, mostrando como a espera se transforma em rotina e como o desgaste atravessa trabalho, ambiente e cuidado.',
    'institution_pattern',
    'Quem absorve a espera quando a saúde vira rotina de desgaste?',
    'active',
    '/archive/assets/acervo-relatorio.svg',
    false,
    true,
    3,
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    'O arquivo que retorna',
    'o-arquivo-que-retorna',
    'Memória, documento e correção reaparecem como consequência pública e não como nota lateral.',
    'Este padrão mostra como a reativação do arquivo produz movimento: correção, reposicionamento, novos vínculos e confirmação de que a memória da cidade não está encerrada.',
    'archive_pattern',
    'Quando o arquivo volta a falar, o que se corrige e o que continua em disputa?',
    'archive',
    '/archive/assets/acervo-foto-oficina.svg',
    false,
    true,
    4,
    timezone('utc', now()),
    timezone('utc', now())
  );

insert into public.pattern_read_links (
  pattern_read_id, link_type, link_key, link_role, timeline_year, timeline_label, timeline_note, featured, sort_order, created_at, updated_at
) values
  ((select id from public.pattern_reads where slug = 'a-poeira-que-volta'), 'actor', 'companhia-siderurgica-nacional', 'lead', 2026, '2026', 'Ator recorrente que organiza a linha de conflito industrial.', true, 1, timezone('utc', now()), timezone('utc', now())),
  ((select id from public.pattern_reads where slug = 'a-poeira-que-volta'), 'territory', 'csn-e-entorno', 'context', 2026, '2026', 'Entorno industrial como lugar onde a recorrência se torna visível.', true, 2, timezone('utc', now()), timezone('utc', now())),
  ((select id from public.pattern_reads where slug = 'a-poeira-que-volta'), 'editorial', 'ar-poeira-e-pressao', 'evidence', 2026, '2026', 'Pauta que dá entrada pública ao tema.', false, 3, timezone('utc', now()), timezone('utc', now())),
  ((select id from public.pattern_reads where slug = 'a-poeira-que-volta'), 'dossier', 'ar-fumaca-e-rotina-industrial', 'context', 2026, '2026', 'Dossiê que junta documentos e recorrência.', false, 4, timezone('utc', now()), timezone('utc', now())),
  ((select id from public.pattern_reads where slug = 'a-poeira-que-volta'), 'campaign', 'respira-volta-redonda', 'followup', 2026, '2026', 'Chamado público que condensa a frente temporária.', false, 5, timezone('utc', now()), timezone('utc', now())),
  ((select id from public.pattern_reads where slug = 'a-poeira-que-volta'), 'impact', 'respira-volta-redonda', 'followup', 2026, '2026', 'Efeito observado da mobilização.', false, 6, timezone('utc', now()), timezone('utc', now())),
  ((select id from public.pattern_reads where slug = 'centro-espera-e-abandono'), 'territory', 'praca-savio-gama', 'lead', 2026, '2026', 'Marco urbano do centro e da disputa por forma pública.', true, 1, timezone('utc', now()), timezone('utc', now())),
  ((select id from public.pattern_reads where slug = 'centro-espera-e-abandono'), 'territory', 'rodoviaria-nova', 'evidence', 2026, '2026', 'Lugar de fricção e espera repetida.', true, 2, timezone('utc', now()), timezone('utc', now())),
  ((select id from public.pattern_reads where slug = 'centro-espera-e-abandono'), 'editorial', 'o-que-sobrou-da-promessa-industrial', 'context', 2026, '2026', 'Pauta que liga promessa e ruína urbana.', false, 3, timezone('utc', now()), timezone('utc', now())),
  ((select id from public.pattern_reads where slug = 'centro-espera-e-abandono'), 'dossier', 'cidade-e-abandono', 'context', 2026, '2026', 'Dossiê que amarra o centro ao abandono urbano.', false, 4, timezone('utc', now()), timezone('utc', now())),
  ((select id from public.pattern_reads where slug = 'centro-espera-e-abandono'), 'campaign', 'trabalho-sob-observacao', 'followup', 2026, '2026', 'Chamado que mantém o caso em circulação.', false, 5, timezone('utc', now()), timezone('utc', now())),
  ((select id from public.pattern_reads where slug = 'centro-espera-e-abandono'), 'impact', 'arquivo-que-volta-a-falar', 'followup', 2026, '2026', 'Consequência pública ligada à memória reativada.', false, 6, timezone('utc', now()), timezone('utc', now())),
  ((select id from public.pattern_reads where slug = 'saude-espera-e-desgaste'), 'actor', 'hospital-sao-joao-batista', 'lead', 2026, '2026', 'Equipamento público onde o desgaste vira rotina.', true, 1, timezone('utc', now()), timezone('utc', now())),
  ((select id from public.pattern_reads where slug = 'saude-espera-e-desgaste'), 'actor', 'secretaria-municipal-de-saude', 'context', 2026, '2026', 'Área administrativa que responde ou falha em público.', true, 2, timezone('utc', now()), timezone('utc', now())),
  ((select id from public.pattern_reads where slug = 'saude-espera-e-desgaste'), 'editorial', 'linha-tarifa-e-espera', 'evidence', 2026, '2026', 'Pauta que mostra a espera na cidade.', false, 3, timezone('utc', now()), timezone('utc', now())),
  ((select id from public.pattern_reads where slug = 'saude-espera-e-desgaste'), 'dossier', 'trabalho-ferido-corpo-insistente', 'context', 2026, '2026', 'Dossiê que conecta trabalho e consequência física.', false, 4, timezone('utc', now()), timezone('utc', now())),
  ((select id from public.pattern_reads where slug = 'saude-espera-e-desgaste'), 'territory', 'hospital-sao-joao-batista', 'context', 2026, '2026', 'Lugar onde a consequência pública se materializa.', false, 5, timezone('utc', now()), timezone('utc', now())),
  ((select id from public.pattern_reads where slug = 'saude-espera-e-desgaste'), 'impact', 'trabalho-sob-observacao', 'followup', 2026, '2026', 'Impacto ligado à monitoria do caso.', false, 6, timezone('utc', now()), timezone('utc', now())),
  ((select id from public.pattern_reads where slug = 'o-arquivo-que-retorna'), 'memory', 'apagamentos-do-centro', 'lead', 1985, '1985', 'Memória que ajuda a ler a cidade em apagamento.', true, 1, timezone('utc', now()), timezone('utc', now())),
  ((select id from public.pattern_reads where slug = 'o-arquivo-que-retorna'), 'collection', 'apagamentos-da-memoria', 'evidence', 2026, '2026', 'Coleção pública que agrupa o recorte.', true, 2, timezone('utc', now()), timezone('utc', now())),
  ((select id from public.pattern_reads where slug = 'o-arquivo-que-retorna'), 'page', '/acervo', 'archive', 2026, '2026', 'Entrada pública para o arquivo vivo.', false, 3, timezone('utc', now()), timezone('utc', now())),
  ((select id from public.pattern_reads where slug = 'o-arquivo-que-retorna'), 'hub', 'memoria-de-volta-redonda', 'context', 2026, '2026', 'Eixo de memória maior que enquadra o retorno do arquivo.', false, 4, timezone('utc', now()), timezone('utc', now())),
  ((select id from public.pattern_reads where slug = 'o-arquivo-que-retorna'), 'editorial', 'arquivo-que-volta-a-falar', 'followup', 2026, '2026', 'Pauta que reabre o arquivo para o presente.', false, 5, timezone('utc', now()), timezone('utc', now())),
  ((select id from public.pattern_reads where slug = 'o-arquivo-que-retorna'), 'impact', 'arquivo-que-volta-a-falar', 'followup', 2026, '2026', 'Consequência pública ligada à reativação do arquivo.', false, 6, timezone('utc', now()), timezone('utc', now()));
