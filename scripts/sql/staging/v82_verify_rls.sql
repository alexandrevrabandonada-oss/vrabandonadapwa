-- RLS V8.2: TESTE EXCLUSIVAMENTE EM POSTGRES TEMPORÁRIO / STAGING.
-- A transação termina em ROLLBACK. Não usar em produção.
-- O dono da sessão deve poder fazer SET ROLE anon/authenticated.
begin;

-- Fixtures artificiais, isoladas, com prefixo QA. Nenhum dado real.
insert into public.investigation_dossiers(title,slug,status,public_visibility)
values
 ('QA V82 - Publico', 'qa-v82-dossier-publico','in_progress',true),
 ('QA V82 - Privado', 'qa-v82-dossier-privado','monitoring',false),
 ('QA V82 - Rascunho','qa-v82-dossier-rascunho','draft',true);

insert into public.investigation_dossier_links(dossier_id,link_type,link_key,link_role)
select id, 'materia', 'rua-33-cinco-anos-obra-contratos-custos-volta-redonda', 'lead'
from public.investigation_dossiers where slug like 'qa-v82-dossier-%';

insert into public.investigation_dossier_updates(dossier_id,title,body,published,published_at)
select id,'QA update publico','Texto sintético de teste',true,now()
from public.investigation_dossiers where slug in ('qa-v82-dossier-publico','qa-v82-dossier-privado');

insert into public.investigation_dossier_updates(dossier_id,title,body,published)
select id,'QA update interno','Texto sintético não publicado',false
from public.investigation_dossiers where slug = 'qa-v82-dossier-publico';

insert into public.place_hubs(title,slug,status,public_visibility)
values
 ('QA V82 Bairro Público', 'qa-v82-bairro-publico','active',true),
 ('QA V82 Bairro Privado', 'qa-v82-bairro-privado','active',false),
 ('QA V82 Bairro Rascunho', 'qa-v82-bairro-rascunho','draft',true);

insert into public.place_hub_links(place_hub_id,link_type,link_key,link_role)
select id, 'materia', 'rua-33-cinco-anos-obra-contratos-custos-volta-redonda','lead'
from public.place_hubs where slug like 'qa-v82-bairro-%';

-- TESTE REAL: RLS só controla LINHAS. Bloquear leitura das colunas de
-- autoria interna diretamente na Data API via grants de colunas.
do $privacy$
begin
  if has_column_privilege('anon','public.investigation_dossiers','created_by','SELECT')
    or has_column_privilege('authenticated','public.investigation_dossiers','updated_by','SELECT')
    or has_column_privilege('anon','public.investigation_dossier_updates','created_by','SELECT')
    or has_column_privilege('authenticated','public.investigation_dossier_updates','updated_by','SELECT')
    or has_column_privilege('anon','public.place_hubs','created_by','SELECT')
    or has_column_privilege('authenticated','public.place_hubs','updated_by','SELECT') then
    raise exception 'V8.5: autoria interna publicamente legível';
  end if;
end;
$privacy$;

-- Para cada papel, RLS deve permitir SÓ os registros com pai público.
set local role anon;

do $anon_check$
begin
  if (select count(*) from public.investigation_dossiers where slug like 'qa-v82-%') <> 1 then
    raise exception 'anon: dossiê privado ou draft vazou';
  end if;
  if (select count(*) from public.investigation_dossier_links) <> 1 then
    raise exception 'anon: links de pai privado vazaram';
  end if;
  if (select count(*) from public.investigation_dossier_updates) <> 1 then
    raise exception 'anon: update privado/não publicado vazou';
  end if;
  if (select count(*) from public.place_hubs where slug like 'qa-v82-%') <> 1 then
    raise exception 'anon: bairro privado/draft vazou';
  end if;
  if (select count(*) from public.place_hub_links) <> 1 then
    raise exception 'anon: link de bairro privado vazou';
  end if;
  if has_table_privilege(current_user,'public.investigation_dossiers','INSERT')
     or has_table_privilege(current_user,'public.place_hubs','UPDATE') then
    raise exception 'anon: grant de escrita indevido';
  end if;
end;
$anon_check$;

-- Tenta realmente inserir, e exige que o banco recuse a operação.
do $anon_write$
begin
  begin
    insert into public.investigation_dossiers(title,slug)
    values ('QA escrita indevida','qa-v82-write-denied-anon');
    raise exception 'anon conseguiu gravar dossiê';
  exception when insufficient_privilege then
    null;
  end;
end;
$anon_write$;

reset role;
set local role authenticated;

do $authenticated_check$
begin
  if (select count(*) from public.investigation_dossiers where slug like 'qa-v82-%') <> 1 then
    raise exception 'authenticated: dossiê privado/draft vazou';
  end if;
  if (select count(*) from public.investigation_dossier_updates) <> 1 then
    raise exception 'authenticated: updates indevidos vazaram';
  end if;
  if (select count(*) from public.place_hubs where slug like 'qa-v82-%') <> 1 then
    raise exception 'authenticated: bairro privado/draft vazou';
  end if;
  if (select count(*) from public.place_hub_links) <> 1 then
    raise exception 'authenticated: links privados vazaram';
  end if;
  if has_table_privilege(current_user,'public.investigation_dossiers','INSERT')
     or has_table_privilege(current_user,'public.place_hubs','DELETE') then
    raise exception 'authenticated: grant de escrita indevido';
  end if;
end;
$authenticated_check$;

do $authenticated_write$
begin
  begin
    insert into public.place_hubs(title,slug) values ('QA escrita indevida','qa-v82-write-denied-user');
    raise exception 'authenticated conseguiu gravar bairro';
  exception when insufficient_privilege then
    null;
  end;
end;
$authenticated_write$;

reset role;
-- Nenhum registro QA fica persistido.
rollback;
