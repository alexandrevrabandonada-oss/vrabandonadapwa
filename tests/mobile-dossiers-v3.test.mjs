import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");

test("Investigações não utiliza hero gigante ou categorias vazias", () => {
  const page = read("app/dossies/page.tsx");
  assert.match(page, /<h1>Investigações<\/h1>/);
  assert.match(page, /getPublicDossierCatalogState\(\)/);
  assert.match(page, /availability !== "available"/);
  assert.match(page, /getPublishedDossierUpdatesByDossierIds/);
  assert.match(page, /\.filter\(\(group\) => group\.items\.length > 0\)/);
  assert.match(page, /DOSSIÊS EM PREPARAÇÃO/);
  assert.doesNotMatch(page, /hero__title|landing-hero|<EditorialCover/);
  assert.doesNotMatch(page, /investigação em destaque|0 dossiê\(s\)/i);
});

test("UI móvel mantém tipografia de dossiês controlada e não cria overflow", () => {
  const css = read("app/portal-v2.css");
  assert.match(css, /\.vr3-dossiers__header h1[\s\S]*?font-size: clamp\(1\.82rem, 8vw, 2\.35rem\)/);
  assert.match(css, /\.vr3-dossiers__list \{ grid-template-columns: minmax\(0, 1fr\)/);
  assert.match(css, /\.vr3-dossiers__item h3 \{ font-size: 1\.18rem/);
  assert.match(css, /overflow-wrap: anywhere/);
  assert.match(css, /\.site-footer__inner[\s\S]*padding-block: \.85rem calc\(5\.9rem/);
});

test("Rodapé não anuncia tecnologias e informações de implantação", () => {
  const footer = read("components/site-footer.tsx");
  assert.match(footer, /Jornalismo independente sobre Volta Redonda/);
  assert.doesNotMatch(footer, /base inicial|Vercel, PWA/);
  const home = read("app/page.tsx");
  assert.doesNotMatch(home, /vr2-home__endnote/);
});
