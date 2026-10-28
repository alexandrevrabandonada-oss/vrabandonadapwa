import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { validateMateria } from "../scripts/validate-materias.mjs";

const read=(path)=>readFileSync(path,"utf8");
const article=(slug)=>JSON.parse(read("content/materias/"+slug+".json"));
const rua=article("rua-33-cinco-anos-obra-contratos-custos-volta-redonda");
const bpm=article("troca-comando-28-bpm-invasao-vila-brasilia-volta-redonda");

test("territórios adicionados não modificam status nem invalidam reportagens",()=>{
  assert.deepEqual(validateMateria(rua,rua.slug+".json"),[]);
  assert.deepEqual(validateMateria(bpm,bpm.slug+".json"),[]);
  assert.equal(rua.reviewed,true);assert.equal(bpm.reviewed,true);
  assert.equal(rua.kind,"investigation");assert.equal(bpm.kind,"news");
});
test("Vila Santa Cecília é foco, Vila Brasília é foco, Água Limpa é menção",()=>{
  assert.deepEqual(rua.territories,[{slug:"vila-santa-cecilia",label:"Vila Santa Cecília",role:"main"}]);
  assert.deepEqual(bpm.territories,[
    {slug:"vila-brasilia",label:"Vila Brasília",role:"main"},
    {slug:"agua-limpa",label:"Água Limpa",role:"mentioned"}
  ]);
  assert.ok(!bpm.territories.some(x=>["jardim-amalia","monte-castelo"].includes(x.slug)));
});
test("validador rejeita slug incorreto, duplicatas, papéis e etiquetas inválidos",()=>{
  const bad=[
    {...rua,territories:[{slug:"vila@brasilia",label:"Vila Brasília",role:"main"}]},
    {...rua,territories:[{slug:"bairro",label:"B",role:"main"}]},
    {...rua,territories:[{slug:"bairro",label:"Bairro",role:"causa"}]},
    {...rua,territories:[{slug:"bairro",label:"Bairro",role:"main"},{slug:"bairro",label:"Bairro",role:"mentioned"}]},
  ];
  for(const variant of bad) assert.ok(validateMateria(variant,rua.slug+".json").some(x=>x.includes("território")));
});
test("Acervo é índice de publicações com documentos complementares",()=>{
  const page=read("app/acervo/page.tsx");
  assert.match(page,/EditorialAcervoIndex articles=\{articles\}/);
  assert.match(page,/getMaterias\(\)/);
  assert.match(page,/archive_assets|allAssets/);
  assert.match(page,/Documentos e anexos em organização/);
});
test("Bairros não são inferidos do corpo por regex e expõem origem verificável",()=>{
  const helper=read("lib/territories/editorial.ts");
  const page=read("app/territorios/[slug]/page.tsx");
  const listing=read("app/territorios/page.tsx");
  assert.match(helper,/article\.territories/);
  assert.doesNotMatch(helper,/article\.blocks\.map/);
  assert.match(page,/getPublishedEditorialTerritoryBySlug/);
  assert.match(page,/EditorialTerritoryFeed/);
  assert.match(listing,/EditorialTerritoryIndex/);
  assert.match(read("components/editorial-navigation.tsx"),/MENÇÃO CONTEXTUAL/);
});
test("Índice de busca e SEO reconhecem a localização principal e o sitemap",()=>{
  assert.match(read("lib/search/index.ts"),/item\.territories\?\.find\(\(place\) => place\.role === "main"\)/);
  assert.match(read("app/sitemap.ts"),/getPublishedEditorialTerritories/);
  assert.match(read("app/materias\/[slug]\/page.tsx"),/contentLocation:/);
});
test("Acervo, Bairros e COMUN permanecem distintos",()=>{
  const doc=read("docs/ARQUITETURA_ACERVO_TERRITORIOS.md");
  assert.match(doc,/Uma reportagem original, vários caminhos/);
  assert.match(doc,/não competir com o COMUN|Não competir com o COMUN/i);
  assert.match(doc,/Não extrair bairros automaticamente/);
});
