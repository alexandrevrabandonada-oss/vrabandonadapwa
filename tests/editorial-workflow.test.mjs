import test from "node:test";
import assert from "node:assert/strict";
import { makeSlug, prepareInstagramDraft, reviewedPublication } from "../scripts/editorial-workflow.mjs";

const original = {
  id: "123456789012345",
  caption: "Investigação sobre o transporte em Volta Redonda\n\nSegundo documento citado, o caso exige novas respostas da prefeitura.",
  permalink: "https://www.instagram.com/p/CODEexemplo/",
  published_at: "2026-10-21T12:00:00-03:00",
  media_type: "IMAGE",
};
function approved() {
  const draft = prepareInstagramDraft(original);
  draft.title = "Investigação sobre transporte e serviço público em Volta Redonda";
  draft.subtitle = "Texto documental completo após revisão";
  draft.summary = "Esta é uma descrição de teste com mais de trinta e cinco caracteres para validar o fluxo editorial.";
  draft.review = {
    factChecked: true, sourcesChecked: true, rightOfReplyChecked: true,
    privacyChecked: true, approved: true,
    approvedBy: "Equipe Editorial", approvedAt: "2026-10-27T17:45:00-03:00",
  };
  return draft;
}
test("rascunho preserva a legenda original e não é publicável", () => {
  const draft = prepareInstagramDraft(original);
  assert.equal(draft.status, "draft");
  assert.equal(draft.reviewed, false);
  assert.equal(draft.review.approved, false);
  assert.equal(draft.originalInstagram.caption, original.caption);
  assert.equal(draft.instagramUrl, original.permalink);
  assert.throws(() => reviewedPublication(draft), /Checklist editorial/);
});
test("slug único e sem caracteres inseguros", () => {
  const slug = makeSlug("CSN, Rua 33: Órgãos?", "123456789012345");
  assert.match(slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  assert.ok(slug.endsWith("-123456789012345"));
});
test("publicação revisada mantém vínculo da origem, com data de aprovação do site", () => {
  const result = reviewedPublication(approved());
  assert.equal(result.status, "published");
  assert.equal(result.reviewed, true);
  assert.equal(result.instagramUrl, original.permalink);
  assert.equal(result.publishedAt, "2026-10-27T20:45:00.000Z");
  assert.equal("originalInstagram" in result, false);
});
test("não publica sem fontes, contraditório ou responsável pela aprovação", () => {
  const draft = approved();
  draft.sources = [];
  assert.throws(() => reviewedPublication(draft), /referência pública HTTPS/);
  draft.sources = [{label:"Original",url:original.permalink}];
  draft.review.rightOfReplyChecked = false;
  assert.throws(() => reviewedPublication(draft), /Checklist editorial/);
  draft.review.rightOfReplyChecked = true;
  draft.review.approvedBy = "";
  assert.throws(() => reviewedPublication(draft), /responsável/);
});
test("recusa dados sem ID/permalink válido e revisão simulada sem conteúdo", () => {
  assert.throws(() => prepareInstagramDraft({...original,id:"../foo"}), /ID/);
  assert.throws(() => prepareInstagramDraft({...original,permalink:"javascript:alert(1)"}), /Permalink/);
  const draft = approved();
  draft.blocks = [];
  assert.throws(() => reviewedPublication(draft), /Sem texto/);
});
