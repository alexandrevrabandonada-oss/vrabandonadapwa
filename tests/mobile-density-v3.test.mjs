import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");

test("homepage compacta descreve ausência de publicação sem notícias falsas", () => {
  const source = read("app/page.tsx");
  assert.match(source, /As primeiras reportagens estão em revisão/);
  assert.match(source, /PUBLICAÇÕES EM PREPARAÇÃO/);
  assert.match(source, /TEMA DE COBERTURA/);
  assert.match(source, /getPublishedEditorialItems/);
  assert.match(source, /getMaterias\(\)/);
  assert.doesNotMatch(source, /\\bpublished:\\s*true/);
});

test("Agora lista conteúdos publicados e não exibe radar fictício", () => {
  const source = read("app/agora/page.tsx");
  assert.match(source, /getRadarPageData/);
  assert.match(source, /getMaterias/);
  assert.doesNotMatch(source, /getInstagramPosts/);
  assert.match(source, /\/noticias/);
  assert.match(source, /sort\(\(a, b\)/);
  assert.match(source, /As primeiras publicações do novo arquivo estão em preparação/);
  assert.doesNotMatch(source, /<EditorialCover/);
  assert.doesNotMatch(source, /Última atualização/i);
  assert.match(source, /id="mudou"/);
});

test("CSS mobile limita tamanho do hero e dos cards e não esconde a barra inferior", () => {
  const source = read("app/portal-v2.css");
  const lastMobile = source.slice(source.indexOf("/* Iteração de densidade editorial"));
  assert.match(lastMobile, /vr2-opening__title h1[\s\S]*?font-size:\s*clamp\(2\.05rem,\s*8\.8vw,\s*2\.6rem\)/);
  assert.match(lastMobile, /vr2-investigation[\s\S]*?min-height:\s*0/);
  assert.match(lastMobile, /vr2-empty-news[\s\S]*?min-height:\s*0/);
  assert.match(lastMobile, /vr2-about[\s\S]*?background:\s*#201f1c/);
  assert.match(source, /overflow-wrap:\s*anywhere/);
});

test("PWA incrementa cache e não guarda navegação personalizada", () => {
  const source = read("public/sw.js");
  assert.match(source, /vr-abandonada-pwa-v3/);
  assert.match(source, /vr-abandonada-runtime-v3/);
  assert.match(source, /url\.pathname\.startsWith\("\/interno"\)/);
  assert.match(source, /networkFirst\(request, false\)/);
  assert.match(source, /private\|no-store\|no-cache/);
});
