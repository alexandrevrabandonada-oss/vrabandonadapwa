import type { EditorialEntryTarget } from "@/lib/entrada/types";

export const enrichmentDestinations = ["memoria", "acervo", "editorial", "dossie", "campaign", "impacto", "edition"] as const;
export type EnrichmentDestination = (typeof enrichmentDestinations)[number];

export type EntryEnrichmentSeed = {
  title: string;
  slug: string;
  excerpt: string;
  description: string;
  leadQuestion: string;
  territoryLabel: string;
  placeLabel: string;
  actorLabel: string;
  axisLabel: string;
  sourceLabel: string;
  yearLabel: string;
  approximateYear: number | null;
  body: string;
};

export const enrichmentDestinationLabels: Record<EnrichmentDestination, string> = {
  memoria: "Memória",
  acervo: "Acervo",
  editorial: "Peça editorial",
  dossie: "Dossiê",
  campaign: "Campanha",
  impacto: "Impacto",
  edition: "Edição",
};

export const enrichmentDestinationTargets: Record<EnrichmentDestination, EditorialEntryTarget | null> = {
  memoria: "memoria",
  acervo: "acervo",
  editorial: "edition",
  dossie: "dossie",
  campaign: "campaign",
  impacto: "impacto",
  edition: "edition",
};
