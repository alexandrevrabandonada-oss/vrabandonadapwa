/**
 * Git-first: prepare gera somente rascunhos, release valida e escreve a matéria revisada.
 * Nada é publicado pelo script: publicação requer commit e merge após aprovação.
 */
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { validateMateria } from "./validate-materias.mjs";

const root = process.cwd();
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const sourcePattern = /^https:\/\/(www\.)?instagram\.com\/(p|reel|tv)\/[\w-]+(?:\/|\?|$)/;
const draftsDir = join(root, "editorial", "drafts");
const publishedDir = join(root, "content", "materias");

export function makeSlug(text, id) {
  const base = String(text).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 65).replace(/-$/g, "");
  if (!base) throw new Error("Legenda não produz slug válido");
  return base + "-" + id;
}
export function prepareInstagramDraft(post) {
  const id = String(post?.id ?? "");
  if (!/^\d{6,30}$/.test(id)) throw new Error("ID de publicação Instagram inválido");
  if (!sourcePattern.test(String(post.permalink || ""))) throw new Error("Permalink Instagram inválido");
  if (!Number.isFinite(Date.parse(String(post.published_at || "")))) throw new Error("Data do post inválida");
  const caption = String(post.caption || "").replace(/\u0000/g, "").trim();
  if (caption.length < 35) throw new Error("Legenda curta demais: revisar manualmente");
  const paragraphs = caption.split(/\n\s*\n/).map((text) => text.trim()).filter(Boolean);
  const headline = paragraphs.find((line) => line.length >= 15) || caption;
  const title = headline.split("\n")[0].replace(/^#[\p{L}\p{N}_]+\s*/u, "").slice(0, 120).trim();
  const slug = makeSlug(title, id);
  const image = typeof post.local_image === "string" &&
    /^\/instagram-media\/[a-zA-Z0-9_-]+\.jpg$/.test(post.local_image)
    ? { src: post.local_image, alt: "Capa da publicação original no Instagram" } : undefined;
  return {
    slug, status: "draft", reviewed: false, title,
    subtitle: "Revisar o subtítulo e acrescentar o contexto jornalístico.",
    summary: caption.replace(/\s+/g, " ").slice(0, 360),
    section: "Cidade", author: "VR Abandonada", instagramUrl: post.permalink,
    originalInstagram: {
      id, publishedAt: new Date(post.published_at).toISOString(),
      caption, // registro-fonte: NÃO reescrever nem alterar
    },
    sources: [{ label: "Publicação original no Instagram do VR Abandonada", url: post.permalink }],
    blocks: paragraphs.map((text) => ({ type: "paragraph", text })),
    ...(image ? { cover: image } : {}),
    review: {
      factChecked: false, sourcesChecked: false, rightOfReplyChecked: false,
      privacyChecked: false, approved: false, approvedBy: "", approvedAt: "",
    },
  };
}
export function reviewedPublication(draft) {
  if (!draft || draft.status !== "draft" || draft.reviewed !== false) throw new Error("A origem precisa ser um rascunho não publicado");
  if (!slugPattern.test(String(draft.slug || ""))) throw new Error("Slug inválido");
  const review = draft.review;
  if (!review || !["factChecked", "sourcesChecked", "rightOfReplyChecked", "privacyChecked", "approved"].every((key) => review[key] === true)) {
    throw new Error("Checklist editorial incompleto: fatos, fontes, contraditório, privacidade e aprovação");
  }
  if (typeof review.approvedBy !== "string" || review.approvedBy.trim().length < 3) throw new Error("Identifique o responsável pela aprovação");
  if (!Number.isFinite(Date.parse(String(review.approvedAt || "")))) throw new Error("Data de aprovação inválida");
  if (!Array.isArray(draft.sources) || draft.sources.length === 0 ||
      draft.sources.some((s) => typeof s?.label !== "string" || !/^https:\/\/[^\s/]+/.test(String(s?.url || "")))) {
    throw new Error("Inclua pelo menos uma referência pública HTTPS verificável");
  }
  if (!Array.isArray(draft.blocks) || !draft.blocks.length ||
      draft.blocks.every((block) => !String(block?.text || "").trim() && !block?.items?.length)) {
    throw new Error("Sem texto jornalístico para publicação");
  }
  const publication = {
    slug: draft.slug, title: draft.title, subtitle: draft.subtitle,
    summary: draft.summary, section: draft.section, author: draft.author,
    status: "published", reviewed: true,
    publishedAt: new Date(review.approvedAt).toISOString(),
    sources: draft.sources, blocks: draft.blocks,
    ...(draft.instagramUrl ? { instagramUrl: draft.instagramUrl } : {}),
    ...(draft.cover ? { cover: draft.cover } : {}),
    ...(draft.correctionNote ? { correctionNote: draft.correctionNote } : {}),
  };
  const errors = validateMateria(publication, publication.slug + ".json");
  if (errors.length) throw new Error("Matéria reprovada: " + errors.join("; "));
  return publication;
}
function arg(name) { const i = process.argv.indexOf(name); return i === -1 ? "" : process.argv[i + 1] || ""; }
async function writeNewJson(path, data) {
  await writeFile(path, JSON.stringify(data, null, 2) + "\n", { flag: "wx", mode: 0o644 });
}
async function prepare() {
  const source = arg("--file");
  const posts = source ? [JSON.parse(await readFile(resolve(source), "utf8"))]
    : JSON.parse(await readFile(join(root, "public", "data", "instagram-posts.json"), "utf8"));
  if (!Array.isArray(posts)) throw new Error("Índice Instagram deve ser uma lista");
  const report = { drafts: 0, existing: 0, rejected: 0 };
  await mkdir(draftsDir, { recursive: true });
  for (const post of posts) {
    try {
      const draft = prepareInstagramDraft(post);
      await writeNewJson(join(draftsDir, draft.slug + ".json"), draft);
      report.drafts++;
    } catch (err) {
      if (err?.code === "EEXIST") report.existing++;
      else {
        report.rejected++;
        console.warn("Publicação ignorada:", String(post?.id ?? ""), String(err.message).slice(0, 100));
      }
    }
  }
  console.log("Rascunhos gerados:", report);
  console.log("Nenhuma matéria publicada. Revise arquivos em editorial/drafts.");
}
async function release() {
  const slug = arg("--slug");
  if (!slugPattern.test(slug)) throw new Error("Informe --slug válido");
  const draft = JSON.parse(await readFile(join(draftsDir, slug + ".json"), "utf8"));
  if (draft.slug !== slug) throw new Error("Slug não corresponde ao nome do rascunho");
  const publication = reviewedPublication(draft);
  if (!process.argv.includes("--write")) {
    console.log("APTO PARA REVISÃO DE PR (dry-run). Sem escrita:", publication.slug);
    return;
  }
  await mkdir(publishedDir, { recursive: true });
  await writeNewJson(join(publishedDir, slug + ".json"), publication);
  console.log("Arquivo de publicação escrito:", join("content/materias", slug + ".json"));
  console.log("A publicação pública ocorrerá apenas quando um commit aprovado chegar à main.");
}
async function main() {
  const command = process.argv[2];
  if (command === "prepare") return prepare();
  if (command === "release") return release();
  throw new Error("Uso: prepare [--file arquivo.json] | release --slug slug [--write]");
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((err) => { console.error(String(err?.message || err)); process.exitCode = 1; });
}
