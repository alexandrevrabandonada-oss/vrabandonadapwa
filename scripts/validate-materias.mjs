import { readdir, readFile } from "node:fs/promises";
import { join, basename } from "node:path";

const folder = join(process.cwd(), "content", "materias");
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function validateMateria(article, filename = "arquivo.json") {
  const problems = [];
  if (!article || typeof article !== "object" || Array.isArray(article)) return ["Documento JSON inválido"];
  const slug = basename(filename, ".json");
  if (!slugPattern.test(slug) || article.slug !== slug) problems.push("slug deve corresponder ao nome do arquivo e usar minúsculas e hífens");
  if (article.status !== "published" || article.reviewed !== true) problems.push("precisa de aprovação editorial explícita (status=published, reviewed=true)");
  for (const field of ["title", "subtitle", "summary", "section", "author"]) {
    if (typeof article[field] !== "string" || article[field].trim().length < 3) problems.push("campo obrigatório inválido: " + field);
  }
  if (typeof article.title !== "string" || article.title.length < 15 || article.title.length > 170) problems.push("título deve ter 15 a 170 caracteres");
  if (typeof article.summary !== "string" || article.summary.length < 35 || article.summary.length > 600) problems.push("resumo deve ter 35 a 600 caracteres");
  if (!article.publishedAt || Number.isNaN(Date.parse(article.publishedAt))) problems.push("publishedAt inválido");
  if (article.updatedAt && Number.isNaN(Date.parse(article.updatedAt))) problems.push("updatedAt inválido");
  if (article.kind !== undefined && !["news", "investigation", "explainer"].includes(article.kind)) problems.push("formato editorial inválido: kind");
  if (article.investigationStatus !== undefined && !["ongoing", "closed"].includes(article.investigationStatus)) problems.push("investigationStatus inválido");
  if (article.updates !== undefined) {
    if (!Array.isArray(article.updates)) problems.push("updates deve ser lista");
    else if (article.updates.some((entry) => !entry || Number.isNaN(Date.parse(entry.date)) ||
      typeof entry.label !== "string" || entry.label.trim().length < 3 ||
      typeof entry.text !== "string" || entry.text.trim().length < 15)) problems.push("histórico de atualizações inválido");
  }
  if (!Array.isArray(article.blocks) || article.blocks.length === 0) problems.push("texto deve conter ao menos um bloco");
  else for (let i = 0; i < article.blocks.length; i++) {
    const b = article.blocks[i];
    if (!b || !["paragraph", "heading", "quote", "list"].includes(b.type)) problems.push("tipo do bloco " + i + " inválido");
    if (!b || typeof b.text !== "string") problems.push("texto do bloco " + i + " inválido");
    if (b?.type === "list" && !Array.isArray(b.items)) problems.push("lista " + i + " sem items");
  }
  if (!Array.isArray(article.sources)) problems.push("sources deve ser lista");
  else for (const [i, s] of article.sources.entries()) {
    if (!s || typeof s.label !== "string" || s.label.trim().length < 3) problems.push("fonte " + i + " sem nome");
    if (s?.url && !/^https?:\/\/[^\s/]+/.test(s.url)) problems.push("URL inválida na fonte " + i);
  }
  if (article.cover && (!/^\/[a-zA-Z0-9/_\-.]+$/.test(article.cover.src || "") || !(article.cover.alt || "").trim())) problems.push("capa precisa ser arquivo local com alt");
  if (article.instagramUrl && !/^https:\/\/(www\.)?instagram\.com\/(p|reel|tv)\//.test(article.instagramUrl)) problems.push("instagramUrl deve ser permalink Instagram");
  return problems;
}

async function main() {
  let files;
  try { files = (await readdir(folder)).filter((name) => name.endsWith(".json")); }
  catch (err) {
    if (err.code === "ENOENT") { console.log("Sem matérias: publicação inicial vazia é permitida."); return; }
    throw err;
  }
  const errors = [];
  for (const filename of files) {
    try {
      const data = JSON.parse(await readFile(join(folder, filename), "utf8"));
      errors.push(...validateMateria(data, filename).map((e) => filename + ": " + e));
    } catch (e) { errors.push(filename + ": erro ao analisar JSON (" + e.message + ")"); }
  }
  if (errors.length) {
    console.error("VALIDAÇÃO EDITORIAL FALHOU:\n" + errors.join("\n"));
    process.exitCode = 1;
  } else console.log("Matérias verificadas:", files.length);
}

if (process.argv[1] && import.meta.url === new URL("file://" + process.argv[1].replaceAll("\\", "/")).href) {
  main().catch((e) => { console.error(e); process.exitCode = 1; });
}
