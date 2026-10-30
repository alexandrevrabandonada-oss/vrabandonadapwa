import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(path,"utf8");
const guardedPages = ["app/interno/dossies/page.tsx","app/interno/dossies/novo/page.tsx","app/interno/dossies/[id]/page.tsx","app/interno/dossies/[id]/updates/page.tsx","app/interno/dossies/[id]/updates/[updateId]/page.tsx","app/interno/territorios/page.tsx","app/interno/territorios/novo/page.tsx","app/interno/territorios/[id]/page.tsx"];
const guardedActions = ["app/interno/dossies/actions.ts","app/interno/territorios/actions.ts"];

test("acesso interno exige getUser e allowlist verificada pelo servidor",()=>{
  const src=read("lib/editorial/internal-access.ts");
  assert.match(src,/import "server-only"/);
  assert.match(src,/supabase\.auth\.getUser\(\)/);
  assert.match(src,/!user\?\.email/);
  assert.match(src,/isAdminEmailAllowed\(user\.email\)/);
  assert.match(src,/redirect\("\/interno\/entrar"\)/);
});
test("todas as páginas de Casos e Bairros validam autorização ANTES das consultas",()=>{
  for(const path of guardedPages){
    const source=read(path);
    assert.match(source,/await requireEditorialAdmin\(\)/,path);
    assert.doesNotMatch(source,/auth\.getUser\(\)/,path);
    assert.ok(source.indexOf("await requireEditorialAdmin()") < source.indexOf("return ("),path);
  }
});
test("Server Actions de dossiês e bairros não confiam somente no login",()=>{
  for(const path of guardedActions){
    const source=read(path);
    assert.match(source,/import \{ requireEditorialAdmin \}/,path);
    assert.match(source,/await requireEditorialAdmin\(\)/,path);
    assert.doesNotMatch(source,/async function ensureAdmin\(/,path);
    assert.doesNotMatch(source,/auth\.getUser\(\)/,path);
  }
});
test("proteção do servidor reaproveita autorização existente e mantém RLS separada",()=>{
  const legacy=read("lib/captura/actions.ts");
  assert.match(legacy,/isAdminEmailAllowed\(user\.email\)/);
  const blueprint=read("scripts/sql/staging/v82_phase1_editorial_core.sql");
  assert.match(blueprint,/revoke all on table/);
  assert.doesNotMatch(blueprint,/grant\s+(?:insert|update|delete)\s+on table/i);
});
