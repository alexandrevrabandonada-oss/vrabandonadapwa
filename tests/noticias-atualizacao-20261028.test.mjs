import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { validateMateria } from "../scripts/validate-materias.mjs";
const read=(path)=>readFileSync(path,"utf8");
const data=JSON.parse(read("content/materias/troca-comando-28-bpm-invasao-vila-brasilia-volta-redonda.json"));
test("notícia viva preserva criação e atualização distintas",()=>{
  assert.equal(data.kind,"news");
  assert.ok(Date.parse(data.updatedAt)>Date.parse(data.publishedAt));
  assert.ok(data.updates.length>=2);
  assert.deepEqual(validateMateria(data,data.slug+".json"),[]);
});
test("lista Notícias destaca atualização e ordena pelo instante mais recente",()=>{
  const page=read("app/noticias/page.tsx");
  assert.match(page,/Date\.parse\(b\.updatedAt \|\| b\.publishedAt\)/);
  assert.match(page,/Atualizada em \{publishedDateTime\(item\.updatedAt\)\}/);
  assert.match(page,/Publicada em \{publishedDate\(item\.publishedAt\)\}/);
});
test("matéria de notícia mostra histórico próprio, não confunde investigação",()=>{
  const page=read("app/materias/[slug]/page.tsx");
  assert.match(page,/Atualizações desta notícia/);
  assert.match(page,/Notícia atualizada/);
  assert.match(page,/publishedDateTime\(entry\.date\)/);
  assert.match(page,/dateModified: story\.updatedAt \|\| story\.publishedAt/);
  assert.match(page,/"@type": "Organization", name: story\.author/);
});
test("RSS pode avisar sobre atualizações sem apagar data de publicação",()=>{
  const feed=read("app/feed.xml/route.ts");
  assert.match(feed,/lastModified: a\.updatedAt \|\| a\.publishedAt/);
  assert.match(feed,/Date\.parse\(b\.lastModified\)/);
  assert.match(feed,/dc:date/);
  assert.match(feed,/new Date\(item\.date\)\.toUTCString\(\)/);
});
