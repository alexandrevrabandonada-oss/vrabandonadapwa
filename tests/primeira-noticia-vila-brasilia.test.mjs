import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { validateMateria } from "../scripts/validate-materias.mjs";
const slug="troca-comando-28-bpm-invasao-vila-brasilia-volta-redonda";
const file="content/materias/"+slug+".json";
const news=JSON.parse(readFileSync(file,"utf8"));
test("primeira notícia: publicação autorizada e formato news válido",()=>{
  assert.equal(news.kind,"news");
  assert.equal(news.status,"published");
  assert.equal(news.reviewed,true);
  assert.equal(news.slug,slug);
  assert.deepEqual(validateMateria(news,slug+".json"),[]);
});
test("notícia tem fontes diretas e histórico vivo",()=>{
  assert.ok(news.sources.length>=7);
  assert.ok(news.sources.some(s=>s.url.includes("focoregional.com.br")));
  assert.ok(news.sources.some(s=>s.url.includes("voltaredonda.rj.gov.br")));
  assert.ok(news.blocks.length>=10);
  assert.equal(news.updates[0].label,"Publicação inicial");
  assert.ok(!("review" in news));
});
test("preserva distinção entre fatos confirmados, relatos e críticas",()=>{
  const full=news.blocks.map(x=>x.text+" "+(x.items||[]).join(" ")).join("\n");
  assert.match(full,/não foram confirmados independentemente/i);
  assert.match(full,/não comprova que a mudança tenha sido motivada/i);
  assert.match(full,/não havia sido encaminhada.*solicitação específica/i);
  assert.match(full,/quando.*informações.*disponíveis antes da invasão/i);
  assert.match(full,/proteção de vidas/i);
});
test("horário do site e notícias separadas de investigações",()=>{
  assert.match(news.publishedAt,/2026-10-28T/);
  assert.match(readFileSync("app/noticias/page.tsx","utf8"),/materiaKind\(article\) === "news"/);
  const rua=JSON.parse(readFileSync("content/materias/rua-33-cinco-anos-obra-contratos-custos-volta-redonda.json","utf8"));
  assert.equal(rua.kind,"investigation");
});
