import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { validateMateria } from "../scripts/validate-materias.mjs";

const path = "editorial/revisoes/rua-33-cinco-anos-obra-contratos-custos-volta-redonda.json";
const review = JSON.parse(readFileSync(path,"utf8"));

test("rascunho inaugural não pode aparecer como matéria publicada antes da autorização", () => {
  assert.equal(review.status,"draft");
  assert.equal(review.reviewed,false);
  assert.equal(review.publishedAt,null);
  assert.equal(review.review.approval,"PENDENTE");
  assert.ok(!requireAllPublicContent());
});
function requireAllPublicContent() {
  return review.status === "published" && review.reviewed === true;
}
test("conteúdo candidato já satisfaz os campos técnicos após futura aprovação", () => {
  const hypothetical = {
    slug:review.slug,title:review.title,subtitle:review.subtitle,summary:review.summary,
    section:review.section,author:review.author,blocks:review.blocks,sources:review.sources,
    status:"published",reviewed:true,publishedAt:"2026-10-28T12:00:00-03:00",
  };
  const result = validateMateria(hypothetical,review.slug+".json");
  assert.deepEqual(result,[]);
});
test("revisão exige valores com qualificações e preserva o contraditório pendente", () => {
  const all=review.blocks.map((b)=>b.text+" "+(b.items||[]).join(" ")).join("\n");
  assert.match(all,/R\$ 18\.131\.436,55/);
  assert.match(all,/R\$ 7\.985\.501,91/);
  assert.match(all,/registros parciais/i);
  assert.match(all,/não.*demonstra.*fraude/i);
  assert.match(review.review.rightOfReply,/PENDENTE/);
  assert.ok(review.sources.some((s)=>s.url.includes("voltaredonda.rj.gov.br")));
  assert.ok(review.sources.some((s)=>s.url.includes("folhadoaco.com.br")));
});
