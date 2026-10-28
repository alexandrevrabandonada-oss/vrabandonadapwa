/**
 * Auditoria automatizada de acessibilidade da experiência pública.
 * Não afirma conformidade WCAG: busca falhas detectáveis por axe e reflow
 * sob larguras equivalentes a zoom 200%/400% no desktop (reflow).
 */
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const PORT = 38651;
const BASE = "http://127.0.0.1:" + PORT;
const NEXT = join(process.cwd(), "node_modules", "next", "dist", "bin", "next");
const OUT = join(process.cwd(), "artifacts", "qa-v7-accessibility");
const RUA = "/materias/rua-33-cinco-anos-obra-contratos-custos-volta-redonda";
const PAGES = [
  { key: "inicio", url: "/" },
  { key: "casos", url: "/dossies" },
  { key: "acervo", url: "/acervo" },
  { key: "bairros", url: "/territorios" },
  { key: "reportagem", url: RUA },
];
const profiles = [
  { name: "mobile-390", width: 390, height: 844, isMobile: true },
  { name: "desktop-1280", width: 1280, height: 900, isMobile: false },
];
const tags = ["wcag2a","wcag2aa","wcag21a","wcag21aa","wcag22aa"];
const report = { commit: process.env.GITHUB_SHA ?? "local", scans: [], reflow: [], errors: [] };
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
function fail(context, message) {
  report.errors.push({ context, message: String(message) });
  console.error("FAIL:", context, String(message).slice(0, 900));
}
async function audit() {
  await mkdir(OUT, { recursive: true });
  const server = spawn(process.execPath, [NEXT, "start", "-H", "127.0.0.1", "-p", String(PORT)], {
    stdio: ["ignore", "ignore", "pipe"],
    env: { ...process.env, NODE_ENV: "production" },
  });
  let serverErr = "";
  server.stderr.on("data", chunk => { serverErr = (serverErr + chunk.toString()).slice(-2500); });
  let browser;
  try {
    let ready = false;
    for (let i = 0; i < 75; i++) {
      if (server.exitCode !== null) throw new Error("Next encerrou antes de iniciar: " + serverErr);
      try {
        const response = await fetch(BASE + "/robots.txt", { signal: AbortSignal.timeout(1200) });
        if (response.ok) { ready = true; break; }
      } catch {}
      await sleep(500);
    }
    assert.ok(ready, "Servidor não respondeu ao healthcheck");
    browser = await chromium.launch({headless:true});

    for (const profile of profiles) {
      const context = await browser.newContext({
        viewport: {width:profile.width,height:profile.height},
        isMobile: profile.isMobile,
        hasTouch: profile.isMobile,
        locale:"pt-BR", reducedMotion:"reduce",
      });
      const page = await context.newPage();
      try {
        for (const entry of PAGES) {
          const label = profile.name + ":" + entry.key;
          try {
            const response = await page.goto(BASE + entry.url, {waitUntil:"domcontentloaded",timeout:30000});
            assert.equal(response?.status(), 200, "Página não renderiza " + entry.url);
            await page.locator("main#conteudo").waitFor({state:"visible",timeout:12000});
            const result = await new AxeBuilder({page}).withTags(tags).analyze();
            const relevant = result.violations.filter(v => v.impact === "serious" || v.impact === "critical");
            const records = result.violations.map(v => ({
              id: v.id, impact:v.impact, description:v.help,
              nodes:v.nodes.slice(0,5).map(n=>({
                target:n.target, failureSummary:n.failureSummary?.slice(0,400),
              })),
              count:v.nodes.length,
            }));
            report.scans.push({label,pass:result.passes.length,issues:records});
            console.log("AXE:", label, JSON.stringify(records.map(x=>({id:x.id,impact:x.impact,count:x.count}))));
            if (relevant.length) fail(label, relevant.map(v=>v.id + "(" + v.impact + ":" + v.nodes.length + ")").join(", "));
          } catch(err) { fail(label,err instanceof Error?err.message:String(err)); }
        }
        // O Chrome não oferece ajuste confiável de fonte via DOM quando
        // o site possui estilos persistentes. Reflow por viewport estreita
        // é equivalente à largura disponível em zoom 200% e 400% de 1280px,
        // mas NÃO mede zoom nativo nem aumento de fonte.
        if (!profile.isMobile) {
          for (const zoom of [{factor:2,width:640},{factor:4,width:320}]) {
            await page.setViewportSize({width:zoom.width,height:900});
            for (const entry of PAGES) {
              const label = profile.name + ":" + entry.key + ":reflow-" + zoom.factor + "x";
              try {
                await page.goto(BASE + entry.url,{waitUntil:"domcontentloaded",timeout:30000});
                await page.locator("main#conteudo").waitFor({state:"visible",timeout:12000});
                const dimensions = await page.evaluate(() => ({
                  viewport:document.documentElement.clientWidth,
                  scroll:document.documentElement.scrollWidth,
                  mainVisible:!!document.querySelector("main#conteudo"),
                }));
                report.reflow.push({label,...dimensions});
                console.log("REFLOW:",label,JSON.stringify(dimensions));
                if (dimensions.scroll > dimensions.viewport + 2) {
                  await page.screenshot({path:join(OUT,"reflow-"+zoom.factor+"x-"+entry.key+".png"),fullPage:true,animations:"disabled"});
                  fail(label,"Overflow horizontal de "+(dimensions.scroll-dimensions.viewport)+"px");
                }
                if (!dimensions.mainVisible) fail(label,"Conteúdo principal ausente");
              } catch(err){fail(label,err instanceof Error?err.message:String(err));}
            }
          }
        }
      } finally { await context.close(); }
    }
  } finally {
    await writeFile(join(OUT,"report.json"),JSON.stringify({
      ...report,limitations:"Auditoria axe em Chromium local; reflow por viewport 640/320 equivalente ao espaço de 200/400% zoom em desktop de 1280px, mas não verifica zoom nativo, preferências de tamanho de fonte, dispositivo físico ou leitor de tela.",
    },null,2));
    if(browser)await browser.close();
    if(server.exitCode===null){
      server.kill("SIGTERM");
      await Promise.race([new Promise(resolve=>server.once("exit",resolve)),sleep(1800)]);
      if(server.exitCode===null)server.kill("SIGKILL");
    }
  }
  if(report.errors.length)throw new Error(report.errors.length+" falhas de acessibilidade/reflow; detalhes no report.json");
  console.log("SUCESSO: auditoria axe e reflow de largura equivalente a zoom 200/400% sem falhas graves detectadas.");
}
audit().catch(err=>{console.error("Falha no QA acessível:",err instanceof Error?err.message:String(err));process.exitCode=1;});
