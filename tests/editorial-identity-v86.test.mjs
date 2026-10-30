import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = p => readFileSync(p,"utf8");
const sql = read("scripts/sql/staging/v86_editorial_identity_authz.sql");
const qa = read("scripts/sql/staging/v86_verify_editorial_identity.sql");

test("authz V8.6 é apenas candidata de staging, fail closed",()=>{
 assert.match(sql,/V8\.6: CANDIDATO/);
 assert.match(sql,/editorial_authz_reviewed/);
 assert.match(sql,/is distinct from 'yes'/);
 assert.doesNotMatch(sql,/INSERT INTO editorial_private\.members/i);
 assert.match(sql,/create schema editorial_private;/);
});

test("membros são UUID, não email/user_metadata e não podem se promover",()=>{
 assert.match(sql,/user_id uuid primary key/);
 assert.match(sql,/editorial_role text not null/);
 assert.match(sql,/active boolean not null default false/);
 assert.match(sql,/create policy editorial_members_self_read/);
 assert.match(sql,/user_id = \(select auth\.uid\(\)\)/);
 assert.doesNotMatch(sql.replace(/^\s*--.*$/gm,""),/security definer|user_metadata|raw_user_meta_data/i);
 assert.doesNotMatch(sql,/grant\s+(insert|update|delete|all)\s+on\s+(table\s+)?editorial_private\.members/i);
});

test("autorização diferencia editor de publisher e impede publicação pelo editor",()=>{
 assert.match(sql,/create policy dossier_editor_insert/);
 assert.match(sql,/create policy place_editor_update/);
 assert.match(sql,/create policy dossier_publisher_insert/);
 assert.match(sql,/create policy place_publisher_update/);
 assert.equal((sql.match(/status = 'draft' and public_visibility = false/g)||[]).length,6);
 assert.match(sql,/editorial_role = 'editor'/);
 assert.match(sql,/editorial_role = 'publisher'/);
 assert.doesNotMatch(sql,/for delete to authenticated|grant delete on/i);
});

test("V8.6 não libera vínculos, atualizações ou autoria interna",()=>{
 for(const table of ["investigation_dossier_links","investigation_dossier_updates","place_hub_links"]){
   assert.doesNotMatch(sql,new RegExp("grant (insert|update|delete)[^;]*"+table,"i"));
 }
 assert.doesNotMatch(sql,/grant select on table/i);
 assert.doesNotMatch(sql,/created_by\s*,\s*updated_by/i);
 const existing=read("scripts/sql/staging/v82_phase1_editorial_core.sql");
 assert.match(existing,/grant select \(/);
});

test("a matriz efêmera exerce negativos e positivos com rollback",()=>{
 for(const term of ["set local role anon","set local role authenticated","$non_editor$","$disabled$","$editor$","$publisher$","$no_token$","rollback;"]){
  assert.ok(qa.includes(term),term);
 }
 assert.match(qa,/exception when insufficient_privilege/);
 const workflow=read(".github/workflows/validate-v82-staging-db.yml");
 assert.match(workflow,/v86_ci_auth_uid_stub\.sql/);
 assert.match(workflow,/v86_editorial_identity_authz\.sql/);
 assert.match(workflow,/v86_verify_editorial_identity\.sql/);
});
