create extension if not exists pgcrypto;

create table if not exists public.actor_hubs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  description text,
  lead_question text,
  actor_type text not null,
  territory_label text,
  cover_image_url text,
  featured boolean not null default false,
  public_visibility boolean not null default false,
  status text not null default 'draft'
    check (status in ('active', 'monitoring', 'archive', 'draft')),
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by text,
  updated_by text
);

create table if not exists public.actor_hub_links (
  id uuid primary key default gen_random_uuid(),
  actor_hub_id uuid not null references public.actor_hubs(id) on delete cascade,
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

create index if not exists actor_hubs_public_visibility_idx on public.actor_hubs (public_visibility);
create index if not exists actor_hubs_status_idx on public.actor_hubs (status);
create index if not exists actor_hubs_featured_idx on public.actor_hubs (featured);
create index if not exists actor_hubs_sort_order_idx on public.actor_hubs (sort_order);
create index if not exists actor_hub_links_actor_hub_id_idx on public.actor_hub_links (actor_hub_id);
create index if not exists actor_hub_links_featured_idx on public.actor_hub_links (featured);
create index if not exists actor_hub_links_sort_order_idx on public.actor_hub_links (sort_order);

alter table public.actor_hubs enable row level security;
alter table public.actor_hub_links enable row level security;

create policy "Public can read published actor hubs"
  on public.actor_hubs
  for select
  using (public_visibility = true and status <> 'draft');

create policy "Authenticated users can manage actor hubs"
  on public.actor_hubs
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Public can read actor hub links for published hubs"
  on public.actor_hub_links
  for select
  using (
    exists (
      select 1
      from public.actor_hubs
      where actor_hubs.id = actor_hub_links.actor_hub_id
        and actor_hubs.public_visibility = true
        and actor_hubs.status <> 'draft'
    )
  );

create policy "Authenticated users can manage actor hub links"
  on public.actor_hub_links
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

insert into public.actor_hubs (
  title, slug, excerpt, description, lead_question, actor_type, territory_label, cover_image_url, featured, public_visibility, status, sort_order, created_at, updated_at
) values
  (
    'Companhia Siderúrgica Nacional',
    'companhia-siderurgica-nacional',
    'Empresa-símbolo da siderurgia e da disputa ambiental da cidade.',
    'A CSN atravessa o arquivo do VR Abandonada como ator recorrente de conflito, memória e consequência pública. Ela ajuda a ler o cruzamento entre indústria, bairro, saúde e meio ambiente.',
    'Como uma empresa molda ar, bairro e rotina sem desaparecer do debate público?',
    'empresa',
    'Cidade e entorno industrial',
    '/editorial/covers/arquivo-inicial.svg',
    true,
    true,
    'active',
    1,
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    'Prefeitura Municipal de Volta Redonda',
    'prefeitura-municipal-de-volta-redonda',
    'Poder executivo local que atravessa obras, filas, manutenção e abandono urbano.',
    'A prefeitura aparece como agente de decisão e também como campo de resposta pública. O projeto a lê como responsável por parte importante da forma urbana e da prestação de serviços.',
    'O que muda quando a cidade espera resposta do poder local?',
    'orgao_publico',
    'Centro administrativo',
    '/archive/assets/acervo-mapa.svg',
    true,
    true,
    'monitoring',
    2,
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    'Hospital São João Batista',
    'hospital-sao-joao-batista',
    'Equipamento público onde saúde, fila e desgaste ganham forma concreta.',
    'O hospital organiza uma parte importante da leitura sobre cuidado, urgência e consequência do trabalho e do ambiente na vida urbana. Ele entra como lugar de responsabilidade pública e de pressão cotidiana.',
    'O que a cidade joga para dentro da fila do hospital?',
    'hospital',
    'Cidade do cuidado',
    '/archive/assets/acervo-relatorio.svg',
    false,
    true,
    'active',
    3,
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    'Secretaria Municipal de Saúde',
    'secretaria-municipal-de-saude',
    'Área administrativa que mostra como a rede de cuidado responde ou falha em público.',
    'A secretaria entra como peça estrutural para ler orçamento, prioridade, fila e cobertura de saúde. O ator ajuda a entender o que é decisão política e o que vira desgaste da população.',
    'Quem responde quando a saúde vira espera?',
    'secretaria',
    'Rede municipal de saúde',
    '/archive/assets/acervo-foto-oficina.svg',
    false,
    true,
    'monitoring',
    4,
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    'IFRJ - Campus Volta Redonda',
    'ifrj-campus-volta-redonda',
    'Instituição educacional ligada à formação, memória técnica e cidade operária.',
    'A presença educacional ajuda a entender como conhecimento, formação e território se cruzam na cidade. O projeto o trata como espaço de memória do trabalho e de futuro público.',
    'Como a formação também escreve a cidade?',
    'universidade',
    'Cidade operária e formação',
    '/editorial/covers/arquivo-inicial.svg',
    false,
    true,
    'archive',
    5,
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    'SAAE - Serviço Autônomo de Água e Esgoto',
    'saae-servico-autonomo-de-agua-e-esgoto',
    'Autarquia que organiza parte da disputa sobre saneamento, manutenção e resposta urbana.',
    'O SAAE aparece como ator recorrente quando o problema atravessa água, saneamento e reparo urbano. Ele ajuda a conectar infraestrutura e consequência pública.',
    'Quem sustenta a água da cidade quando o sistema falha?',
    'autarquia',
    'Rede urbana e saneamento',
    '/archive/assets/acervo-recorte-jornal.svg',
    false,
    true,
    'monitoring',
    6,
    timezone('utc', now()),
    timezone('utc', now())
  );

insert into public.actor_hub_links (
  actor_hub_id, link_type, link_key, link_role, timeline_year, timeline_label, timeline_note, featured, sort_order, created_at, updated_at
) values
  ((select id from public.actor_hubs where slug = 'companhia-siderurgica-nacional'), 'editorial', 'ar-poeira-e-pressao', 'lead', 2026, '2026', 'Pauta de entrada sobre ar e pressão industrial.', true, 1, timezone('utc', now()), timezone('utc', now())),
  ((select id from public.actor_hubs where slug = 'companhia-siderurgica-nacional'), 'dossier', 'ar-fumaca-e-rotina-industrial', 'context', 2026, '2026', 'Dossiê que organiza a investigação de base.', true, 2, timezone('utc', now()), timezone('utc', now())),
  ((select id from public.actor_hubs where slug = 'companhia-siderurgica-nacional'), 'memory', 'poeira-e-fumaca', 'archive', 1997, 'fim dos anos 1990', 'Memória territorial da fumaça recorrente.', false, 3, timezone('utc', now()), timezone('utc', now())),
  ((select id from public.actor_hubs where slug = 'companhia-siderurgica-nacional'), 'campaign', 'respira-volta-redonda', 'followup', 2026, '2026', 'Chamado público que mantém a frente ativa.', false, 4, timezone('utc', now()), timezone('utc', now())),
  ((select id from public.actor_hubs where slug = 'companhia-siderurgica-nacional'), 'impact', 'respira-volta-redonda', 'followup', 2026, '2026', 'Efeito público observado da mobilização.', false, 5, timezone('utc', now()), timezone('utc', now())),
  ((select id from public.actor_hubs where slug = 'companhia-siderurgica-nacional'), 'territory', 'csn-e-entorno', 'context', 2026, '2026', 'Território de pressão e leitura do entorno industrial.', true, 6, timezone('utc', now()), timezone('utc', now())),
  ((select id from public.actor_hubs where slug = 'companhia-siderurgica-nacional'), 'territory', 'cidade-operaria', 'archive', 2026, '2026', 'Bairro que organiza a memória operária da cidade.', false, 7, timezone('utc', now()), timezone('utc', now())),
  ((select id from public.actor_hubs where slug = 'prefeitura-municipal-de-volta-redonda'), 'editorial', 'o-que-sobrou-da-promessa-industrial', 'lead', 2026, '2026', 'Pauta de entrada sobre promessa e ruína urbana.', true, 1, timezone('utc', now()), timezone('utc', now())),
  ((select id from public.actor_hubs where slug = 'prefeitura-municipal-de-volta-redonda'), 'dossier', 'cidade-e-abandono', 'context', 2026, '2026', 'Dossiê que amarra o abandono urbano ao poder local.', true, 2, timezone('utc', now()), timezone('utc', now())),
  ((select id from public.actor_hubs where slug = 'prefeitura-municipal-de-volta-redonda'), 'memory', 'apagamentos-do-centro', 'archive', 1985, 'requalificações urbanas', 'Memória que ajuda a ler apagamentos no centro.', false, 3, timezone('utc', now()), timezone('utc', now())),
  ((select id from public.actor_hubs where slug = 'prefeitura-municipal-de-volta-redonda'), 'impact', 'arquivo-que-volta-a-falar', 'followup', 2026, '2026', 'Consequência pública ligada à memória reativada.', false, 4, timezone('utc', now()), timezone('utc', now())),
  ((select id from public.actor_hubs where slug = 'prefeitura-municipal-de-volta-redonda'), 'territory', 'praca-savio-gama', 'context', 2026, '2026', 'Marco urbano do centro e da disputa por forma pública.', true, 5, timezone('utc', now()), timezone('utc', now())),
  ((select id from public.actor_hubs where slug = 'prefeitura-municipal-de-volta-redonda'), 'territory', 'rodoviaria-nova', 'followup', 2026, '2026', 'Ponto crítico que mostra a espera e a fricção urbana.', false, 6, timezone('utc', now()), timezone('utc', now())),
  ((select id from public.actor_hubs where slug = 'hospital-sao-joao-batista'), 'editorial', 'turno-risco-e-lesao', 'lead', 2026, '2026', 'Pauta sobre risco, lesão e trabalho.', true, 1, timezone('utc', now()), timezone('utc', now())),
  ((select id from public.actor_hubs where slug = 'hospital-sao-joao-batista'), 'dossier', 'trabalho-ferido-corpo-insistente', 'context', 2026, '2026', 'Dossiê que organiza a investigação de trabalho.', true, 2, timezone('utc', now()), timezone('utc', now())),
  ((select id from public.actor_hubs where slug = 'hospital-sao-joao-batista'), 'memory', 'acidente-e-turno', 'archive', 2004, '2004', 'Memória do corpo em turno e acidente.', false, 3, timezone('utc', now()), timezone('utc', now())),
  ((select id from public.actor_hubs where slug = 'hospital-sao-joao-batista'), 'campaign', 'trabalho-sob-observacao', 'followup', 2026, '2026', 'Chamado que mantém o caso em circulação.', false, 4, timezone('utc', now()), timezone('utc', now())),
  ((select id from public.actor_hubs where slug = 'hospital-sao-joao-batista'), 'impact', 'trabalho-sob-observacao', 'followup', 2026, '2026', 'Impacto de monitoramento do caso.', false, 5, timezone('utc', now()), timezone('utc', now())),
  ((select id from public.actor_hubs where slug = 'hospital-sao-joao-batista'), 'territory', 'hospital-sao-joao-batista', 'context', 2026, '2026', 'Lugar físico onde o conflito aparece na cidade.', true, 6, timezone('utc', now()), timezone('utc', now())),
  ((select id from public.actor_hubs where slug = 'secretaria-municipal-de-saude'), 'editorial', 'linha-tarifa-e-espera', 'lead', 2026, '2026', 'Pauta sobre rede e espera na cidade.', true, 1, timezone('utc', now()), timezone('utc', now())),
  ((select id from public.actor_hubs where slug = 'secretaria-municipal-de-saude'), 'dossier', 'cidade-e-abandono', 'context', 2026, '2026', 'Dossiê sobre manutenção e abandono urbano.', true, 2, timezone('utc', now()), timezone('utc', now())),
  ((select id from public.actor_hubs where slug = 'secretaria-municipal-de-saude'), 'territory', 'vila-santa-cecilia', 'context', 2026, '2026', 'Território onde o cuidado público aparece na rotina.', false, 3, timezone('utc', now()), timezone('utc', now())),
  ((select id from public.actor_hubs where slug = 'secretaria-municipal-de-saude'), 'impact', 'arquivo-que-volta-a-falar', 'followup', 2026, '2026', 'Efeito público ligado ao arquivo reativado.', false, 4, timezone('utc', now()), timezone('utc', now())),
  ((select id from public.actor_hubs where slug = 'secretaria-municipal-de-saude'), 'actor', 'hospital-sao-joao-batista', 'context', 2026, '2026', 'Actor complementar na rede de saúde.', false, 5, timezone('utc', now()), timezone('utc', now())),
  ((select id from public.actor_hubs where slug = 'ifrj-campus-volta-redonda'), 'memory', 'greve-e-fabrica', 'lead', 1950, 'década de 1950', 'Memória de formação operária e técnica.', true, 1, timezone('utc', now()), timezone('utc', now())),
  ((select id from public.actor_hubs where slug = 'ifrj-campus-volta-redonda'), 'editorial', 'o-que-sobrou-da-promessa-industrial', 'context', 2026, '2026', 'Pauta que atravessa a memória do bairro operário.', false, 2, timezone('utc', now()), timezone('utc', now())),
  ((select id from public.actor_hubs where slug = 'ifrj-campus-volta-redonda'), 'territory', 'vila-santa-cecilia', 'context', 2026, '2026', 'O lugar onde formação e bairro se cruzam.', false, 3, timezone('utc', now()), timezone('utc', now())),
  ((select id from public.actor_hubs where slug = 'ifrj-campus-volta-redonda'), 'hub', 'memoria-de-volta-redonda', 'archive', 2026, '2026', 'Eixo de memória maior que enquadra o recorte.', false, 4, timezone('utc', now()), timezone('utc', now())),
  ((select id from public.actor_hubs where slug = 'saae-servico-autonomo-de-agua-e-esgoto'), 'editorial', 'linha-tarifa-e-espera', 'lead', 2026, '2026', 'Pauta sobre rede e espera urbana.', true, 1, timezone('utc', now()), timezone('utc', now())),
  ((select id from public.actor_hubs where slug = 'saae-servico-autonomo-de-agua-e-esgoto'), 'dossier', 'cidade-e-abandono', 'context', 2026, '2026', 'Dossiê sobre manutenção e abandono urbano.', false, 2, timezone('utc', now()), timezone('utc', now())),
  ((select id from public.actor_hubs where slug = 'saae-servico-autonomo-de-agua-e-esgoto'), 'territory', 'rodoviaria-nova', 'followup', 2026, '2026', 'Ponto crítico ligado à circulação e ao saneamento urbano.', true, 3, timezone('utc', now()), timezone('utc', now())),
  ((select id from public.actor_hubs where slug = 'saae-servico-autonomo-de-agua-e-esgoto'), 'impact', 'arquivo-que-volta-a-falar', 'followup', 2026, '2026', 'Efeito público ligado à documentação do saneamento.', false, 4, timezone('utc', now()), timezone('utc', now()));
