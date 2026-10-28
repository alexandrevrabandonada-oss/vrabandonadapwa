import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read=(p)=>readFileSync(p,"utf8");

test("diagnóstico de schema é somente leitura e não toca em denúncias",()=>{
 const sql=read("scripts/sql/portal-editorial-readiness.sql");
 const lines=sql.split("\n").filter(line=>!line.trimStart().startsWith("--")).join("\n");
 const withoutLiterals=lines.replace(/'[^']*'/g,"''");
 assert.match(withoutLiterals,/^\s*with expected\(/i);
 assert.match(withoutLiterals,/\bselect\s+e\.phase/i);
 assert.doesNotMatch(withoutLiterals,/\b(create|alter|drop|truncate|insert|update|delete|grant|revoke|execute)\b/i);
 assert.doesNotMatch(sql,/select\s+\*\s+from\s+(public\.)?(intake_submissions|universal_captures)/i);
 assert.ok(lines.trimEnd().endsWith(";"));
});

test("preflight cobre cinco tabelas prioritárias e quatro dependências",()=>{
 const sql=read("scripts/sql/portal-editorial-readiness.sql");
 const rows=[...sql.matchAll(/\('([a-z_]+)',\s*'([a-z_]+)',\s*([12])\)/g)];
 assert.equal(rows.length,9);
 assert.equal(rows.filter(x=>x[3]==="1").length,5);
 assert.equal(rows.filter(x=>x[3]==="2").length,4);
 for(const name of [
  "investigation_dossiers","investigation_dossier_links","investigation_dossier_updates",
  "place_hubs","place_hub_links","archive_assets","archive_collections",
  "editorial_items","memory_items"
 ]) assert.ok(rows.some(row=>row[1]===name),name);
 assert.match(sql,/pg_policies/);
 assert.match(sql,/has_table_privilege/);
});

test("rollout V1 preserva Git canônico e proíbe deploy automático das migrações antigas",()=>{
 const plan=read("docs/PLANO_IMPLANTACAO_EDITORIAL_SUPABASE.md");
 assert.match(plan,/content\/materias\/\*\.json/);
 assert.match(plan,/supabase migration new/);
 assert.match(plan,/não é uma migração executada/);
 assert.match(plan,/Não executar as migrações 0003–0033 em bloco/);
 assert.match(plan,/zero linhas/);
 assert.match(plan,/RLS/);
 assert.match(plan,/staging/);
 assert.match(plan,/autorização explícita/);
 assert.match(plan,/backup/);
 assert.match(plan,/rollback/);
});

test("a especificação alerta sobre brechas legadas sem importar seeds",()=>{
 const plan=read("docs/PLANO_IMPLANTACAO_EDITORIAL_SUPABASE.md");
 for(const path of [
   "0010_archive_collections.sql","0011_investigation_dossiers.sql",
   "0012_investigation_dossiers_timeline.sql","0013_dossier_updates.sql",
   "0019_place_hubs.sql","0028_admin_allowlist_seed.sql",
   "0033_memory_schema_bootstrap.sql"
 ]) assert.ok(plan.includes(path),path);
 assert.match(plan,/SECURITY DEFINER/);
 assert.match(plan,/using \(true\)/);
 assert.match(plan,/auth\.role\(\)/);
});
