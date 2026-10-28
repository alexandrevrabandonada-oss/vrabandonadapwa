/**
 * Monitor público e determinístico: detecta quebra de homepage/SEO/RSS.
 * Não se conecta ao Search Console e NÃO garante indexação no Google.
 * Sem tokens de terceiros, sem conteúdo privado.
 */
import { readFile, readdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const HOST = "https://www.vrabandonada.online";

function contains(text, expected) { return text.includes(expected); }

async function request(url, fetchImpl) {
  let lastError;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetchImpl(url, { signal: AbortSignal.timeout(12000), headers: { "user-agent": "VRAbandonada-PublicationAudit/1.0" }, cache: "no-store" });
      if (!response.ok) throw new Error("HTTP " + response.status);
      return await response.text();
    } catch (error) {
      lastError = error;
      if (attempt === 0) await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  throw lastError;
}

export async function auditPublicSite(fetchImpl = fetch, articles = []) {
  const errors = [];
  const checked = [];
  const targets = [
    { path: "/", must: ["<html", "VR Abandonada"] },
    { path: "/robots.txt", must: ["Sitemap:", "/sitemap.xml"] },
    { path: "/sitemap.xml", must: ["<urlset", HOST] },
    { path: "/feed.xml", must: ["<rss", "VR Abandonada"] },
  ];
  for (const target of targets) {
    try {
      const html = await request(HOST + target.path, fetchImpl);
      for (const match of target.must) if (!contains(html, match)) errors.push(target.path + ": ausência de " + match);
      checked.push(target.path);
    } catch (error) { errors.push(target.path + ": " + String(error.message).slice(0, 200)); }
  }
  for (const article of articles.slice(0, 5)) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article.slug)) continue;
    const path = "/materias/" + article.slug;
    try {
      const html = await request(HOST + path, fetchImpl);
      const canonical = HOST + path;
      if (!contains(html, canonical)) errors.push(path + ": URL canônica ausente");
      if (!contains(html, article.title.replaceAll("&","&amp;")) && !contains(html, article.title)) errors.push(path + ": título não encontrado");
      if (!/application\/ld\+json/.test(html)) errors.push(path + ": dados estruturados ausentes");
      checked.push(path);
    } catch (error) { errors.push(path + ": " + String(error.message).slice(0, 200)); }
  }
  return { ok: errors.length === 0, checked, errors };
}

async function loadArticles() {
  const folder = join(process.cwd(), "content/materias");
  try {
    const names = (await readdir(folder)).filter((name) => /^[a-z0-9]+(?:-[a-z0-9]+)*\.json$/.test(name));
    const records = await Promise.all(names.map(async (name) => JSON.parse(await readFile(join(folder, name), "utf8"))));
    return records.filter((r) => r.status === "published" && r.reviewed === true)
      .sort((a,b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
  } catch (error) { if (error.code === "ENOENT") return []; throw error; }
}

async function main() {
  const result = await auditPublicSite(fetch, await loadArticles());
  console.log("Auditoria pública VR Abandonada");
  console.log("Endereços conferidos:", result.checked.join(", ") || "nenhum");
  if (!result.ok) {
    console.error("Falhas:\n" + result.errors.map((e) => "- " + e).join("\n"));
    process.exitCode = 1;
  } else {
    console.log("OK: páginas públicas, robots, sitemap, RSS e artigos amostrados.");
    console.log("Isto NÃO comprova indexação ou ranqueamento no Google.");
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((e) => { console.error("Auditoria falhou:", e.message); process.exitCode = 1; });
}
