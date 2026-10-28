import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { validateMateria } from "../scripts/validate-materias.mjs";

const slug = "rua-33-cinco-anos-obra-contratos-custos-volta-redonda";
const story = JSON.parse(readFileSync("content/materias/" + slug + ".json", "utf8"));

test("reportagem inaugural aprovada, fontes públicas e nenhum segredo editorial", () => {
  assert.equal(story.status,"published");
  assert.equal(story.reviewed,true);
  assert.equal(story.investigationStatus,"ongoing");
  assert.ok(story.sources.length>=7);
  assert.ok(story.blocks.length>=20);
  assert.equal("review" in story,false);
  assert.equal("sourceDossier" in story,false);
  assert.deepEqual(validateMateria(story,slug+".json"),[]);
});
test("contraditório pendente divulgado e montantes corretamente qualificados", () => {
  const body=story.blocks.map(b=>b.text).join(" ");
  assert.match(body,/ainda não haviam sido enviados pedidos formais/);
  assert.ok(body.includes("R$ 18.131.436,55"));
  assert.ok(body.includes("R$ 7.985.501,91"));
  assert.match(body,/não a totalidade das despesas da obra/);
});
test("atualizações datadas, sem página nova nem falsos fatos", () => {
  assert.ok(story.updates.length>0);
  assert.ok(story.updates.every(x=>!Number.isNaN(Date.parse(x.date))));
  assert.equal(story.updates[0].label,"Publicação inicial");
  const invalid={...story,updates:[{date:"data inválida",label:"ok",text:"curto"}]};
  assert.ok(validateMateria(invalid,slug+".json").some(x=>x.includes("atualizações")));
});
test("página exibe condição de investigação viva e o histórico", () => {
  const page=readFileSync("app/materias/[slug]/page.tsx","utf8");
  assert.match(page,/Investigação em acompanhamento/);
  assert.match(page,/story\.updates/);
  assert.match(page,/Histórico desta investigação/);
});
