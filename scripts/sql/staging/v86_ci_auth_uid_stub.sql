-- STUB APENAS PARA POSTGRES EFÊMERO CI; NÃO EXECUTAR EM SUPABASE.
-- Supabase real já disponibiliza auth.uid(), cujas claims vêm de JWT validado.
create schema auth;
create function auth.uid() returns uuid
language sql stable security invoker
as $uid$
  select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid
$uid$;
revoke all on function auth.uid() from public, anon, authenticated;
grant usage on schema auth to authenticated;
grant execute on function auth.uid() to authenticated;
