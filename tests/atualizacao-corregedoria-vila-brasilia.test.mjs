import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { validateMateria } from "../scripts/validate-materias.mjs";

const slug="troca-comando-28-bpm-invasao-vila-brasilia-volta-redonda";
const news=JSON.parse(readFileSync("content/materias/"+slug+".json","utf8"));
const text=news.blocks.map(b=>b.text).join("\n");

test("atualização preserva URL e histórico anterior",()=>{
 assert.equal(news.slug,slug);
 assert.equal(news.kind,"news");
 assert.equal(news.status,"published");
 assert.equal(news.reviewed,true);
 assert.equal(news.updates[0].label,"Publicação inicial");
 assert.equal(news.updates[1].label,"Reforços e operação do Bope — 28/10");
 assert.equal(news.updates[2].label,"Esclarecimento sobre ocupação e boatos — 28/10");
 assert.equal(news.updates[3].label,"Corregedoria apura suspeita envolvendo policiais — 28/10");
 assert.deepEqual(validateMateria(news,slug+".json"),[]);
});
test("notícia não transforma suspeita em culpa nem atribui motivo sem documento",()=>{
 assert.match(text,/investiga.*suspeita de que policiais possam ter facilitado/i);
 assert.match(text,/não comprovam envolvimento criminoso/i);
 assert.match(text,/não demonstra, por si só, que a substituição da ex-comandante tenha sido causada/i);
 assert.match(text,/câmeras corporais/i);
 assert.ok(news.sources.some(s=>s.url.includes("/12817-nota-oficial-5/")));
});
test("matéria distingue atribuição a fontes e cronologia em aberto",()=>{
 assert.ok(news.blocks.some(b=>b.text.includes("Monte Castelo")));
 assert.ok(news.blocks.some(b=>b.text.includes("Jardim Amália")));
 assert.match(text,/o que ocorreu na prevenção e na reação/i);
 assert.match(news.updatedAt,/2026-10-28T11:59/);
});
