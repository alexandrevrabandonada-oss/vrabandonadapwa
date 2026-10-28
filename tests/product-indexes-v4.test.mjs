import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (file) => readFileSync(file, "utf8");

test("Bairros abre diretamente a consulta sem hero de apresentação", () => {
  const page = read("app/territorios/page.tsx");
  assert.match(page, /<h1>Bairros e lugares<\/h1>/);
  assert.match(page, /getPublishedPlaceHubs\(\)/);
  assert.match(page, /orderedPlaces\.map/);
  assert.match(page, /Lugares publicados/);
  assert.match(page, /action="\/buscar"/);
  assert.doesNotMatch(page, /<EditorialCover|home-callout|hero__title/);
  assert.doesNotMatch(page, /Lugares públicos cadastrados como entrada editorial/);
});

test("Acervo prioriza materiais públicos e referencias de materias efetivamente publicadas", () => {
  const page = read("app/acervo/page.tsx");
  assert.match(page, /<h1>Documentos e fontes<\/h1>/);
  assert.match(page, /getPublishedArchiveFilteredAssets/);
  assert.match(page, /getMaterias\(\)/);
  assert.match(page, /sourceMap\.set\(source\.url/);
  assert.match(page, /Fonte externa/);
  assert.match(page, /não arquivos guardados pelo VR Abandonada/);
  assert.match(page, /getPublishedMemoryItems\(\)/);
  assert.match(page, /memoryItemId: activeMemory/);
  assert.match(page, /\{selected\.map\(/);
  assert.ok(page.indexOf('vr4-assets-title') < page.indexOf('vr4-sources-title'));
  assert.doesNotMatch(page, /<EditorialCover|<ArchiveAssetCard|archive-highlight/);
});

test("Homepage não repete resumo de investigação presente no feed nem mostra bairros fictícios", () => {
  const home = read("app/page.tsx");
  assert.match(home, /newsHrefs = new Set/);
  assert.match(home, /vr4-investigation--recap/);
  assert.match(home, /!newsHrefs\.has\(item\.href\)/);
  assert.match(home, /featuredNeighborhoods\.length > 0/);
  assert.match(home, /href="\/envie"/);
  assert.doesNotMatch(home, /Procure\. Questione\. Confira/);
});

test("Sistema visual V4 é carregado depois do legado e mantem busca responsiva", () => {
  const layout = read("app/layout.tsx");
  assert.ok(layout.indexOf('import "./portal-v2.css"') < layout.indexOf('import "./product-v4.css"'));
  const css = read("app/product-v4.css");
  assert.match(css, /\.vr4-index__header h1/);
  assert.match(css, /@media \(max-width: 640px\)/);
  assert.match(css, /\.vr4-quick-search input:focus-visible/);
  assert.match(read("lib/site.ts"), /href: "\/dossies", label: "Casos"/);
});
