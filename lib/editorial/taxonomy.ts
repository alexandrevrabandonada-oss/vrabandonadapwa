import { editorialSeriesCatalog } from "@/lib/editorial/taxonomy-data";
import type { EditorialItem, EditorialSeries } from "@/lib/editorial/types";

export { editorialSeriesCatalog } from "@/lib/editorial/taxonomy-data";

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export function getEditorialSeriesBySlug(slug: string) {
  return editorialSeriesCatalog.find((series) => series.slug === slug) ?? null;
}

export function getEditorialSeriesByItem(item: EditorialItem) {
  if (!item.series_slug) {
    return null;
  }

  return getEditorialSeriesBySlug(item.series_slug) ?? {
    slug: item.series_slug,
    title: item.series_title ?? item.series_slug,
    description: "Série editorial do arquivo vivo.",
    axis: item.category,
    coverVariant: "concrete",
    coverImageUrl: null,
  } satisfies EditorialSeries;
}

export function groupEditorialItemsBySeries(items: EditorialItem[]) {
  return items.reduce<Record<string, EditorialItem[]>>((acc, item) => {
    const key = item.series_slug || "__sem-serie__";
    acc[key] = [...(acc[key] ?? []), item];
    return acc;
  }, {});
}

export function getEditorialSeriesCards(items: EditorialItem[]) {
  return editorialSeriesCatalog.map((series) => ({
    ...series,
    items: items.filter((item) => item.series_slug === series.slug),
  }));
}

export function suggestEditorialSeriesByCategory(category: string) {
  const normalized = normalize(category);

  if (normalized.includes("mem")) {
    return getEditorialSeriesBySlug("memoria-operaria");
  }

  if (normalized.includes("trab")) {
    return getEditorialSeriesBySlug("trabalho-e-acidentes");
  }

  if (normalized.includes("amb") || normalized.includes("pol")) {
    return getEditorialSeriesBySlug("poluicao-e-csn");
  }

  if (normalized.includes("cid") || normalized.includes("urb") || normalized.includes("tram") || normalized.includes("cidade")) {
    return getEditorialSeriesBySlug("cidade-e-abandono");
  }

  return getEditorialSeriesBySlug("cidade-e-abandono");
}
