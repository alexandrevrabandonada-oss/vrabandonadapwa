import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");
const tokens = read("app/design-tokens.css");
const site = read("lib/site.ts");

function luminance(hex) {
  const parts = hex.match(/[a-f\\d]{2}/gi).map((x) => parseInt(x, 16) / 255);
  return parts.reduce((n, x, i) => n + (x <= .04045 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4) * [.2126,.7152,.0722][i], 0);
}
function contrast(a, b) {
  const light = Math.max(luminance(a), luminance(b));
  const dark = Math.min(luminance(a), luminance(b));
  return (light + .05) / (dark + .05);
}
function color(name) {
  const m = tokens.match(new RegExp(name + ":\\s*(#[0-9a-fA-F]{6})"));
  assert.ok(m, name + " missing from token file");
  return m[1];
}

test("base cromática tem contraste AA de texto e ações", () => {
  assert.ok(contrast(color("--ds-text"), color("--ds-canvas")) >= 7);
  assert.ok(contrast(color("--ds-text-secondary"), color("--ds-surface")) >= 4.5);
  assert.ok(contrast(color("--ds-ink-on-accent"), color("--ds-accent")) >= 4.5);
  assert.ok(contrast(color("--ds-accent"), color("--ds-canvas")) >= 4.5);
});

test("tokens são carregados antes de todos os sistemas visuais específicos", () => {
  const layout = read("app/layout.tsx");
  const ordered = [
    'import "./globals.css";',
    'import "./design-tokens.css";',
    'import "./portal-v2.css";',
    'import "./editorial-v4.css";',
    'import "./portal-mobile-v5.css";',
    'import "./experience-v6.css";',
  ];
  const positions = ordered.map((line) => layout.indexOf(line));
  assert.ok(positions.every((position) => position >= 0));
  assert.deepEqual(positions, [...positions].sort((a, b) => a - b));
  for (const path of ["app/experience-v6.css", "app/portal-v2.css", "components/editorial-navigation.css", "app/materias.css"]) {
    assert.match(read(path), /var\\(--ds-/);
  }
  assert.match(tokens, /prefers-reduced-motion/);
  assert.match(tokens, /:focus-visible/);
});

test("Acervo e Bairros usam uma única estrutura de cabeçalho responsiva e acessível", () => {
  const component = read("components/editorial-hub-intro.tsx");
  for (const path of ["app/acervo/page.tsx", "app/territorios/page.tsx"]) {
    const page = read(path);
    assert.match(page, /<EditorialHubIntro/);
    assert.doesNotMatch(page, /<header className="vr6-hub__head">/);
    assert.match(page, /navigationLabel=/);
  }
  assert.match(component, /<h1>\\{title\\}<\\/h1>/);
  assert.match(component, /aria-label=\\{navigationLabel\\}/);
  assert.match(component, /item\\.href\\.startsWith\\("#"\\)/);
  assert.match(component, /<Link href=\\{item\\.href\\}/);
});

test("barra móvel oferece quatro tarefas distintas mais Menu, sem excluir Notícias", () => {
  const match = site.match(/mobileNav:\\s*\\[([\\s\\S]*?)\\]\\s*satisfies SiteLink\\[\\]/);
  assert.ok(match);
  const section = match[1];
  assert.equal((section.match(/\\{\\s*href:/g) ?? []).length, 4);
  for (const route of ['"/"', '"/agora"', '"/dossies"', '"/buscar"']) assert.ok(section.includes("href: " + route));
  assert.doesNotMatch(section, /href: "\\/noticias"/);
  assert.match(site, /href: "\\/noticias"/);
  assert.match(read("components/mobile-bottom-nav.tsx"), /<SiteMenu variant="mobile"\\s*\\/>/);
  assert.match(read("components/mobile-bottom-nav.tsx"), /Investigações em acompanhamento/);
});

test("mudança de estilo não altera as reportagens já revisadas", () => {
  const rua = JSON.parse(read("content/materias/rua-33-cinco-anos-obra-contratos-custos-volta-redonda.json"));
  const vila = JSON.parse(read("content/materias/troca-comando-28-bpm-invasao-vila-brasilia-volta-redonda.json"));
  assert.equal(rua.reviewed, true);
  assert.equal(vila.reviewed, true);
  assert.equal(rua.territories[0].role, "main");
  assert.equal(vila.territories.find((place) => place.slug === "agua-limpa")?.role, "mentioned");
});
