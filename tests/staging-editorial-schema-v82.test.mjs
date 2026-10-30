import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const ddl = readFileSync("scripts/sql/staging/v82_phase1_editorial_core.sql", "utf8");
const tableNames = [
  "investigation_dossiers", "investigation_dossier_links",
  "investigation_dossier_updates", "place_hubs", "place_hub_links",
];

test("modelo V8.2 permanece fora da pasta de migrações executáveis",()=>{
  assert.match(ddl,/PROPOSTA DE DDL SOMENTE PARA STAGING/);
  assert.match(ddl,/editorial_staging_approved/);
  assert.match(ddl,/is distinct from 'yes'/);
  assert.match(ddl,/^begin;/m);
  assert.match(ddl,/^commit;/m);
});
test("exatamente cinco tabelas do núcleo editorial, sem seeds nem exclusões",()=>{
  const created=[...ddl.matchAll(/^create table public\.([a-z_]+) \(/gm)].map(x=>x[1]);
  assert.deepEqual(created, tableNames);
  assert.doesNotMatch(ddl,/^\s*(insert|update|delete|truncate|drop)\s+(into|from|table|schema)/gim);
  assert.doesNotMatch(ddl,/create\s+table\s+public\.(?:intake_|universal_|admin_)/i);
});
test("cada tabela exige RLS e a fase inicial não dá privilégio de escrita",()=>{
  for(const name of tableNames) {
    assert.ok(ddl.includes("alter table public."+name+" enable row level security;"));
  }
  assert.match(ddl,/revoke all on table[\s\S]*from public, anon, authenticated;/);
  assert.equal((ddl.match(/grant select \([\s\S]*?\) on table public\./g) || []).length, 5);
  assert.doesNotMatch(ddl,/grant\s+(?:all|insert|update|delete)\s+on/i);
  assert.doesNotMatch(ddl,/for all|for insert|for update|for delete/i);
  assert.doesNotMatch(ddl,/using\s*\(\s*true\s*\)/i);
});
test("itens filhos não vazam se pai não está público; updates exigem published",()=>{
  assert.match(ddl,/create policy dossier_link_public_select[\s\S]*exists\s*\([\s\S]*parent\.public_visibility = true and parent\.status <> 'draft'/);
  assert.match(ddl,/create policy hub_link_public_select[\s\S]*exists\s*\([\s\S]*parent\.public_visibility = true and parent\.status <> 'draft'/);
  assert.match(ddl,/create policy dossier_update_public_select[\s\S]*using \(published = true and exists/);
  assert.match(ddl,/not published or published_at is not null/);
});
test("materia tem tipo distinto de editorial e link_key validado como slug",()=>{
  assert.match(ddl,/'editorial','materia'/);
  assert.match(ddl,/dossier_git_slug_check/);
  assert.match(ddl,/hub_git_slug_check/);
  assert.match(ddl,/unique \(dossier_id, link_type, link_key\)/);
  assert.match(ddl,/unique \(place_hub_id, link_type, link_key, link_role\)/);
});
test("tabelas começam privadas, com status draft",()=>{
  assert.equal((ddl.match(/public_visibility boolean not null default false/g)||[]).length,2);
  assert.equal((ddl.match(/status text not null default 'draft'/g)||[]).length,2);
});

test("autoria interna não é concedida por SELECT público", () => {
 const grants=[...ddl.matchAll(/grant select \(([\s\S]*?)\) on table public\.([a-z_]+) to anon, authenticated;/g)];
 assert.equal(grants.length, 5);
 for(const [,cols] of grants) assert.doesNotMatch(cols,/\bcreated_by\b|\bupdated_by\b/);
 assert.doesNotMatch(ddl,/grant select on table/);
});
