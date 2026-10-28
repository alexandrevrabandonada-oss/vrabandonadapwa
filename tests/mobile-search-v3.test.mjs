import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");

test("busca mobile começa pela consulta e não por cartaz ou histórico", () => {
  const src = read("app/buscar/page.tsx");
  assert.match(src, /<h1>O que você procura\?<\/h1>/);
  assert.match(src, /role="search"/);
  assert.ok(src.indexOf('name="q"') < src.indexOf("vr3-search__results"));
  assert.doesNotMatch(src, /<ReadingTrailPanel|hero__title|home-hero__signals|search-highlight-section|search-bridge-section/);
});

test("filtros disponíveis em bloco expansível, resultados são do índice público", () => {
  const src = read("app/buscar/page.tsx");
  assert.match(src, /<details className="vr3-search__filters"/);
  assert.match(src, /name="type"/);
  assert.match(src, /name="territory"/);
  assert.match(src, /name="actor"/);
  assert.match(src, /name="sort"/);
  assert.match(src, /searchPublicContent/);
  assert.match(src, /item\.href/);
  assert.match(src, /Nenhuma publicação encontrada com estes filtros/);
});

test("séries vazias não são publicadas como resultados de busca", () => {
  const src = read("lib/search/index.ts");
  assert.match(src, /getEditorialSeriesCards\(editorialItems\)\.filter\(\(series\) => series\.items\.length > 0\)/);
  assert.match(src, /getPublishedEditorialItems/);
});

test("interface mobile de busca limita títulos, inputs e cards", () => {
  const src = read("app/portal-v2.css");
  assert.match(src, /vr3-search__intro h1[\s\S]*?font-size: clamp\(1\.8rem, 7\.7vw, 2\.3rem\)/);
  assert.match(src, /vr3-search__input-row input[\s\S]*?min-width: 0/);
  assert.match(src, /vr3-search__list \{ grid-template-columns: 1fr/);
  assert.match(src, /vr3-search__item h3 \{ font-size: 1\.13rem/);
});
