-- V8.6: CANDIDATO DE AUTORIZAÇÃO EXCLUSIVO PARA STAGING.
-- Aplicar somente DEPOIS do blueprint V8.2 em banco isolado.
-- NÃO é migração, não inserir em supabase/migrations, não implantar no site.
-- O GUC de confirmação não comprova qual projeto está conectado.
begin;
do $guard$
begin
  if current_setting('vrabandonada.editorial_authz_reviewed',true) is distinct from 'yes' then
    raise exception 'V8.6 bloqueado: revisão de staging e autorização obrigatórias';
  end if;
end;
$guard$;

-- Não exposto à Data API: garantir que o schema NÃO integre exposed schemas.
create schema editorial_private;
revoke all on schema editorial_private from public, anon, authenticated;

-- Identidade estável, criada somente por operador privilegiado do ambiente.
-- Não usar email nem user_metadata como fonte de autorização.
create table editorial_private.members (
  user_id uuid primary key,
  editorial_role text not null check (editorial_role in ('editor','publisher')),
  active boolean not null default false,
  created_at timestamptz not null default now()
);
alter table editorial_private.members enable row level security;
revoke all on editorial_private.members from public, anon, authenticated;
grant usage on schema editorial_private to authenticated;
grant select (user_id, editorial_role, active) on editorial_private.members to authenticated;
create policy editorial_members_self_read on editorial_private.members
  for select to authenticated
  using (user_id = (select auth.uid()));

-- Leitura de rascunhos exclusivamente por identidade ativa da equipe.
-- As políticas de leitura de conteúdo JÁ público de V8.2 permanecem.
create policy dossier_authorized_read on public.investigation_dossiers
  for select to authenticated
  using (exists (
    select 1 from editorial_private.members m
    where m.user_id = (select auth.uid()) and m.active = true
      and m.editorial_role in ('editor','publisher')
  ));
create policy place_authorized_read on public.place_hubs
  for select to authenticated
  using (exists (
    select 1 from editorial_private.members m
    where m.user_id = (select auth.uid()) and m.active = true
      and m.editorial_role in ('editor','publisher')
  ));

-- Staging: permite somente colunas de conteúdo, nunca as de autoria interna.
-- A API em produção e as Server Actions ainda NÃO foram adaptadas a este modelo.
grant insert (
  title, slug, excerpt, description, status, public_visibility,
  cover_image_url, featured, sort_order, lead_question, period_label, territory_label
) on public.investigation_dossiers to authenticated;
grant update (
  title, excerpt, description, status, public_visibility,
  cover_image_url, featured, sort_order, lead_question, period_label, territory_label
) on public.investigation_dossiers to authenticated;
grant insert (
  title, slug, excerpt, description, lead_question, place_type,
  parent_place_slug, territory_label, address_label, latitude, longitude,
  cover_image_url, featured, public_visibility, status, sort_order
) on public.place_hubs to authenticated;
grant update (
  title, excerpt, description, lead_question, place_type,
  parent_place_slug, territory_label, address_label, latitude, longitude,
  cover_image_url, featured, public_visibility, status, sort_order
) on public.place_hubs to authenticated;

-- EDITOR: somente rascunhos privados; não pode publicar por INSERT nem UPDATE.
create policy dossier_editor_insert on public.investigation_dossiers
  for insert to authenticated
  with check (
    status = 'draft' and public_visibility = false
    and exists (select 1 from editorial_private.members m
      where m.user_id = (select auth.uid()) and m.active = true
      and m.editorial_role = 'editor')
  );
create policy dossier_editor_update on public.investigation_dossiers
  for update to authenticated
  using (
    status = 'draft' and public_visibility = false
    and exists (select 1 from editorial_private.members m
      where m.user_id = (select auth.uid()) and m.active = true
      and m.editorial_role = 'editor')
  )
  with check (
    status = 'draft' and public_visibility = false
    and exists (select 1 from editorial_private.members m
      where m.user_id = (select auth.uid()) and m.active = true
      and m.editorial_role = 'editor')
  );
create policy place_editor_insert on public.place_hubs
  for insert to authenticated
  with check (
    status = 'draft' and public_visibility = false
    and exists (select 1 from editorial_private.members m
      where m.user_id = (select auth.uid()) and m.active = true
      and m.editorial_role = 'editor')
  );
create policy place_editor_update on public.place_hubs
  for update to authenticated
  using (
    status = 'draft' and public_visibility = false
    and exists (select 1 from editorial_private.members m
      where m.user_id = (select auth.uid()) and m.active = true
      and m.editorial_role = 'editor')
  )
  with check (
    status = 'draft' and public_visibility = false
    and exists (select 1 from editorial_private.members m
      where m.user_id = (select auth.uid()) and m.active = true
      and m.editorial_role = 'editor')
  );

-- PUBLICADOR: pode publicar, mas apenas se estiver habilitado na tabela privada.
create policy dossier_publisher_insert on public.investigation_dossiers
  for insert to authenticated
  with check (exists (
    select 1 from editorial_private.members m
    where m.user_id = (select auth.uid()) and m.active = true
      and m.editorial_role = 'publisher'
  ));
create policy dossier_publisher_update on public.investigation_dossiers
  for update to authenticated
  using (exists (
    select 1 from editorial_private.members m
    where m.user_id = (select auth.uid()) and m.active = true
      and m.editorial_role = 'publisher'
  ))
  with check (exists (
    select 1 from editorial_private.members m
    where m.user_id = (select auth.uid()) and m.active = true
      and m.editorial_role = 'publisher'
  ));
create policy place_publisher_insert on public.place_hubs
  for insert to authenticated
  with check (exists (
    select 1 from editorial_private.members m
    where m.user_id = (select auth.uid()) and m.active = true
      and m.editorial_role = 'publisher'
  ));
create policy place_publisher_update on public.place_hubs
  for update to authenticated
  using (exists (
    select 1 from editorial_private.members m
    where m.user_id = (select auth.uid()) and m.active = true
      and m.editorial_role = 'publisher'
  ))
  with check (exists (
    select 1 from editorial_private.members m
    where m.user_id = (select auth.uid()) and m.active = true
      and m.editorial_role = 'publisher'
  ));

-- Sem DELETE; links e updates continuam SOMENTE LEITURA.
-- A fase futura de vínculos deve validar pai e matéria Git revisada no servidor.
commit;
