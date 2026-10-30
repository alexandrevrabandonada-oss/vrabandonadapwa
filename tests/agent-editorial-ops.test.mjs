import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { auditPublicSite } from "../scripts/audit-public-site.mjs";

const host = "https://www.vrabandonada.online";
const fake = (url) => {
  const path = new URL(url).pathname;
  const texts = {
    "/": "<html><title>VR Abandonada</title></html>",
    "/noticias": "<html><h1>Notícias</h1>",
    "/materias": "<html><h1>O que acontece na cidade merece ficar registrado.</h1>Uma reportagem de teste",
    "/dossies": "<html>Reportagens investigativas",
    "/acervo": "<html>fontes-reportagens",
    "/territorios": "<html>Vila Brasília",
    "/robots.txt": "User-agent: *\nSitemap: " + host + "/sitemap.xml",
    "/sitemap.xml": '<?xml version="1.0"?><urlset><loc>' + host + '/materias/teste-jornalistico</loc></urlset>',
    "/feed.xml": "<rss><title>VR Abandonada</title><link>" + host + "/materias/teste-jornalistico</link></rss>",
    "/materias/teste-jornalistico": '<html><title>Uma reportagem de teste</title><link rel="canonical" href="' + host + '/materias/teste-jornalistico"><script type="application/ld+json">{}</script></html>',
  };
  if (!Object.hasOwn(texts, path)) return Promise.resolve({ ok:false,status:404 });
  return Promise.resolve({ok:true,text:()=>Promise.resolve(texts[path])});
};
test("audita caminhos públicos sem serviços pagos", async () => {
  const data=await auditPublicSite(fake, [{slug:"teste-jornalistico",title:"Uma reportagem de teste"}]);
  assert.equal(data.ok,true);
  assert.equal(data.checked.length,10);
});
test("falhas de SEO e rotas são reportadas", async () => {
  const broken=async (url)=>{
    const r=await fake(url);
    if (url.endsWith("/sitemap.xml")) return { ok:true,text:async()=>"<urlset></urlset>" };
    return r;
  };
  const data=await auditPublicSite(broken);
  assert.equal(data.ok,false);
  assert.match(data.errors.join(" "), /sitemap\.xml/);
});
test("painel interno exige autenticação, não envia material automaticamente", () => {
  const page=readFileSync("app/interno/agente/page.tsx","utf8");
  const component=readFileSync("components/agent-editorial-composer.tsx","utf8");
  assert.match(page, /supabase\.auth\.getUser\(\)/);
  assert.match(page, /redirect\("\/interno\/entrar"\)/);
  assert.match(page, /robots: \{ index: false/);
  assert.match(component, /navigator\.clipboard\.writeText\(prompt\)/);
  assert.doesNotMatch(component, /fetch\(/);
  assert.match(component, /Só após minha aprovação textual explícita/);
});
test("auditoria agendada abre um único issue e evita secrets externos", () => {
  const file=readFileSync(".github/workflows/audit-publication.yml","utf8");
  assert.match(file, /schedule:/);
  assert.match(file, /workflow_dispatch:/);
  assert.match(file, /issues: write/);
  assert.match(file, /gh issue create/);
  assert.match(file, /gh issue close/);
  assert.doesNotMatch(file, /INSTAGRAM_ACCESS_TOKEN|SUPABASE_SERVICE_ROLE/);
});
