import "server-only";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const directory = join(process.cwd(), "content", "materias");

export type Materia = {
  slug: string;
  title: string;
  subtitle: string;
  summary: string;
  section: string;
  publishedAt: string;
  updatedAt?: string;
  author: string;
  status: "published";
  reviewed: true;
  sources: Array<{ label: string; url: string; consultedAt?: string }>;
  blocks: Array<{ type: "paragraph" | "heading" | "quote" | "list"; text: string; items?: string[] }>;
  cover?: { src: string; alt: string; credit?: string };
  instagramUrl?: string;
  correctionNote?: string;
  investigationStatus?: "ongoing" | "closed";
  updates?: Array<{ date: string; label: string; text: string }>;
};

function isPublicMateria(data: unknown, slug: string): data is Materia {
  if (!data || typeof data !== "object") return false;
  const p = data as Partial<Materia>;
  return p.slug === slug && p.status === "published" && p.reviewed === true
    && typeof p.title === "string" && p.title.length > 12
    && typeof p.subtitle === "string" && typeof p.summary === "string"
    && typeof p.publishedAt === "string" && !Number.isNaN(Date.parse(p.publishedAt))
    && typeof p.author === "string" && p.author.length > 2
    && typeof p.section === "string"
    && Array.isArray(p.sources) && Array.isArray(p.blocks) && p.blocks.length > 0
    && p.blocks.every((b) => ["paragraph", "heading", "quote", "list"].includes(b.type) && typeof b.text === "string");
}

export async function getMateria(slug: string): Promise<Materia | null> {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null;
  try {
    const raw = await readFile(join(directory, slug + ".json"), "utf8");
    const parsed: unknown = JSON.parse(raw);
    return isPublicMateria(parsed, slug) ? parsed : null;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw err;
  }
}

export async function getMaterias(): Promise<Materia[]> {
  let filenames: string[];
  try {
    filenames = (await readdir(directory)).filter((name) => /^[a-z0-9]+(?:-[a-z0-9]+)*\.json$/.test(name));
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }
  const results = await Promise.all(filenames.map((name) => getMateria(name.slice(0, -5))));
  return results.filter((r): r is Materia => Boolean(r))
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
}

export function publishedDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit", month: "long", year: "numeric", timeZone: "America/Sao_Paulo"
  }).format(new Date(value));
}

export function abstractOf(materia: Materia) {
  return materia.summary.slice(0, 280);
}
