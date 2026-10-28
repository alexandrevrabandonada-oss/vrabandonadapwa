import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");

test("navegação inferior possui exatamente quatro destinos mais o Menu", () => {
  const config = read("lib/site.ts");
  const matches = config.match(/mobileNav:\s*\[([\s\S]*?)\]\s*satisfies SiteLink\[\]/);
  assert.ok(matches, "mobileNav missing");
  assert.equal((matches[1].match(/\{\s*href:/g) || []).length, 4, "four links plus one menu is the mobile layout");
  const nav = read("components/mobile-bottom-nav.tsx");
  assert.match(nav, /<SiteMenu variant="mobile"/);
  const css = read("app/portal-v2.css");
  assert.match(css, /grid-template-columns:\s*repeat\(5,minmax\(0,1fr\)\)/);
  assert.match(css, /height:\s*calc\(63px \+ env\(safe-area-inset-bottom\)\)/);
});

test("leitor de voz não abre automaticamente e não rola a tela no carregamento", () => {
  const source = read("components/reading-assistant.tsx");
  assert.match(source, /const \[open, setOpen\] = useState\(false\)/);
  assert.doesNotMatch(source, /getReadingAssistantOpenKey/);
  assert.match(source, /!open\) return null/);
  assert.match(source, /onClick=\{\(\) => \{ stop\(\); setOpen\(false\)/);
  assert.match(source, /Navegar pelo site nunca deve reabrir um painel/);
});

test("homepage apresenta notícias reais antes de blocos institucionais", () => {
  const page = read("app/page.tsx");
  assert.match(page, /getMaterias\(\)/);
  assert.match(page, /getPublishedEditorialItems\(\)/);
  assert.match(page, /getPublishedDossiers\(\)/);
  assert.match(page, /getPublishedPlaceHubs\(\)/);
  assert.match(page, /ACERVO EM CONSTRUÇÃO/);
  assert.ok(page.indexOf("vr2-latest-heading") < page.indexOf("vr2-investigations-heading"));
  assert.ok(page.indexOf("vr2-investigations-heading") < page.indexOf("vr2-neighborhood-heading"));
  assert.doesNotMatch(page, /HomeReturnPanel/);
  assert.doesNotMatch(page, /editorialMockItems/);
});

test("layout carrega o novo sistema visual sem desmontar as rotas existentes", () => {
  const layout = read("app/layout.tsx");
  assert.match(layout, /import "\.\/portal-v2\.css"/);
  assert.match(layout, /<main id="conteudo"/);
  assert.match(layout, /<MobileBottomNav/);
  assert.match(layout, /<ReadingAssistant/);
});
