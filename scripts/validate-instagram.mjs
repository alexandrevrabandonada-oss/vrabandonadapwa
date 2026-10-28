/**
 * Verifica o arquivo de posts públicos do Instagram antes de criar PR/publicar.
 * Não consulta a API e nunca transforma legenda em reportagem verificada.
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const validId = /^\d{6,30}$/;
const validPermalink = /^https:\/\/(www\.)?instagram\.com\/(p|reel|tv)\/[\w-]+(?:\/|\?|$)/;
const validCover = /^\/instagram-media\/\d{6,30}\.jpg$/;

export function validateInstagramPosts(posts) {
  const problems = [];
  if (!Array.isArray(posts)) return ["Índice Instagram precisa ser uma lista"];
  if (posts.length > 5000) problems.push("Limite de 5000 publicações excedido");
  const ids = new Set();
  for (const [index, p] of posts.entries()) {
    const ref = "publicação " + (index + 1);
    if (!p || typeof p !== "object" || Array.isArray(p)) {
      problems.push(ref + ": objeto inválido");
      continue;
    }
    if (typeof p.id !== "string" || !validId.test(p.id)) problems.push(ref + ": id inválido");
    else if (ids.has(p.id)) problems.push(ref + ": ID duplicado");
    else ids.add(p.id);
    if (typeof p.permalink !== "string" || !validPermalink.test(p.permalink)) problems.push(ref + ": permalink inválido");
    if (typeof p.caption !== "string" || p.caption.trim().length === 0 || p.caption.length > 12000) problems.push(ref + ": legenda inválida");
    if (typeof p.published_at !== "string" || !Number.isFinite(Date.parse(p.published_at))) problems.push(ref + ": data inválida");
    if (!["IMAGE", "VIDEO", "CAROUSEL_ALBUM"].includes(p.media_type)) problems.push(ref + ": tipo de mídia inválido");
    if (p.local_image !== undefined && (!validCover.test(p.local_image) || p.local_image !== "/instagram-media/" + p.id + ".jpg")) {
      problems.push(ref + ": caminho de imagem inválido");
    }
  }
  return problems;
}

async function main() {
  const source = join(process.cwd(), "public/data/instagram-posts.json");
  const posts = JSON.parse(await readFile(source, "utf8"));
  const errors = validateInstagramPosts(posts);
  if (errors.length) {
    console.error("Arquivo de publicações REPROVADO:", errors.slice(0, 30).join("; "));
    process.exitCode = 1;
  } else {
    console.log("Índice validado:", posts.length, "publicações; nenhuma aprovação editorial inferida");
  }
}
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((err) => { console.error("Falha no índice Instagram:", err.message); process.exitCode = 1; });
}
