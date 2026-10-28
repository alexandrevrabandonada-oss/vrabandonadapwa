import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read=(p)=>readFileSync(p,"utf8");

test("a marca preserva nome acessível com o texto visível e a função",()=>{
 const s=read("components/site-header.tsx");
 assert.ok(s.includes('<Link href="/" className="vr2-brand">'));
 assert.ok(s.includes('<span className="vr2-brand__mark">VR</span>'));
 assert.doesNotMatch(s,/aria-label="VR ABANDONADA/);
 assert.match(s,/VOLTA REDONDA · RJ/);
});
test("Explorar e Menu compartilham nome acessível e texto visível",()=>{
 const s=read("components/site-menu.tsx");
 assert.match(s,/Explorar — abrir menu principal/);
 assert.match(s,/Menu — abrir menu principal/);
});
test("a ação Ouvir inclui o texto visível no nome acessível",()=>{
 const s=read("components/reading-assistant-trigger.tsx");
 assert.match(s,/aria-label="Ouvir — abrir leitura assistida e modo baixa visão"/);
 assert.match(s,/>\s*Ouvir\s*</);
});
test("Casos na barra móvel combina nome visível e propósito",()=>{
 const s=read("components/mobile-bottom-nav.tsx");
 assert.match(s,/Casos — investigações em acompanhamento/);
 assert.match(read("lib/site.ts"),/href: "\/dossies", label: "Casos"/);
});
test("as ações da homepage nunca substituem o texto visível por outro rótulo",()=>{
 const s=read("app/page.tsx");
 assert.match(s,/aria-label="Buscar no site"/);
 assert.match(s,/Ler investigação: /);
 assert.match(s,/Ler notícia: /);
 assert.doesNotMatch(s,/aria-label="Pesquisar no site"/);
});
test("o teste de reflow verifica espaço de zoom equivalente sem afirmar zoom nativo",()=>{
 const s=read("scripts/audit-accessibility-v7.mjs");
 assert.match(s,/factor:2,width:640/);
 assert.match(s,/factor:4,width:320/);
 assert.match(s,/dimensions.scroll > dimensions.viewport \+ 2/);
 assert.match(s,/NÃO mede zoom nativo/);
});
