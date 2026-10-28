import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");

test("a rota Casos exibe investigações publicadas sem depender da existência de dossiês no banco", () => {
  const page = read("app/dossies/page.tsx");
  const navigation = read("lib/site.ts");
  assert.ok(page.includes("getMaterias()"));
  assert.ok(page.includes('materiaKind(article) === "investigation"'));
  assert.ok(page.includes("investigativeArticles.map((article)"));
  assert.ok(page.includes('<EditorialStoryCard'));
  assert.ok(page.includes('investigativeArticles.length === 0'));
  assert.ok(page.includes("Reportagens investigativas"));
  assert.ok(page.includes('contextLabel={article.investigationStatus === "ongoing"'));
  assert.ok(navigation.includes('{ href: "/dossies", label: "Casos" }'));
  assert.ok(page.includes('getPublishedDossiers()'));
  assert.ok(page.includes("groups.map((group)"));
});

test("um cartão de reportagem é reutilizado por Acervo e bairro sem duplicar URLs", () => {
  const card = read("components/editorial-story-card.tsx");
  const indexes = read("components/editorial-navigation.tsx");
  const page = read("app/dossies/page.tsx");

  assert.ok(indexes.includes('<EditorialStoryCard key={article.slug} article={article} showMainPlaces'));
  assert.ok(indexes.includes('headingLevel={4}'));
  assert.ok(indexes.includes('contextLabel={group.label}'));
  assert.ok(page.includes('<EditorialStoryCard'));
  assert.ok(card.includes('"/materias/" + article.slug'));
  assert.ok(card.includes('"/acervo#fontes-" + article.slug'));
  assert.ok(card.includes('place.role === "main"'));
  assert.ok(card.includes("publishedDate(article.publishedAt)"));
  assert.ok(card.includes('data-reading-title'));
  assert.ok(card.includes('data-reading-summary'));
  assert.ok(card.includes("contextLabel ? contextLabel"));
  assert.ok(card.includes('source.url'));
});

test("módulos diferentes compartilham superfície visual mas mantêm etiquetas e conteúdo próprios", () => {
  const files = [
    "components/editorial-story-card.tsx",
    "components/archive-asset-card.tsx",
    "components/archive-collection-card.tsx",
    "components/place-hub-card.tsx",
    "components/dossier-card.tsx",
    "components/editorial-navigation.tsx",
    "app/dossies/page.tsx",
    "app/territorios/page.tsx",
  ];
  for (const path of files) {
    assert.ok(read(path).includes("vr7-editorial-card"), path + " sem superfície comum");
  }
  const asset = read("components/archive-asset-card.tsx");
  assert.ok(asset.includes("isArchiveVisualAsset(asset)"));
  assert.ok(asset.includes("getArchiveAssetTypeLabel(asset.asset_type)"));
  assert.ok(asset.includes("asset.public_visibility"));
  const dossier = read("components/dossier-card.tsx");
  assert.ok(dossier.includes("getDossierStatusLabel(dossier.status)"));
  assert.ok(dossier.includes("latestUpdate"));
  const territory = read("components/editorial-navigation.tsx");
  assert.ok(territory.includes("menção contextual"));
});

test("design system oferece toque, foco, responsividade e movimento reduzido", () => {
  const css = read("app/editorial-cards-v7.css");
  const layout = read("app/layout.tsx");
  const tokens = read("app/design-tokens.css");
  assert.ok(layout.indexOf('import "./experience-v6.css";') < layout.indexOf('import "./editorial-cards-v7.css";'));
  assert.ok(css.includes("var(--ds-tap-target)"));
  assert.ok(css.includes(":focus-within"));
  assert.ok(css.includes("@media (max-width: 760px)"));
  assert.ok(css.includes("@media (prefers-reduced-motion: reduce)"));
  assert.ok(css.includes("var(--ds-border)"));
  assert.ok(tokens.includes("--ds-surface"));
});

test("publicações investigativas aprovadas continuam com os mesmos dados de origem", () => {
  const rua = JSON.parse(read("content/materias/rua-33-cinco-anos-obra-contratos-custos-volta-redonda.json"));
  const vila = JSON.parse(read("content/materias/troca-comando-28-bpm-invasao-vila-brasilia-volta-redonda.json"));
  assert.equal(rua.reviewed, true);
  assert.equal(rua.kind, "investigation");
  assert.equal(vila.reviewed, true);
  assert.equal(vila.kind, "news");
});
