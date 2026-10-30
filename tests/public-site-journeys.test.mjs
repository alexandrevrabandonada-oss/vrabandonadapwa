import test from "node:test";
import assert from "node:assert/strict";
import { auditPublicSite } from "../scripts/audit-public-site.mjs";

const host = "https://www.vrabandonada.online";
const news = {slug:"explosao-csn", title:"Explosão na CSN & apuração", kind:"news",
  sources:[{url:"https://example.org/fonte"}], territories:[]};
const investigation = {slug:"rua-33-obras",title:"Rua 33: custos e contratos",kind:"investigation",
  sources:[{url:"https://example.org/contrato"}],
  territories:[{slug:"vila-santa-cecilia",role:"main"}]};
const articles=[news,investigation];

function samples() {
  return new Map(Object.entries({
    "/":"<html>VR Abandonada",
    "/noticias":"<html>Notícias",
    "/materias":"<html>Matérias: Explosão na CSN &amp; apuração; Rua 33: custos e contratos",
    "/dossies":"<html>Reportagens investigativas Rua 33: custos e contratos",
    "/acervo":"<html> fontes-reportagens fontes-explosao-csn fontes-rua-33-obras",
    "/territorios":'<html>Vila Brasília <a href="/territorios/vila-santa-cecilia">Bairro</a>',
    "/robots.txt":"Sitemap: "+host+"/sitemap.xml",
    "/sitemap.xml":"<urlset>"+articles.map(a=>host+"/materias/"+a.slug).join(""),
    "/feed.xml":"<rss>VR Abandonada "+articles.map(a=>host+"/materias/"+a.slug).join(""),
    "/materias/explosao-csn":'<html>'+news.title+'<link href="'+host+'/materias/'+news.slug+'"><script type="application/ld+json"></script>',
    "/materias/rua-33-obras":'<html>'+investigation.title+'<link href="'+host+'/materias/'+investigation.slug+'"><script type="application/ld+json"></script>',
  }));
}
function makeFetch(html, failing=[]) {
  return async (url) => {
    const path=new URL(url).pathname;
    if(failing.includes(path)) return {ok:false,status:503};
    const body=html.get(path);
    return body===undefined ? {ok:false,status:404} : {ok:true,status:200,text:async()=>body};
  };
}
test("audita as seis jornadas públicas e dois permalinks canônicos",async()=>{
  const result=await auditPublicSite(makeFetch(samples()),articles);
  assert.equal(result.ok,true,result.errors.join("; "));
  assert.equal(result.checked.length,11);
  for(const path of ["/acervo","/dossies","/territorios","/sitemap.xml","/feed.xml"]) assert.ok(result.checked.includes(path));
});
test("registra falha HTTP de Acervo em vez de afirmar catálogo vazio",async()=>{
  const result=await auditPublicSite(makeFetch(samples(),["/acervo"]),articles);
  assert.equal(result.ok,false);
  assert.ok(result.errors.some(e=>e.includes("/acervo: HTTP 503")));
});
test("detecta referências ausentes e investigação desaparecida",async()=>{
  const html=samples();
  html.set("/acervo","fontes-reportagens");
  html.set("/dossies","Reportagens investigativas");
  const result=await auditPublicSite(makeFetch(html),articles);
  assert.equal(result.ok,false);
  assert.ok(result.errors.some(e=>e.includes("/acervo: fontes da reportagem")));
  assert.ok(result.errors.some(e=>e.includes("/dossies: investigação publicada ausente")));
});
test("detecta falhas em sitemap, feed e rota de bairro principal",async()=>{
  const html=samples();
  html.set("/sitemap.xml","<urlset>"+host+"/materias/"+news.slug);
  html.set("/feed.xml","<rss>VR Abandonada");
  html.set("/territorios","Vila Brasília");
  const result=await auditPublicSite(makeFetch(html),articles);
  assert.equal(result.ok,false);
  assert.ok(result.errors.some(e=>e.includes("/sitemap.xml: permalink aprovado ausente")));
  assert.ok(result.errors.some(e=>e.includes("/feed.xml: permalink aprovado ausente")));
  assert.ok(result.errors.some(e=>e.includes("/territorios: bairro principal não encontrado")));
});
test("não exige fontes ou bairro principal de reportagem sem esse vínculo",async()=>{
  const html=samples();
  html.set("/acervo","fontes-reportagens");
  html.set("/territorios","Vila Brasília");
  const plain={...news,sources:[],territories:[{slug:"agua-limpa",role:"mentioned"}]};
  const result=await auditPublicSite(makeFetch(html),[plain]);
  assert.equal(result.ok,true,result.errors.join("; "));
});
