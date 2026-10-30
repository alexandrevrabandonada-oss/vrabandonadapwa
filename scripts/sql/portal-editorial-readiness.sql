-- Consulta SOMENTE LEITURA para diagnosticar implantação editorial.
-- Não contém DDL, escrita, chaves, dados de denunciantes ou dados privados.
-- Executar apenas no projeto Supabase identificado para este portal.
with expected(table_name, layer, phase) as (
  values
  ('investigation_dossiers', 'casos', 1),
  ('investigation_dossier_links', 'casos', 1),
  ('investigation_dossier_updates', 'casos', 1),
  ('place_hubs', 'bairros', 1),
  ('place_hub_links', 'bairros', 1),
  ('editorial_items', 'dependencia_acervo', 2),
  ('memory_items', 'dependencia_acervo', 2),
  ('archive_collections', 'acervo', 2),
  ('archive_assets', 'acervo', 2)
)
select
  e.phase,
  e.layer,
  e.table_name,
  (c.oid is not null) as table_exists,
  coalesce(c.relrowsecurity, false) as rls_enabled,
  case when c.oid is null then null
       else has_table_privilege('anon', c.oid, 'SELECT')
  end as anon_select_granted,
  case when c.oid is null then null
       else has_table_privilege('anon', c.oid, 'INSERT')
  end as anon_insert_granted,
  case when c.oid is null then null
       else exists (
         select 1 from pg_policies p
         where p.schemaname = 'public'
           and p.tablename = e.table_name
           and p.cmd = 'SELECT'
       )
  end as has_select_policy
from expected e
left join pg_namespace n on n.nspname = 'public'
left join pg_class c on c.relnamespace = n.oid and c.relname = e.table_name and c.relkind = 'r'
order by e.phase, e.layer, e.table_name;
