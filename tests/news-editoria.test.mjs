import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { validateMateria } from "../scripts/validate-materias.mjs";
const read=(path)=>readFileSync(path,"utf8");
const rua=JSON.parse(read("content/materias/rua-33-cinco-anos-obra-contratos-custos-volta-redonda.json"));
const story={
  slug:"teste-editoria-noticia-2026",kind:"news",
  title:"Teste editorial de uma notícia local verificável",
  subtitle:"Exemplo de validação, sem publicação",
  summary:"Este é apenas um exemplo sintético destinado a verificar a validação, sem conteúdo editorial real.",
  section:"Cidade",author:"VR Abandonada",status:"published",reviewed:true,publishedAt:"2026-10-28T12:00:00-03:00",
  blocks:[{type:"paragraph",text:"Exemplo sintético apenas para testes."}],sources:[{label:"Fonte de exemplo",url:"https://example.org"}],
};
test("notícia, investigação e explicação possuem classificação válida",()=>{
  for(const kind of ["news","investigation","explainer"]) assert.deepEqual(validateMateria({...story,kind},story.slug+".json"),[]);
  assert.ok(validateMateria({...story,kind:"instagram"},story.slug+".json").some(e=>e.includes("formato editorial")));
});
test("Rua 33 permanece como investigação viva",()=>{
  assert.equal(rua.kind,"investigation"); assert.equal(rua.investigationStatus,"ongoing");
  assert.equal(rua.reviewed,true); assert.deepEqual(validateMateria(rua,rua.slug+".json"),[]);
});
test("notícias têm editoria própria, SEO e não inventam postagens",()=>{
  const page=read("app/noticias/page.tsx");
  assert.match(page,/materiaKind\(article\) === "news"/);
  assert.match(page,/canonical: "\/noticias"/);
  assert.match(page,/Não mostramos posts fictícios/);
  assert.match(page,/\/materias\//);
});
test("posts antigos permanecem acessíveis mas diretório muda de destino",()=>{
  assert.match(read("app/publicacoes/page.tsx"),/permanentRedirect\("\/noticias"\)/);
  assert.match(read("app/publicacoes/[id]/page.tsx"),/getInstagramPost\(id\)/);
});
test("últimas e RSS não confundem importação social com notícia",()=>{
  const agora=read("app/agora/page.tsx"),rss=read("app/feed.xml/route.ts");
  assert.match(agora,/\/noticias/); assert.doesNotMatch(agora,/getInstagramPosts\(/);
  assert.doesNotMatch(rss,/getInstagramPosts\(/); assert.match(rss,/getMaterias\(/);
});
test("navegação usa editoria Notícias e agente prepara notícia",()=>{
  assert.match(read("lib/site.ts"),/href: "\/noticias", label: "Notícias"/);
  const composer=read("components/agent-editorial-composer.tsx");
  assert.match(composer,/noticiar: "Preparar notícia/);
  assert.match(composer,/kind=news/);
});
test("JSON-LD distingue notícia de investigação",()=>{
  const page=read("app/materias/[slug]/page.tsx");
  assert.match(page,/NewsArticle/);assert.match(page,/materiaKindLabel\(story\)/);
});
