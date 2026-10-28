import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { assemblePublication, parsePromotionArgs } from "../scripts/promote-editorial-draft.mjs";

const draft = JSON.parse(readFileSync("editorial/drafts/explosao-csn-2026-10-28.json", "utf8"));
const sample = "2026-10-28T20:00:00-03:00"; // Apenas fixture: NÃO é horário efetivo de publicação.

test("notícia da CSN continua não publicada, mesmo após atualização sobre a polícia", () => {
  assert.equal(draft.status, "draft");
  assert.equal(draft.reviewed, false);
  assert.equal(draft.publishedAt, null);
  assert.equal(draft.cover, undefined);
  assert.ok(draft.sources.some((s) => s.url.includes("policia-investiga-explosao")));
  assert.ok(draft.blocks.some((b) => b.text.includes("perícia seria realizada")));
});

test("conversão em memória satisfaz formato do site sem publicar notas privadas", () => {
  const pub = assemblePublication(draft, sample);
  assert.equal(pub.status, "published");
  assert.equal(pub.reviewed, true);
  assert.equal(pub.publishedAt, sample);
  assert.equal("editorialNotes" in pub, false);
  assert.equal(pub.sources.length, draft.sources.length);
});

test("sem autorização e data completa não há promoção", () => {
  assert.equal(parsePromotionArgs(["--draft", "editorial/drafts/a.json", "--published-at", sample]).approve, false);
  assert.equal(parsePromotionArgs(["--draft", "editorial/drafts/a.json", "--published-at", sample, "--approve"]).approve, true);
  assert.throws(() => parsePromotionArgs(["--approve"]), /Informe/);
  assert.throws(() => assemblePublication(draft, "2026-10-28"), /ISO 8601/);
  assert.throws(() => assemblePublication({...draft, reviewed: true}, sample), /rascunho/);
});
