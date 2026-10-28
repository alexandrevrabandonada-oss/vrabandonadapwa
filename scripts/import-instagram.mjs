/**
 * Importador Instagram profissional -> arquivo permanente e indexável.
 * Secret INSTAGRAM_ACCESS_TOKEN; vars INSTAGRAM_USER_ID, INSTAGRAM_GRAPH_HOST.
 * Nunca grava o token e nunca publica conteúdo não retornado pela API oficial.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { existsSync } from "node:fs";

const root = process.cwd();
const target = path.join(root, "public/data/instagram-posts.json");
const mediaDirectory = path.join(root, "public/instagram-media");
const token = process.env.INSTAGRAM_ACCESS_TOKEN;
const account = process.env.INSTAGRAM_USER_ID || "me";
const host = process.env.INSTAGRAM_GRAPH_HOST || "graph.instagram.com";
const apiVersion = process.env.INSTAGRAM_GRAPH_VERSION || "v26.0";
const fields = "id,caption,media_type,media_product_type,media_url,thumbnail_url,permalink,timestamp";

export function postFromApi(item) {
  if (!item || !/^\d{6,30}$/.test(String(item.id || ""))) return null;
  const permalink = String(item.permalink || "");
  if (!/^https:\/\/(www\.)?instagram\.com\/(p|reel|tv)\//.test(permalink)) return null;
  const caption = String(item.caption ?? "").replace(/\u0000/g, "").trim().slice(0, 12000);
  if (!caption) return null;
  const published_at = String(item.timestamp || "").replace(/([+-]\d{2})(\d{2})$/, "$1:$2");
  if (Number.isNaN(Date.parse(published_at))) return null;
  return {
    id: String(item.id),
    caption,
    permalink,
    published_at: new Date(published_at).toISOString(),
    media_type: ["VIDEO", "IMAGE", "CAROUSEL_ALBUM"].includes(item.media_type) ? item.media_type : "IMAGE",
    ...(item.media_product_type ? { media_product_type: String(item.media_product_type) } : {}),
  };
}

function safeMediaUrl(value) {
  try {
    const u = new URL(value);
    if (u.protocol !== "https:") return null;
    if (!/(^|\.)((fbcdn\.net)|(cdninstagram\.com)|(instagram\.com))$/.test(u.hostname)) return null;
    return u.href;
  } catch { return null; }
}

async function downloadCover(item, id) {
  const source = safeMediaUrl(item.thumbnail_url || item.media_url);
  if (!source) return null;
  const filename = id + ".jpg";
  const destination = path.join(mediaDirectory, filename);
  if (existsSync(destination)) return "/instagram-media/" + filename;
  const response = await fetch(source, { signal: AbortSignal.timeout(20000) });
  if (!response.ok) return null;
  const mime = response.headers.get("content-type") || "";
  // Evitar salvar HTML, SVG, PNG ou WebP sob extensão .jpg e nunca seguir redirecionamento a domínio não autorizado.
  if (!safeMediaUrl(response.url) || !/^image\/jpeg\b/i.test(mime)) return null;
  if (Number(response.headers.get("content-length") || 0) > 8_000_000) return null;
  const binary = Buffer.from(await response.arrayBuffer());
  if (binary.byteLength > 8_000_000 || binary.byteLength < 64 ||
      binary[0] !== 0xff || binary[1] !== 0xd8 || binary[2] !== 0xff) return null;
  await fs.mkdir(mediaDirectory, { recursive: true });
  await fs.writeFile(destination, binary);
  return "/instagram-media/" + filename;
}

async function getPage(after, extended = true) {
  if (!["graph.instagram.com", "graph.facebook.com"].includes(host)) throw new Error("Graph API host inválido");
  const url = new URL("https://" + host + "/" + apiVersion + "/" + encodeURIComponent(account) + "/media");
  url.searchParams.set("fields", extended ? fields : "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp");
  url.searchParams.set("limit", "50");
  if (after) url.searchParams.set("after", after);
  const response = await fetch(url, { headers: { Authorization: "Bearer " + token }, signal: AbortSignal.timeout(20000) });
  const data = await response.json();
  if (!response.ok) {
    if (extended && response.status === 400 && !after) return getPage(after, false);
    throw new Error("Falha na API do Instagram (" + response.status + "): " + JSON.stringify(data.error?.code || "sem detalhes"));
  }
  return data;
}

async function run() {
  if (!token) { console.log("Token Meta não configurado: acervo mantido."); return; }
  let oldPosts = [];
  try { oldPosts = JSON.parse(await fs.readFile(target, "utf-8")); } catch {}
  const previous = new Map(oldPosts.map((p) => [p.id, p]));
  let after, received = 0;
  for (let page = 0; page < 4; page++) {
    const data = await getPage(after);
    if (!Array.isArray(data.data)) throw new Error("Resposta inesperada da API");
    for (const item of data.data) {
      const normalized = postFromApi(item);
      if (!normalized) continue;
      const before = previous.get(normalized.id);
      let local_image = before?.local_image || null;
      if (!local_image) {
        try { local_image = await downloadCover(item, normalized.id); }
        catch (error) { console.warn("Capa indisponível", normalized.id, String(error).slice(0, 120)); }
      }
      previous.set(normalized.id, { ...normalized, ...(local_image ? { local_image } : {}) });
      received++;
    }
    after = data.paging?.cursors?.after;
    if (!after || data.data.length < 50) break;
  }
  const all = [...previous.values()]
    .filter((post) => post?.id && post?.caption && post?.permalink && post?.published_at)
    .sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, JSON.stringify(all, null, 2) + "\n", "utf-8");
  console.log("Sincronizado:", received, "Total no acervo:", all.length);
}

if (process.argv[1] && import.meta.url === new URL("file://" + path.resolve(process.argv[1])).href) {
  run().catch((error) => { console.error(error); process.exitCode = 1; });
}
