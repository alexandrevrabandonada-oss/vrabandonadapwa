import test from "node:test";
import assert from "node:assert/strict";
import { validateMateria } from "../scripts/validate-materias.mjs";
const ok = {
  slug: "obra-rua-33-volta-redonda",
  title: "Documento mostra informações sobre a obra da Rua 33",
  subtitle: "Uma explicação sobre o assunto de interesse público",
  summary: "Este é um exemplo sintético de teste para validar campos de um artigo sem publicar conteúdo real.",
  section: "Cidade",
  author: "VR Abandonada",
  status: "published",
  reviewed: true,
  publishedAt: "2026-10-27T19:00:00-03:00",
  sources: [{label:"Fonte de demonstração",url:"https://example.org/documento"}],
  blocks: [{type:"paragraph",text:"Apenas exemplo para validar o código"}]
};
test("aceita artigo revisado em formato válido", () => {
  assert.deepEqual(validateMateria(ok, ok.slug + ".json"), []);
});
test("bloqueia não revisado", () => {
  assert.ok(validateMateria({...ok,reviewed:false},ok.slug+".json").some(e=>e.includes("aprovação")));
});
test("rejeita divergência entre slug e arquivo", () => {
  assert.ok(validateMateria(ok,"outra-materia.json").some(e=>e.includes("slug")));
});
test("rejeita capa externa inesperada", () => {
  assert.ok(validateMateria({...ok,cover:{src:"https://example.org/foto.jpg",alt:"Foto"}},ok.slug+".json").some(e=>e.includes("capa")));
});
