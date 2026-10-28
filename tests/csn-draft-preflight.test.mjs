import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { validateMateria } from "../scripts/validate-materias.mjs";

const path = "editorial/drafts/explosao-csn-2026-10-28.json";
const draft = JSON.parse(readFileSync(path, "utf8"));
const filename = draft.slug + ".json";

test("matéria da explosão permanece rascunho, sem publicação automática", () => {
  assert.equal(draft.status, "draft");
  assert.equal(draft.reviewed, false);
  assert.equal(draft.publishedAt, null);
  assert.ok(validateMateria(draft, filename).some(x => x.includes("aprovação editorial")));
  assert.ok(validateMateria(draft, filename).some(x => x.includes("publishedAt")));
});

test("versão de publicação hipotética passa no contrato técnico, sem ser gravada", () => {
  const { editorialNotes, ...fields } = draft;
  const simulated = { ...fields, status: "published", reviewed: true, publishedAt: "2026-10-28T20:00:00-03:00" };
  assert.deepEqual(validateMateria(simulated, filename), []);
  assert.equal("editorialNotes" in simulated, false);
});

test("ocorrência e fontes têm rastreabilidade e cautelas editoriais", () => {
  assert.ok(draft.sources.length >= 9);
  const all = draft.blocks.map(x=>x.text).join("\n");
  assert.match(all, /13h42/);
  assert.match(all, /Kisch Pit/);
  assert.match(all, /INEA/);
  assert.match(all, /causas do acidente continuam sendo apuradas/);
  assert.doesNotMatch(all, /o INEA multou a CSN|multa aplicada pelo INEA/i);
  assert.ok(draft.territories.every(p=>p.role !== "main"));
  assert.equal(draft.cover, undefined);
  assert.match(draft.editorialNotes.imageStatus, /NÃO reutilizar fotos do acidente de 2019/);
});
