import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = (path) => readFileSync(path, "utf8");

test("Acervo distingue consulta válida sem documentos de catálogo indisponível", () => {
  const query = read("lib/archive/queries.ts");
  const page = read("app/acervo/page.tsx");
  assert.match(query, /export async function getPublicArchiveCatalogState/);
  for (const state of ["available", "not_configured", "unavailable"])
    assert.ok(query.includes('availability: "' + state + '"'), state);
  assert.doesNotMatch(query, /error \|\| !data \|\| data\.length === 0/);
  assert.match(page, /archiveAvailability !== "available"/);
  assert.match(page, /role="status"/);
  assert.match(page, /Isso não significa que o acervo esteja vazio/);
  assert.match(page, /getPublicArchiveCatalogState\(\)/);
  assert.doesNotMatch(page, /getPublishedArchiveFilteredAssets\(/);
});
test("Acervo filtra localmente a única lista obtida do Supabase", () => {
  const query = read("lib/archive/queries.ts");
  const page = read("app/acervo/page.tsx");
  assert.match(query, /export function filterPublishedArchiveAssets/);
  assert.match(query, /filterPublicAssets\(assets, filter\)/);
  assert.match(page, /filterPublishedArchiveAssets\(allAssets,/);
});
test("Bairros não confundem ausência de configuração com ausência de lugares", () => {
  const query = read("lib/territories/queries.ts");
  const page = read("app/territorios/page.tsx");
  assert.match(query, /export async function getPublicPlaceCatalogState/);
  for (const state of ["available", "not_configured", "unavailable"])
    assert.ok(query.includes('availability: "' + state + '"'), state);
  assert.doesNotMatch(query, /error \|\| !data \|\| data\.length === 0/);
  assert.match(page, /getPublicPlaceCatalogState\(\)/);
  assert.match(page, /placeAvailability !== "available"/);
  assert.match(page, /territories\.length === 0 && editorialTerritories\.length === 0 && placeAvailability === "available"/);
  assert.match(page, /role="status"/);
  assert.match(page, /EditorialTerritoryIndex territories=\{newEditorialPlaces\}/);
});
test("Rotas existentes e consumidores internos mantêm os métodos de lista", () => {
  assert.match(read("lib/archive/queries.ts"), /export async function getPublishedArchiveAssets\(\)/);
  assert.match(read("lib/territories/queries.ts"), /export async function getPublishedPlaceHubs\(\)/);
});
