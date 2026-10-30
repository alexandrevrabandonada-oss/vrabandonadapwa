-- V8.6: exercício transacional do PostgreSQL 17 efêmero.
-- auth.uid() é um STUB de CI que simula claims JWT validadas pelo gateway.
-- Nenhuma fixture é persistida. NUNCA executar em produção.
begin;

insert into editorial_private.members(user_id,editorial_role,active) values
 ('11111111-1111-4111-8111-111111111111','editor',true),
 ('22222222-2222-4222-8222-222222222222','publisher',true),
 ('44444444-4444-4444-8444-444444444444','editor',false);

insert into public.investigation_dossiers(title,slug,status,public_visibility) values
 ('V86 Dossie visivel','qa-v86-publico','in_progress',true),
 ('V86 Dossie interno','qa-v86-privado','draft',false);
insert into public.place_hubs(title,slug,status,public_visibility) values
 ('V86 Bairro visivel','qa-v86-bairro-publico','active',true),
 ('V86 Bairro interno','qa-v86-bairro-privado','draft',false);

set local role anon;
do $anon$
begin
 if (select count(*) from public.investigation_dossiers where slug like 'qa-v86-%') <> 1
  or (select count(*) from public.place_hubs where slug like 'qa-v86-%') <> 1 then
   raise exception 'anon viu conteudo interno';
 end if;
 if has_table_privilege(current_user,'editorial_private.members','INSERT')
  or has_column_privilege(current_user,'public.investigation_dossiers','title','UPDATE') then
  raise exception 'anon recebeu privilegio de escrita';
 end if;
end;
$anon$;

reset role;
set local role authenticated;
set local request.jwt.claim.sub = '33333333-3333-4333-8333-333333333333';

do $non_editor$
begin
 if (select count(*) from editorial_private.members) <> 0 then
   raise exception 'nao editor viu autorizacoes alheias';
 end if;
 if (select count(*) from public.investigation_dossiers where slug like 'qa-v86-%') <> 1
  or (select count(*) from public.place_hubs where slug like 'qa-v86-%') <> 1 then
  raise exception 'nao editor viu rascunho';
 end if;
 begin
  insert into public.investigation_dossiers(title,slug,status,public_visibility)
    values ('V86 Escrita indevida','qa-v86-ataque','draft',false);
  raise exception 'nao editor conseguiu criar dossie';
 exception when insufficient_privilege then null;
 end;
 begin
  insert into editorial_private.members(user_id,editorial_role,active)
    values ('33333333-3333-4333-8333-333333333333','publisher',true);
  raise exception 'usuario se tornou editor sozinho';
 exception when insufficient_privilege then null;
 end;
end;
$non_editor$;

-- Usuário de login anônimo do Supabase também usa role authenticated,
-- mas não terá associação ativa na tabela de equipe.
set local request.jwt.claim.sub = '44444444-4444-4444-8444-444444444444';
do $disabled$
begin
 if (select count(*) from public.investigation_dossiers where slug like 'qa-v86-%') <> 1 then
  raise exception 'editor desabilitado viu rascunho';
 end if;
 begin
  insert into public.place_hubs(title,slug,status,public_visibility)
    values ('V86 Desabilitado','qa-v86-disabled','draft',false);
  raise exception 'editor desabilitado gravou';
 exception when insufficient_privilege then null;
 end;
end;
$disabled$;

set local request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';
do $editor$
declare affected integer;
begin
 if (select count(*) from editorial_private.members) <> 1 then
  raise exception 'editor nao pode ver propria associacao';
 end if;
 if (select count(*) from public.investigation_dossiers where slug like 'qa-v86-%') <> 2
  or (select count(*) from public.place_hubs where slug like 'qa-v86-%') <> 2 then
  raise exception 'editor nao consegue consultar rascunhos';
 end if;
 insert into public.investigation_dossiers(title,slug,status,public_visibility)
   values ('V86 Rascunho editor','qa-v86-editor','draft',false);
 insert into public.place_hubs(title,slug,status,public_visibility)
   values ('V86 Bairro editor','qa-v86-editor-bairro','draft',false);
 update public.investigation_dossiers set title='V86 Editado sem publicar'
   where slug='qa-v86-editor';
 get diagnostics affected = row_count;
 if affected <> 1 then raise exception 'editor nao atualizou seu rascunho'; end if;
 update public.place_hubs set title='V86 Bairro rascunho editado'
   where slug='qa-v86-editor-bairro';
 get diagnostics affected = row_count;
 if affected <> 1 then raise exception 'editor nao atualizou bairro'; end if;
 -- Não pode alterar a linha pública: USING somente draft/privada.
 update public.investigation_dossiers set title='V86 Tentativa de mudar publicado'
   where slug='qa-v86-publico';
 get diagnostics affected = row_count;
 if affected <> 0 then raise exception 'editor alterou publicacao'; end if;
 begin
  insert into public.investigation_dossiers(title,slug,status,public_visibility)
    values ('V86 Publicacao indevida','qa-v86-indevido','in_progress',true);
  raise exception 'editor publicou por insert';
 exception when insufficient_privilege then null;
 end;
 begin
  update public.investigation_dossiers set status='in_progress',public_visibility=true
    where slug='qa-v86-editor';
  raise exception 'editor publicou por update';
 exception when insufficient_privilege then null;
 end;
end;
$editor$;

set local request.jwt.claim.sub = '22222222-2222-4222-8222-222222222222';
do $publisher$
declare affected integer;
begin
 if (select count(*) from public.investigation_dossiers where slug like 'qa-v86-%') <> 3 then
  raise exception 'publicador nao viu rascunho';
 end if;
 insert into public.investigation_dossiers(title,slug,status,public_visibility)
   values ('V86 Publicacao autorizada','qa-v86-publicada','in_progress',true);
 insert into public.place_hubs(title,slug,status,public_visibility)
   values ('V86 Bairro autorizado','qa-v86-bairro-publicado','active',true);
 update public.investigation_dossiers set status='in_progress',public_visibility=true
   where slug='qa-v86-privado';
 get diagnostics affected = row_count;
 if affected <> 1 then raise exception 'publicador nao aprovou dossie'; end if;
 update public.place_hubs set status='active',public_visibility=true
   where slug='qa-v86-bairro-privado';
 get diagnostics affected = row_count;
 if affected <> 1 then raise exception 'publicador nao aprovou bairro'; end if;
end;
$publisher$;

-- Retirar o JWT: voltar ao papel de usuário conectado, sem identidade confiável.
set local request.jwt.claim.sub = '';
do $no_token$
begin
 if (select count(*) from editorial_private.members) <> 0 then
  raise exception 'sessao sem UID viu membros';
 end if;
 begin
  insert into public.place_hubs(title,slug,status,public_visibility)
    values ('V86 Sem JWT','qa-v86-anonjwt','draft',false);
  raise exception 'sessao sem UID gravou';
 exception when insufficient_privilege then null;
 end;
end;
$no_token$;

reset role;
rollback;
