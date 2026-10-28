/**
 * QA de interface pública em Chromium contra o build local do HEAD exato.
 * Captura somente páginas públicas; não grava cookies, armazenamento, segredos
 * ou capturas de áreas autenticadas. Requer Playwright instalado no CI.
 */
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { chromium } from "playwright";

const PORT = 38649;
const BASE = "http://127.0.0.1:" + PORT;
const NEXT = join(process.cwd(), "node_modules", "next", "dist", "bin", "next");
const OUT = join(process.cwd(), "artifacts", "qa-v7-visual");
const RUA = "rua-33-cinco-anos-obra-contratos-custos-volta-redonda";
const VILA = "troca-comando-28-bpm-invasao-vila-brasilia-volta-redonda";
const pages = [
  { label: "inicio", path: "/" },
  { label: "casos", path: "/dossies" },
  { label: "acervo", path: "/acervo" },
  { label: "bairros", path: "/territorios" },
  { label: "reportagem-rua33", path: "/materias/" + RUA },
  { label: "reportagem-vila-brasilia", path: "/materias/" + VILA },
];
const profiles = [
  { label: "android-320", width: 320, height: 720, mobile: true },
  { label: "android-360", width: 360, height: 780, mobile: true },
  { label: "android-390", width: 390, height: 844, mobile: true },
  { label: "android-430", width: 430, height: 932, mobile: true },
  { label: "desktop-1440", width: 1440, height: 900, mobile: false },
];
const failures = [];
const results = [];

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
function record(label, error) {
  failures.push({ label, error: error instanceof Error ? error.message : String(error) });
  console.error("FAIL:", label, String(error?.message ?? error).slice(0, 500));
}
async function check(label, callback) {
  try { await callback(); console.log("PASS:", label); }
  catch (error) { record(label, error); }
}

async function run() {
  await mkdir(OUT, { recursive: true });
  const child = spawn(process.execPath, [NEXT, "start", "-H", "127.0.0.1", "-p", String(PORT)], {
    stdio: ["ignore", "ignore", "pipe"],
    env: { ...process.env, NODE_ENV: "production" },
  });
  let stderr = "";
  child.stderr?.on("data", (data) => { stderr = (stderr + data.toString()).slice(-2500); });
  let browser;
  try {
    let live = false;
    for (let i = 0; i < 75; i++) {
      if (child.exitCode !== null) throw new Error("O servidor Next terminou: " + stderr);
      try {
        const res = await fetch(BASE + "/robots.txt", { signal: AbortSignal.timeout(1400) });
        if (res.ok) { live = true; break; }
      } catch {}
      await pause(500);
    }
    assert.ok(live, "Next não iniciou em localhost: " + stderr);
    browser = await chromium.launch({ headless: true });

    for (const profile of profiles) {
      const context = await browser.newContext({
        viewport: { width: profile.width, height: profile.height },
        deviceScaleFactor: 1,
        isMobile: profile.mobile,
        hasTouch: profile.mobile,
        reducedMotion: "reduce",
        locale: "pt-BR",
      });
      const page = await context.newPage();
      const pageErrors = [];
      page.on("pageerror", (error) => pageErrors.push(error.message));
      for (const item of pages) {
        const label = profile.label + ":" + item.label;
        try {
          const res = await page.goto(BASE + item.path, { waitUntil: "domcontentloaded", timeout: 25000 });
          assert.equal(res?.status(), 200, "HTTP da rota " + item.path);
          await page.locator("main#conteudo").waitFor({ state: "visible", timeout: 10000 });
          await page.screenshot({
            path: join(OUT, profile.label + "-" + item.label + ".png"),
            fullPage: true, animations: "disabled", timeout: 20000,
          });
          const dimensions = await page.evaluate(() => ({
            viewport: document.documentElement.clientWidth,
            doc: document.documentElement.scrollWidth,
            body: document.body.scrollWidth,
          }));
          results.push({ label, url: item.path, ...dimensions });
          console.log("CAPTURE:", label, JSON.stringify(dimensions));
          assert.ok(dimensions.doc <= dimensions.viewport + 2,
            "Rolagem horizontal detectada: " + JSON.stringify(dimensions));
          if (item.label === "casos") {
            assert.ok(await page.locator('a[href="/materias/' + RUA + '"]').count() > 0,
              "A reportagem da Rua 33 não aparece em Casos");
          }
          if (item.label === "acervo") {
            assert.ok(await page.locator('details#fontes-' + RUA).count() > 0,
              "O Acervo não possui a seção de fontes da Rua 33");
          }
          if (item.label === "bairros") {
            assert.ok(await page.locator('a[href="/territorios/vila-brasilia"]').count() > 0,
              "O bairro Vila Brasília não é alcançável pela indexação");
          }
        } catch (error) {
          record(label, error);
        }
      }
      if (profile.mobile) {
        await check(profile.label + ":barra-movel", async () => {
          await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
          const nav = page.locator("nav.mobile-bottom-nav");
          assert.ok(await nav.isVisible(), "Barra móvel invisível");
          assert.equal(await nav.locator("a").count(), 4, "Barra móvel deve ter quatro destinos");
          await nav.locator('a[href="/dossies"]').click();
          await page.waitForURL("**/dossies", { timeout: 10000 });
          assert.ok(await page.getByRole("heading", { name: "Investigações", exact: true }).count() > 0);
        });
        await check(profile.label + ":menu-escape-foco", async () => {
          await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
          const trigger = page.locator(".mobile-bottom-nav .site-menu__trigger--mobile");
          await trigger.click();
          const dialog = page.locator('[role="dialog"].site-menu');
          await dialog.waitFor({ state: "visible", timeout: 10000 });
          await page.keyboard.press("Escape");
          await dialog.waitFor({ state: "detached", timeout: 10000 });
          assert.ok(await trigger.evaluate((el) => document.activeElement === el), "Foco não retornou ao menu");
        });
        await check(profile.label + ":artigo-acervo-fontes", async () => {
          await page.goto(BASE + "/materias/" + RUA, { waitUntil: "domcontentloaded" });
          const ref = page.locator('a[href="/acervo#fontes-' + RUA + '"]').first();
          assert.ok(await ref.isVisible(), "Link contextual para Acervo ausente");
          await ref.click();
          await page.waitForURL("**/acervo#fontes-" + RUA, { timeout: 10000 });
          await page.waitForFunction((slug) => document.querySelector("details#fontes-" + slug)?.open === true, RUA, { timeout: 10000 });
          assert.ok(await page.locator('details#fontes-' + RUA + ' a[target="_blank"]').count() > 0);
        });
      }
      if (pageErrors.length > 0) record(profile.label + ":excecoes-js", pageErrors.join("; ").slice(0, 800));
      await context.close();
    }
  } finally {
    await writeFile(join(OUT, "summary.json"), JSON.stringify({
      commit: process.env.GITHUB_SHA ?? "local", profiles: profiles.map((x) => x.label),
      checked: results.length, results, failures,
      disclaimer: "Testes em Chromium local com dados públicos disponíveis no runner; não é preview Vercel nem QA visual humano.",
    }, null, 2));
    if (browser) await browser.close();
    if (child.exitCode === null) {
      child.kill("SIGTERM");
      await Promise.race([new Promise((resolve) => child.once("exit", resolve)), pause(2000)]);
      if (child.exitCode === null) child.kill("SIGKILL");
    }
  }
  if (failures.length > 0) throw new Error(failures.length + " falha(s) de UX: ver summary.json e screenshots");
  console.log("SUCESSO: capturas Chromium e jornadas do leitor verificadas localmente.");
}
run().catch((error) => {
  console.error("Falha de QA visual automático:", error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
