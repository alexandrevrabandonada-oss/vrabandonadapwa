import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read=(path)=>readFileSync(path,"utf8");
test("cabeçalho móvel com marca e ações na mesma linha",()=>{
 const css=read("app/portal-mobile-v5.css");
 assert.match(css,/grid-template-columns:\s*minmax\(0,1fr\)\s+auto/);
 assert.match(css,/site-header__tools\.vr2-header__tools/);
 assert.match(css,/flex-flow:\s*row nowrap/);
 assert.match(css,/site-header\.vr2-header \.vr4-header-search/);
 assert.match(css,/site-header\.vr2-header \.vr2-header__listen/);
 assert.match(read("app/layout.tsx"),/import "\.\/portal-mobile-v5\.css"/);
});
test("menu fixo limita cinco colunas e páginas não extrapolam largura",()=>{
 const css=read("app/portal-mobile-v5.css");
 assert.match(css,/grid-template-columns:repeat\(5,minmax\(0,1fr\)\)/);
 assert.match(css,/overflow:clip/);
 assert.match(css,/archive-page \.hero__title/);
 assert.match(css,/territories-page \.hero__title/);
 assert.match(css,/overflow-wrap:anywhere/);
});
test("home não repete matéria em destaque dentro de investigações",()=>{
 const s=read("app/page.tsx");
 assert.match(s,/story\.slug !== lead\?\.id/);
 assert.match(s,/investigationLead/);
 assert.match(s,/Investigação em destaque nesta edição/);
 assert.match(s,/item\.category\.startsWith\("Investigação"\)/);
});
test("acervo vazio não é uma tela de estatísticas zeradas",()=>{
 const s=read("app/acervo/page.tsx");
 assert.match(s,/if \(allAssets\.length === 0 && collections\.length === 0\)/);
 assert.match(s,/EditorialAcervoIndex/);
 assert.match(s,/getMaterias/);
 assert.match(s,/href="\/materias"/);
 assert.match(s,/href="\/dossies"/);
 assert.match(s,/Nada de registros fictícios/);
});
test("territórios sem cadastros não simulam atlas já preenchido",()=>{
 const s=read("app/territorios/page.tsx");
 assert.match(s,/if \(territories\.length === 0\)/);
 assert.match(s,/href="\/noticias"/);
 assert.match(s,/Vila Brasília/);
 assert.match(s,/EditorialTerritoryIndex/);
 assert.match(s,/getPublishedEditorialTerritories/);
});
test("reportagens e notícias permanecem intactas",()=>{
 const r=JSON.parse(read("content/materias/rua-33-cinco-anos-obra-contratos-custos-volta-redonda.json"));
 const n=JSON.parse(read("content/materias/troca-comando-28-bpm-invasao-vila-brasilia-volta-redonda.json"));
 assert.equal(r.kind,"investigation");
 assert.equal(n.kind,"news");
 assert.equal(n.reviewed,true);
 assert.equal(r.reviewed,true);
});
