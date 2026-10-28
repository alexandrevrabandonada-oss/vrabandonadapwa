import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");
const materia = (slug) => JSON.parse(read("content/materias/" + slug + ".json"));

test("reportagens têm percurso visível até fontes, atualizações, acervo e bairro", () => {
  const page = read("app/materias/[slug]/page.tsx");
  const component = read("components/story-context-nav.tsx");
  assert.match(page, /<StoryContextNav story=\{story\}/);
  assert.match(page, /id="texto-da-materia"/);
  assert.match(page, /id="atualizacoes-da-materia"/);
  assert.match(page, /id="fontes-da-materia"/);
  assert.match(component, /href=\{"\/acervo#fontes-" \+ story.slug\}/);
  assert.match(component, /place.role === "mentioned"/);
  assert.match(component, /href=\{"\/territorios\/" \+ place.slug\}/);
  assert.match(page, /sharedPlace/);
});

test("Acervo mantém publicação canônica, referências externas e filtros", () => {
  const page = read("app/acervo/page.tsx");
  const source = read("components/editorial-source-index.tsx");
  assert.match(page, /EditorialAcervoIndex articles=\{articles\}/);
  assert.match(page, /EditorialSourceIndex articles=\{articles\}/);
  assert.match(page, /getPublishedArchiveFilteredAssets/);
  assert.match(page, /memoryItemId: activeMemory/);
  assert.match(page, /collectionHref=/);
  assert.match(source, /Fonte externa/);
  assert.match(source, /https\?:/);
  assert.match(source, /rel="noopener noreferrer"/);
  assert.match(source, /<details/);
  assert.doesNotMatch(page, /<EditorialCover/);
});

test("Bairros começa por fatos editoriais, sem manchetes ou mapas inventados", () => {
  const page = read("app/territorios/page.tsx");
  const helper = read("lib/territories/editorial.ts");
  assert.match(page, /newEditorialPlaces/);
  assert.match(page, /EditorialTerritoryIndex territories=\{newEditorialPlaces\}/);
  assert.match(page, /hubSlugs\.has/);
  assert.match(page, /getPublishedPlaceHubLinks/);
  assert.doesNotMatch(page, /<EditorialCover|home-callout|atlas vivo/);
  assert.match(helper, /article\.territories/);
  assert.doesNotMatch(helper, /article\.blocks\.map/);
});

test("Sem alterar a apuração, a localização citada continua apenas contextual", () => {
  const article = materia("troca-comando-28-bpm-invasao-vila-brasilia-volta-redonda");
  assert.equal(article.reviewed, true);
  assert.deepEqual(article.territories.map((place) => [place.slug, place.role]), [
    ["vila-brasilia", "main"], ["agua-limpa", "mentioned"]
  ]);
  const rua = materia("rua-33-cinco-anos-obra-contratos-custos-volta-redonda");
  assert.equal(rua.kind, "investigation");
});

test("UI V6 usa estilos separados, mobile compacto e foco visível", () => {
  const layout = read("app/layout.tsx");
  assert.ok(layout.indexOf('import "./portal-mobile-v5.css"') < layout.indexOf('import "./experience-v6.css"'));
  const css = read("app/experience-v6.css");
  assert.match(css, /\.vr6-hub__jump/);
  assert.match(css, /\.vr6-story-nav/);
  assert.match(css, /@media \(max-width: 700px\)/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /prefers-reduced-motion/);
});
