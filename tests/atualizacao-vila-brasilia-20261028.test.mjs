import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { validateMateria } from "../scripts/validate-materias.mjs";
const slug="troca-comando-28-bpm-invasao-vila-brasilia-volta-redonda";
const article=JSON.parse(readFileSync("content/materias/"+slug+".json","utf8"));
const full=article.blocks.map(b=>b.text).join("\n");
test("notícia original mantém URL, data inicial e registro de atualização",()=>{
 assert.equal(article.slug,slug);
 assert.equal(article.kind,"news");
 assert.equal(article.publishedAt,"2026-10-28T00:37:26-03:00");
 assert.equal(article.updates[0].label,"Publicação inicial");
 assert.ok(Date.parse(article.updatedAt)>Date.parse(article.publishedAt));
 assert.ok(article.updates.length>=2, "investigação viva não deve eliminar entradas anteriores");
 assert.equal(article.updates[1].label,"Reforços e operação do Bope — 28/10");
 assert.ok(article.updates.every((entry,i,arr)=>i===0 || Date.parse(entry.date)>=Date.parse(arr[i-1].date)), "atualizações devem permanecer cronológicas");
 assert.deepEqual(validateMateria(article,slug+".json"),[]);
});
test("reforços anunciados não são apresentados como efetivamente chegados",()=>{
 assert.match(full,/quatro viaturas e pelo menos 16 policiais militares/);
 assert.match(full,/não comprova, por si, que todos esses recursos já tenham chegado/i);
 assert.ok(article.sources.some(s=>s.url.includes("/12815-")));
});
test("distingue relato da terça do Bope na quarta e mantém lacuna da cronologia",()=>{
 assert.match(full,/madrugada de quarta-feira \(28\)/);
 assert.match(full,/não é correto presumir que se tratem do mesmo evento/i);
 assert.match(full,/não esclarecem quando a ameaça inicial foi detectada/i);
 assert.ok(article.sources.some(s=>s.url.includes("/12814-")));
});
