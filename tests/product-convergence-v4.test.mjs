import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");

test("a homepage mostra conteúdo editorial antes da navegação secundária e elimina capas genéricas gigantes", () => {
  const home = read("app/page.tsx");
  const css = read("app/portal-v2.css");
  assert.ok(home.indexOf("vr4-home-intro") < home.indexOf("vr2-latest-heading"));
  assert.ok(home.indexOf("vr2-latest-heading") < home.indexOf("vr2-investigations-heading"));
  assert.match(home, /lead\.image \? \(/);
  assert.match(home, /vr2-lead--text-only/);
  assert.doesNotMatch(home, /<div className="vr2-lead__graphic"/);
  assert.match(css, /\.vr4-home-intro h1/);
  assert.match(css, /\.vr2-lead--text-only/);
  assert.match(home, /PUBLICAÇÕES EM PREPARAÇÃO/);
});

test("reportagens investigativas reais do Git entram na vitrine de investigações sem forjar dossiês", () => {
  const home = read("app/page.tsx");
  const dossiers = read("app/dossies/page.tsx");
  assert.match(home, /materiaKind\(article\) === "investigation"/);
  assert.match(home, /href: "\/materias\/" \+ article\.slug/);
  assert.match(home, /kind: "Dossiê"/);
  assert.match(dossiers, /getMaterias\(\)/);
  assert.match(dossiers, /investigativeArticles\.map/);
  assert.match(dossiers, /href=\{"\/materias\/" \+ article\.slug\}/);
  assert.match(dossiers, /reportagens-em-acompanhamento/);
  assert.match(dossiers, /!investigativeArticles\.length/);
  assert.match(dossiers, /DOSSIÊS EM PREPARAÇÃO/);
});

test("navegação mantém as rotas legadas e apresenta papéis públicos distintos", () => {
  const site = read("lib/site.ts");
  const mobile = read("components/mobile-bottom-nav.tsx");
  const match = site.match(/mobileNav:\s*\[([\s\S]*?)\]\s*satisfies SiteLink\[\]/);
  assert.ok(match);
  assert.equal((match[1].match(/\{\s*href:/g) || []).length, 4);
  for (const route of ["/agora", "/noticias", "/materias", "/dossies", "/acervo", "/memoria", "/territorios", "/envie", "/metodo", "/salvos"]) {
    assert.ok(site.includes('href: "' + route + '"'), route);
  }
  assert.match(site, /Enviar informação à redação/);
  assert.match(site, /Documentos e acervo/);
  assert.match(mobile, /SiteMenu variant="mobile"/);
});
