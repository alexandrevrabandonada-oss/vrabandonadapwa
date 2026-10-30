import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
const read = (path) => readFileSync(path, "utf8");

test("materia e pauta possuem tipos e rotas distintas", () => {
 for(const area of ["dossiers","territories"]){
  const types=read("lib/"+area+"/types.ts");
  const nav=read("lib/"+area+"/navigation.ts");
  assert.ok(types.includes('"materia"'));
  assert.ok(nav.includes('materia: "Reportagem verificada"'));
  assert.ok(nav.includes('case "materia":'));
  assert.ok(nav.includes('/materias/${key}'));
  assert.ok(nav.includes('/pautas/${key}'));
 }
});

test("links de reportagem só são resolvidos mediante publicação e revisão", () => {
 for(const area of ["dossiers","territories"]){
  const resolver=read("lib/"+area+"/resolve.ts");
  assert.match(resolver,/context\.materias\?/);
  assert.match(resolver,/item\.status === "published"/);
  assert.match(resolver,/item\.reviewed === true/);
  assert.match(resolver,/parsed\.type === "materia"/);
  assert.match(resolver,/return null/);
 }
});

test("Casos e Bairros carregam as matérias do Git sem duplicar o conteúdo", () => {
 const dossier=read("app/dossies/[slug]/page.tsx");
 const place=read("app/territorios/[slug]/page.tsx");
 assert.match(dossier,/getMaterias\(\)/);
 assert.match(place,/getMaterias\(\)/);
 assert.match(dossier,/link\.link_type === "materia"/);
 assert.match(dossier,/<EditorialStoryCard/);
 assert.match(place,/linksByType\.materia/);
});

test("não é possível gravar materia no banco antes do novo esquema",()=>{
 for(const p of ["app/interno/dossies/actions.ts","app/interno/territorios/actions.ts"]){
  assert.match(read(p),/if \(parsed\.type === "materia"\) \{\s+return \{ ok: false/);
 }
});

test("matérias canônicas públicas têm slugs estáveis",()=>{
 const files=readdirSync("content/materias").filter(x=>x.endsWith(".json"));
 assert.ok(files.length >= 2);
 for(const f of files){
  const a=JSON.parse(read("content/materias/"+f));
  if(a.reviewed===true && a.status==="published"){
   assert.equal(a.slug+".json",f);
   assert.match(a.slug,/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  }
 }
});
