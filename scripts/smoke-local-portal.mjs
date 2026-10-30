/**
 * Smoke test de renderização HTTP local, no commit que o CI realmente compilou.
 * Não toca na produção, não consulta provedores externos e não depende de Vercel.
 * Não substitui QA visual nem testes de usuário.
 */
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const PORT = 38647;
const ORIGIN = "http://127.0.0.1:" + PORT;
const TIMEOUT = 45000;
const NEXT_BIN = join(process.cwd(), "node_modules", "next", "dist", "bin", "next");
const SLUG_RUA = "rua-33-cinco-anos-obra-contratos-custos-volta-redonda";
const SLUG_VILA = "troca-comando-28-bpm-invasao-vila-brasilia-volta-redonda";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function request(path, timeout = 15000) {
  const res = await fetch(ORIGIN + path, {
    headers: { "user-agent": "VRAbandonada-LocalSmoke/1.0" },
    cache: "no-store",
    signal: AbortSignal.timeout(timeout),
  });
  assert.equal(res.status, 200, path + " retornou HTTP " + res.status);
  return res.text();
}

async function run() {
  const article = JSON.parse(await readFile(join("content", "materias", SLUG_RUA + ".json"), "utf8"));
  const vila = JSON.parse(await readFile(join("content", "materias", SLUG_VILA + ".json"), "utf8"));
  assert.equal(article.status, "published");
  assert.equal(article.reviewed, true);
  assert.equal(vila.reviewed, true);

  let stderr = "";
  const child = spawn(process.execPath, [NEXT_BIN, "start", "--hostname", "127.0.0.1", "--port", String(PORT)], {
    env: { ...process.env, NODE_ENV: "production" },
    stdio: ["ignore", "ignore", "pipe"],
  });
  child.stderr?.on("data", (chunk) => { stderr = (stderr + chunk.toString()).slice(-3500); });

  try {
    const start = Date.now();
    let ready = false;
    while (Date.now() - start < TIMEOUT) {
      if (child.exitCode !== null) throw new Error("Next terminou antes de servir HTTP: " + stderr);
      try {
        const ping = await fetch(ORIGIN + "/robots.txt", { signal: AbortSignal.timeout(1600) });
        if (ping.status === 200) { ready = true; break; }
      } catch {}
      await sleep(600);
    }
    if (!ready) throw new Error("Next não ficou disponível no loopback em 45 s: " + stderr);

    const targets = [
      ["/", "A cidade não cabe no feed"],
      ["/agora", "Rua 33"],
      ["/noticias", "Notícias"],
      ["/dossies", "Reportagens investigativas"],
      ["/acervo", "fontes-reportagens"],
      ["/territorios", "Vila Brasília"],
      ["/materias/" + SLUG_RUA, article.title],
      ["/materias/" + SLUG_VILA, vila.title],
      ["/robots.txt", "Sitemap:"],
      ["/sitemap.xml", "<urlset"],
    ];
    for (const [path, expected] of targets) {
      const html = await request(path);
      assert.ok(html.includes(expected) || html.includes(expected.replaceAll("&", "&amp;")), path + " não contém o conteúdo esperado: " + expected);
      console.log("PASS HTTP 200 + conteúdo editorial:", path);
      if (path === "/dossies") {
        assert.ok(html.includes(article.title) || html.includes("Rua 33"), "A investigação Git deve aparecer em Casos mesmo sem Supabase");
      }
      if (path === "/acervo") {
        assert.ok(html.includes("fontes-" + SLUG_RUA), "Acervo deve permitir abrir fontes por matéria");
      }
    }
    const missing = await fetch(ORIGIN + "/materias/materia-inexistente-smoke", { signal: AbortSignal.timeout(15000) });
    assert.equal(missing.status, 404, "Matéria inexistente deve retornar 404");
    console.log("PASS HTTP 404:", "/materias/materia-inexistente-smoke");
    console.log("OK: smoke local completo. Não comprova viewport, teclado, rede externa ou Vercel.");
  } finally {
    if (child.exitCode === null) {
      child.kill("SIGTERM");
      await Promise.race([
        new Promise((resolve) => child.once("exit", resolve)),
        sleep(2000).then(() => { if (child.exitCode === null) child.kill("SIGKILL"); }),
      ]);
    }
  }
}

run().catch((error) => {
  console.error("Falha no smoke HTTP local:", error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
