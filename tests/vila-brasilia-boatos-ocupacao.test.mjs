import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { validateMateria } from "../scripts/validate-materias.mjs";

const path = "content/materias/troca-comando-28-bpm-invasao-vila-brasilia-volta-redonda.json";
const j = JSON.parse(readFileSync(path, "utf8"));
test("atualização de segurança é atribuída, não garante ausência de riscos e preserva permalink", () => {
  assert.equal(j.kind, "news");
  assert.equal(j.slug, "troca-comando-28-bpm-invasao-vila-brasilia-volta-redonda");
  assert.equal(j.publishedAt, "2026-10-28T00:37:26-03:00");
  assert.equal(j.reviewed, true);
  assert.deepEqual(validateMateria(j, j.slug + ".json"), []);
  assert.ok(Date.parse(j.updatedAt) > Date.parse(j.publishedAt));
  assert.ok(j.updates.length >= 3);
  const text = j.blocks.map(x => x.text).join("\n");
  assert.match(text, /ocupação na Vila Brasília por tempo indeterminado/);
  assert.match(text, /não significa que todos os riscos de segurança/);
  assert.match(text, /não substituem a comprovação das escalas/);
  assert.ok(j.sources.some(x => x.url.includes("odia.ig.com.br/volta-redonda")));
  assert.ok(j.sources.some(x => x.url.includes("diariodovale.com.br/policia/policia-militar")));
});