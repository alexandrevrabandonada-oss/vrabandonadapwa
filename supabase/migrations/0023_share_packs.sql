create table if not exists public.share_packs (
  id uuid primary key default gen_random_uuid(),
  content_type text not null,
  content_key text not null,
  title_override text,
  short_summary text,
  share_caption text,
  share_status text not null default 'draft' check (share_status in ('draft', 'published', 'archived')),
  cover_variant text default 'steel' check (cover_variant in ('steel', 'ember', 'concrete', 'night')),
  featured boolean not null default false,
  public_visibility boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create unique index if not exists share_packs_content_key_unique on public.share_packs (content_type, content_key);
create index if not exists share_packs_public_visibility_status_idx on public.share_packs (public_visibility, share_status, featured, sort_order, created_at desc);

alter table public.share_packs enable row level security;

drop policy if exists "share_packs_public_select" on public.share_packs;
create policy "share_packs_public_select"
  on public.share_packs
  for select
  to anon, authenticated
  using (public_visibility = true and share_status = 'published');

drop policy if exists "share_packs_authenticated_all" on public.share_packs;
create policy "share_packs_authenticated_all"
  on public.share_packs
  for all
  to authenticated
  using (true)
  with check (true);

insert into public.share_packs (
  content_type,
  content_key,
  title_override,
  short_summary,
  share_caption,
  share_status,
  cover_variant,
  featured,
  public_visibility,
  sort_order
)
values
  (
    'edicao',
    'edicao-do-momento-o-que-esta-quente-agora',
    'Edição do momento: o que está quente agora',
    'Uma síntese curta do radar, das campanhas e do que ganhou peso na cidade.',
    'Leia, compartilhe e acompanhe o que está em curso no VR Abandonada.',
    'published',
    'steel',
    true,
    true,
    1
  ),
  (
    'campanha',
    'respira-volta-redonda',
    'Respira Volta Redonda',
    'Chamado público sobre ar, fumaça e consequência industrial no cotidiano da cidade.',
    'Campanha em curso. Leia a linha, envie material e compartilhe a leitura.',
    'published',
    'ember',
    true,
    true,
    2
  ),
  (
    'impacto',
    'respira-volta-redonda',
    'O que mudou em torno de respirar a cidade',
    'Efeito público observado a partir da mobilização sobre poluição e pressão industrial.',
    'Consequência pública também precisa circular. Compartilhe esta leitura.',
    'published',
    'concrete',
    false,
    true,
    3
  ),
  (
    'dossie',
    'ar-fumaca-e-rotina-industrial',
    'Ar, fumaça e rotina industrial',
    'Dossiê vivo sobre poluição, corpo e custo cotidiano em volta da siderurgia.',
    'Dossiê em curso. Leia, compartilhe e volte quando houver atualização.',
    'published',
    'night',
    false,
    true,
    4
  ),
  (
    'pauta',
    'ar-poeira-e-pressao',
    'Ar, poeira e pressão',
    'Pauta de entrada sobre poluição e rotina industrial na cidade.',
    'Leitura curta para circular a pauta e seguir a investigação.',
    'published',
    'concrete',
    false,
    true,
    5
  ),
  (
    'padrao',
    'a-poeira-que-volta',
    'A poeira que volta',
    'Leitura estrutural sobre recorrência da poeira industrial na cidade.',
    'Padrão de recorrência para leitura fora do site. Compartilhe o que se repete.',
    'published',
    'steel',
    false,
    true,
    6
  )
on conflict (content_type, content_key) do update
set
  title_override = excluded.title_override,
  short_summary = excluded.short_summary,
  share_caption = excluded.share_caption,
  share_status = excluded.share_status,
  cover_variant = excluded.cover_variant,
  featured = excluded.featured,
  public_visibility = excluded.public_visibility,
  sort_order = excluded.sort_order,
  updated_at = now();
