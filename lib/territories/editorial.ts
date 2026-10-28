import "server-only";

import { getMaterias, type Materia } from "@/lib/materias";

export type EditorialTerritoryRole = "main" | "mentioned";
export type EditorialTerritoryEntry = {
  slug: string;
  label: string;
  main: Materia[];
  mentioned: Materia[];
  lastUpdated: string;
};

/**
 * Territórios editoriais derivam SOMENTE de matérias publicadas e aprovadas.
 * Nunca extrair bairros do corpo por regex: uma menção a um local não prova
 * que o fato principal aconteceu nele.
 */
export function getTerritoryRole(article: Materia, slug: string): EditorialTerritoryRole | null {
  return article.territories?.find((location) => location.slug === slug)?.role ?? null;
}

export async function getPublishedEditorialTerritories(): Promise<EditorialTerritoryEntry[]> {
  const articles = await getMaterias();
  const index = new Map<string, EditorialTerritoryEntry>();
  for (const article of articles) {
    const seen = new Set<string>();
    for (const location of article.territories ?? []) {
      if (seen.has(location.slug)) continue;
      seen.add(location.slug);
      let entry = index.get(location.slug);
      if (!entry) {
        entry = { slug: location.slug, label: location.label, main: [], mentioned: [], lastUpdated: article.updatedAt || article.publishedAt };
        index.set(location.slug, entry);
      }
      if (location.role === "main") entry.main.push(article);
      else entry.mentioned.push(article);
      const timestamp = article.updatedAt || article.publishedAt;
      if (Date.parse(timestamp) > Date.parse(entry.lastUpdated)) entry.lastUpdated = timestamp;
    }
  }
  return [...index.values()].sort((a, b) =>
    (b.main.length - a.main.length) ||
    (Date.parse(b.lastUpdated) - Date.parse(a.lastUpdated)) ||
    a.label.localeCompare(b.label, "pt-BR"));
}

export async function getPublishedEditorialTerritoryBySlug(slug: string) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null;
  return (await getPublishedEditorialTerritories()).find((location) => location.slug === slug) ?? null;
}
