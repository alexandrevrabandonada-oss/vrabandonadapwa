import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");
const home = read("app/page.tsx");
const nav = read("lib/site.ts");
const css = read("app/editorial-v4.css");

test("home prioriza notícia real sem capa genérica e tem H1 compacto", () => {
  assert.match(home, /<header className="vr4-home-intro">/);
  assert.ok(home.indexOf("vr4-home-intro") < home.indexOf('vr2-latest-heading'));
  assert.ok(home.indexOf('vr2-latest-heading') < home.indexOf('vr2-investigations-heading'));
  assert.match(home, /lead\.image \? "vr2-lead" : "vr2-lead vr4-lead--text-only"/);
  assert.doesNotMatch(home, /<div className="vr2-lead__graphic"/);
  assert.match(home, /As primeiras reportagens estão em revisão/);
});
test("investigações Git-first reais prevalecem sobre tópicos genéricos", () => {
  assert.match(home, /materias\.filter\(\(story\) => materiaKind\(story\) === "investigation"\)/);
  assert.match(home, /investigationStories\.map/);
  assert.match(home, /: featuredDossiers\.length/);
  assert.match(home, /TEMA DE COBERTURA/);
});
test("a barra móvel mostra Notícias e Últimas sem duplicar Menu", () => {
  const matches=nav.match(/mobileNav:\s*\[([\s\S]*?)\]\s*satisfies SiteLink\[\]/);
  assert.ok(matches);
  assert.equal((matches[1].match(/\{\s*href:/g)||[]).length, 4);
  assert.match(matches[1],/href: "\/noticias"/);
  assert.match(matches[1],/href: "\/agora"/);
  assert.match(matches[1],/href: "\/dossies"/);
  assert.match(read("components/mobile-bottom-nav.tsx"),/<SiteMenu variant="mobile"/);
  assert.match(css,/\.vr2-header \.site-menu__trigger \{display:none\}/);
});
test("busca móvel é acessível no cabeçalho, com rótulo", () => {
  const source=read("components/site-header.tsx");
  assert.match(source,/href="\/buscar" className="vr4-header-search" aria-label="Buscar no VR Abandonada"/);
  assert.match(css,/\.vr4-header-search \{display:inline-flex\}/);
});
test("menu tem gestão do foco, Escape, Tab e rolagem bloqueada",()=>{
  const menu=read("components/site-menu.tsx");
  assert.match(menu,/dialogRef\.current/);
  assert.match(menu,/document\.body\.style\.overflow = "hidden"/);
  assert.match(menu,/event\.key === "Escape"/);
  assert.match(menu,/event\.key !== "Tab"/);
  assert.match(menu,/ref=\{dialogRef\}/);
  assert.match(menu,/previouslyFocused\.focus\(\)/);
});
test("leitura mobile, área segura e acessibilidade mantidas",()=>{
  assert.match(css,/\.vr-materia__head h1 \{font-size:clamp\(1\.75rem,7\.6vw,2\.28rem\)/);
  assert.match(css,/\.site-footer \{padding-bottom:calc\(5rem \+ env\(safe-area-inset-bottom\)\)/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
  assert.match(read("app/layout.tsx"),/import "\.\/editorial-v4\.css"/);
});
