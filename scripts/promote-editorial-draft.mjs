/**
 * Converte um rascunho editorial em JSON canônico, só mediante aprovação.
 * A etapa sem --approve é uma simulação e não grava arquivo.
 * A gravação de um JSON ainda requer PR e merge para publicar no portal.
 */
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { validateMateria } from "./validate-materias.mjs";

const root = process.cwd();
const draftsDir = join(root, "editorial", "drafts");
const publishedDir = join(root, "content", "materias");

export function assemblePublication(raw, publishedAt) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("Rascunho inválido");
  if (raw.status !== "draft" || raw.reviewed !== false || raw.publishedAt !== null) {
    throw new Error("O arquivo de origem precisa permanecer como rascunho não aprovado");
  }
  if (typeof publishedAt !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(publishedAt) ||
    Number.isNaN(Date.parse(publishedAt))) {
    throw new Error("Informe --published-at em ISO 8601 com fuso explícito");
  }
  const { editorialNotes, ...fields } = raw;
  const publication = { ...fields, status: "published", reviewed: true, publishedAt };
  if ("editorialNotes" in publication) throw new Error("Notas internas não podem ir ao site");
  const errors = validateMateria(publication, publication.slug + ".json");
  if (errors.length > 0) throw new Error("Validação editorial: " + errors.join("; "));
  return publication;
}

export function parsePromotionArgs(args) {
  const options = { approve: false };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--approve") { if (options.approve) throw new Error("--approve repetido"); options.approve = true; continue; }
    if (a !== "--draft" && a !== "--published-at") throw new Error("Argumento desconhecido: " + a);
    if (!args[i + 1] || args[i + 1].startsWith("--")) throw new Error(a + " exige valor");
    const key = a.slice(2);
    if (options[key]) throw new Error(a + " repetido");
    options[key] = args[++i];
  }
  if (!options.draft || !options["published-at"]) throw new Error("Informe --draft e --published-at");
  return options;
}

export async function promoteDraft(args) {
  const opts = parsePromotionArgs(args);
  const draftFile = resolve(root, opts.draft);
  const rel = relative(draftsDir, draftFile);
  if (!rel || rel === ".." || rel.startsWith(".." + sep) || rel.startsWith(sep) ||
    !draftFile.endsWith(".json") || basename(draftFile) === ".json") {
    throw new Error("A origem deve ser um JSON em editorial/drafts");
  }
  const draft = JSON.parse(await readFile(draftFile, "utf8"));
  const publication = assemblePublication(draft, opts["published-at"]);
  const output = join(publishedDir, publication.slug + ".json");
  try {
    await access(output);
    throw new Error("Publicação já existe; não sobrescrever: " + relative(root, output));
  } catch (error) { if (error.code !== "ENOENT") throw error; }
  if (!opts.approve) {
    console.log("PRÉ-VALIDAÇÃO OK: " + publication.slug + ". Nada foi gravado; --approve e horário real obrigatórios.");
    return { approved: false, output };
  }
  await mkdir(publishedDir, { recursive: true });
  await writeFile(output, JSON.stringify(publication, null, 2) + "\n", { flag: "wx" });
  console.log("CANDIDATO A PUBLICAÇÃO GRAVADO: " + relative(root, output) + ". Revise a PR e só depois autorize merge.");
  return { approved: true, output };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  promoteDraft(process.argv.slice(2)).catch((error) => { console.error(error.message); process.exitCode = 1; });
}
