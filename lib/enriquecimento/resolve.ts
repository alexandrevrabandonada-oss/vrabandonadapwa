import { slugifyEditorialValue } from "@/lib/editorial/utils";
import type { EditorialEntry } from "@/lib/entrada/types";

import type { EntryEnrichmentSeed, EnrichmentDestination } from "@/lib/enriquecimento/types";

function pickText(...values: Array<string | null | undefined>) {
  return values.map((value) => value?.trim()).find((value): value is string => Boolean(value)) ?? "";
}

function pickApproximateYear(entry: EditorialEntry) {
  if (entry.approximate_year) {
    return entry.approximate_year;
  }

  const parsed = entry.year_label?.match(/\d{4}/);
  if (!parsed) {
    return null;
  }

  const value = Number.parseInt(parsed[0], 10);
  return Number.isNaN(value) ? null : value;
}

export function buildEntrySeed(entry: EditorialEntry): EntryEnrichmentSeed {
  const title = pickText(entry.title, entry.summary, entry.details);
  const excerpt = pickText(entry.summary, entry.details, entry.title);
  const description = pickText(entry.details, entry.summary, entry.title);
  const sourceLabel = pickText(entry.source_label, entry.actor_label, entry.territory_label, "Entrada simplificada");
  const yearLabel = pickText(entry.year_label, entry.approximate_year ? String(entry.approximate_year) : "");
  const approximateYear = pickApproximateYear(entry);
  const territoryLabel = pickText(entry.territory_label, entry.place_label);
  const placeLabel = pickText(entry.place_label, entry.territory_label);
  const actorLabel = pickText(entry.actor_label, entry.source_label);
  const axisLabel = pickText(entry.axis_label, entry.entry_type);
  const slug = `${slugifyEditorialValue(title || entry.id) || "entrada"}-${entry.id.slice(0, 6)}`;

  return {
    title: title || "Entrada guardada",
    slug,
    excerpt: excerpt || "Resumo curto da entrada guardada.",
    description: description || excerpt || "Descrição breve para enriquecer depois.",
    leadQuestion: `O que esta entrada revela sobre ${territoryLabel || axisLabel || "a cidade"}?`,
    territoryLabel,
    placeLabel,
    actorLabel,
    axisLabel,
    sourceLabel,
    yearLabel,
    approximateYear,
    body: `${description || excerpt || title || "Entrada guardada"}\n\nMaterial preparado a partir da Central de Entrada Simplificada.`,
  };
}

export function buildEnrichmentDestinationHref(destination: EnrichmentDestination, entryId: string) {
  const query = `entry_id=${encodeURIComponent(entryId)}`;

  switch (destination) {
    case "memoria":
      return `/interno/memoria/novo?${query}`;
    case "acervo":
      return `/interno/acervo/novo?${query}`;
    case "editorial":
      return `/interno/editorial`;
    case "dossie":
      return `/interno/dossies/novo?${query}`;
    case "campaign":
      return `/interno/campanhas/novo?${query}`;
    case "impacto":
      return `/interno/impacto/novo?${query}`;
    case "edition":
      return `/interno/edicoes/novo?${query}`;
  }
}
