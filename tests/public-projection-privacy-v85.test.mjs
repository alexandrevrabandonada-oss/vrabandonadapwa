import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = path => readFileSync(path,"utf8");

test("consultas públicas de Casos não solicitam os e-mails internos",()=>{
 const q=read("lib/dossiers/queries.ts");
 const pub=q.match(/const publicFields =\s*(".*?");/s)?.[1]??"";
 const upd=q.match(/const publicUpdateFields =\s*(".*?");/s)?.[1]??"";
 for(const fields of [pub,upd]) {
  assert.ok(fields.length>80);
  assert.doesNotMatch(fields,/created_by|updated_by/);
 }
 assert.match(q,/const internalFields = publicFields \+ ", created_by, updated_by"/);
 assert.match(q,/const internalUpdateFields = publicUpdateFields \+ ", created_by, updated_by"/);
 assert.equal((q.match(/\.select\(publicUpdateFields\)/g)||[]).length,2);
 assert.equal((q.match(/\.select\(internalUpdateFields\)/g)||[]).length,2);
});

test("Bairros não publicam campos de autoria interna",()=>{
 const q=read("lib/territories/queries.ts");
 const pub=q.match(/const publicFields =\s*(".*?");/s)?.[1]??"";
 assert.ok(pub.length>80);
 assert.doesNotMatch(pub,/created_by|updated_by/);
 assert.match(q,/const internalFields = publicFields \+ ", created_by, updated_by"/);
});

test("blueprint restringe acesso direto às colunas via Data API",()=>{
 const sql=read("scripts/sql/staging/v82_phase1_editorial_core.sql");
 const matches=[...sql.matchAll(/grant select \(([\s\S]*?)\) on table public\.([a-z_]+) to anon, authenticated;/g)];
 assert.equal(matches.length,5);
 for(const [,cols] of matches)assert.doesNotMatch(cols,/created_by|updated_by/);
 assert.doesNotMatch(sql,/grant select on table/);
 const verification=read("scripts/sql/staging/v82_verify_rls.sql");
 assert.match(verification,/has_column_privilege\('anon'/);
 assert.match(verification,/has_column_privilege\('authenticated'/);
});
