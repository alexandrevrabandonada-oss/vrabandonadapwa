import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (p) => readFileSync(p,"utf8");

test("homepage evita duplicar investigações já visíveis no feed", () => {
  const home = read("app/page.tsx");
  assert.match(home, /const visibleFeedIds = new Set/);
  assert.match(home, /\.filter\(\(story\) => !visibleFeedIds\.has\("materia-" \+ story\.slug\)\)/);
  assert.match(home, /Investigação em acompanhamento/);
  assert.match(home, /Ver histórico e fontes/);
  assert.doesNotMatch(home, /story\.slug !== lead\?\.id/);
});

test("bairro com hub prioriza cobertura editorial verificada antes de telas de processo", () => {
  const page = read("app/territorios/[slug]/page.tsx");
  const section = page.slice(page.indexOf('<Container className="intro-grid territory-detail-page">'));
  const feed = section.indexOf('<EditorialTerritoryFeed place={editorialPlace} />');
  const explanation = section.indexOf('<section className="section editorial-article">');
  assert.ok(feed !== -1 && explanation !== -1 && feed < explanation);
  assert.equal(section.split('<EditorialTerritoryFeed place={editorialPlace} />').length-1,1);
});

test("link ao acervo revela a lista da reportagem correspondente", () => {
  const sources = read("components/editorial-source-index.tsx");
  const nav = read("components/story-context-nav.tsx");
  const acervo = read("app/acervo/page.tsx");
  const reveal = read("components/reveal-source-from-hash.tsx");
  assert.match(sources, /id=\{"fontes-" \+ article\.slug\}/);
  assert.match(nav, /href=\{"\/acervo#fontes-" \+ story\.slug\}/);
  assert.match(acervo, /<RevealSourceFromHash\s*\/>/);
  assert.match(reveal, /decodeURIComponent\(window\.location\.hash\.slice\(1\)\)/);
  assert.match(reveal, /target instanceof HTMLDetailsElement/);
  assert.match(reveal, /target\.open = true/);
  assert.match(reveal, /hashchange/);
  assert.match(reveal, /removeEventListener/);
});
