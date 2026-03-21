import { cache } from "react";

import { getPublishedArchiveAssets } from "@/lib/archive/queries";
import { getPublishedArchiveCollections } from "@/lib/archive/collections";
import { getArchiveAssetTypeLabel } from "@/lib/archive/navigation";
import { getPublishedActorHubs } from "@/lib/actors/queries";
import { getActorHubActorTypeLabel, getActorHubStatusLabel } from "@/lib/actors/navigation";
import { getPublishedCampaigns } from "@/lib/campaigns/queries";
import { getCampaignStatusLabel, getCampaignTypeLabel } from "@/lib/campaigns/navigation";
import { getPublishedEditorialItems } from "@/lib/editorial/queries";
import { getEditorialSeriesCards } from "@/lib/editorial/taxonomy";
import { getPublishedEditorialEditions } from "@/lib/editions/queries";
import { getEditionStatusLabel, getEditionTypeLabel } from "@/lib/editions/navigation";
import { getPublishedEntryRoutes } from "@/lib/entry-routes/queries";
import { getPublishedImpacts } from "@/lib/impact/queries";
import { getImpactStatusLabel, getImpactTypeLabel } from "@/lib/impact/navigation";
import { getPublishedMemoryItems } from "@/lib/memory/queries";
import { getPublishedParticipationPaths } from "@/lib/participation/queries";
import { getPublishedPatternReads } from "@/lib/patterns/queries";
import { getPatternReadStatusLabel, getPatternReadTypeLabel } from "@/lib/patterns/navigation";
import { getPublishedPlaceHubs } from "@/lib/territories/queries";
import { getPlaceHubPlaceTypeLabel, getPlaceHubStatusLabel } from "@/lib/territories/navigation";
import { getPublishedThemeHubs } from "@/lib/hubs/queries";
import { getThemeHubStatusLabel } from "@/lib/hubs/navigation";
import { site } from "@/lib/site";
import { getSearchContentTypeLabel, getSearchFollowKind, getSearchSaveKind, searchContentTypeOrder } from "@/lib/search/navigation";
import type { SearchContentType, SearchFacet, SearchFilters, SearchIndexEntry, SearchResults } from "@/lib/search/types";
import { getPublishedDossiers } from "@/lib/dossiers/queries";

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function compactText(...values: Array<string | null | undefined>) {
  return values
    .flatMap((value) => (value ? [value] : []))
    .map((value) => value.trim())
    .filter(Boolean)
    .join(" ");
}

function uniqueLabels(values: Array<string | null | undefined>) {
  const seen = new Set<string>();
  const output: string[] = [];

  for (const value of values) {
    const label = value?.trim();
    if (!label) {
      continue;
    }

    const key = normalize(label);
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    output.push(label);
  }

  return output;
}

function getMostRecentValue(...values: Array<string | null | undefined>) {
  for (const value of values) {
    if (value) {
      return value;
    }
  }

  return null;
}

function makeEntry(
  input: Omit<SearchIndexEntry, "id" | "searchableText" | "saveKind" | "followKind"> & {
    searchTextParts: Array<string | null | undefined>;
  },
): SearchIndexEntry {
  return {
    id: `${input.contentType}:${input.contentKey}`,
    searchableText: normalize(compactText(input.title, input.excerpt, input.kindLabel, input.labels.join(" "), input.territoryLabel, input.actorLabel, ...input.searchTextParts)),
    saveKind: getSearchSaveKind(input.contentType),
    followKind: getSearchFollowKind(input.contentType),
    ...input,
  };
}
function scoreEntry(entry: SearchIndexEntry, query: string) {
  const normalizedQuery = normalize(query);

  if (!normalizedQuery) {
    const date = entry.updatedAt ? new Date(entry.updatedAt).getTime() : 0;
    const recency = Math.max(0, 24 - Math.min(24, (Date.now() - date) / 86_400_000));
    return recency + (entry.featured ? 22 : 0);
  }

  const tokens = normalizedQuery.split(" ").filter(Boolean);
  const title = normalize(entry.title);
  const excerpt = normalize(entry.excerpt);
  const labels = normalize(entry.labels.join(" "));
  const searchable = entry.searchableText;
  let score = 0;

  if (title === normalizedQuery) score += 360;
  if (entry.contentKey === normalizedQuery) score += 260;
  if (title.startsWith(normalizedQuery)) score += 150;
  if (entry.contentKey.startsWith(normalizedQuery)) score += 110;
  if (title.includes(normalizedQuery)) score += 110;
  if (labels.includes(normalizedQuery)) score += 95;
  if (excerpt.includes(normalizedQuery)) score += 70;
  if (searchable.includes(normalizedQuery)) score += 55;

  for (const token of tokens) {
    if (title.includes(token)) score += 26;
    if (labels.includes(token)) score += 18;
    if (excerpt.includes(token)) score += 10;
    if (searchable.includes(token)) score += 8;
  }

  if (entry.featured) score += 14;

  const date = entry.updatedAt ? new Date(entry.updatedAt).getTime() : 0;
  const recency = Math.max(0, 14 - Math.min(14, (Date.now() - date) / 86_400_000));
  score += recency;

  return score;
}

function matchesType(entry: SearchIndexEntry, type: string) {
  if (!type || type === "all") {
    return true;
  }

  return entry.contentType === type;
}

function matchesLabel(entry: SearchIndexEntry, filterValue: string, target: "territory" | "actor") {
  if (!filterValue || filterValue === "all") {
    return true;
  }

  const normalizedFilter = normalize(filterValue);
  const directValue = target === "territory" ? entry.territoryLabel : entry.actorLabel;

  if (directValue && normalize(directValue) === normalizedFilter) {
    return true;
  }

  return entry.labels.some((label) => normalize(label) === normalizedFilter);
}

function countFacetValues(entries: SearchIndexEntry[], selector: (entry: SearchIndexEntry) => string | null) {
  const counts = new Map<string, SearchFacet>();

  for (const entry of entries) {
    const value = selector(entry)?.trim();
    if (!value) {
      continue;
    }

    const key = normalize(value);
    const current = counts.get(key);
    counts.set(key, {
      value,
      label: current?.label ?? value,
      count: (current?.count ?? 0) + 1,
    });
  }

  return [...counts.values()].sort((a, b) => {
    if (b.count !== a.count) {
      return b.count - a.count;
    }

    return a.label.localeCompare(b.label, "pt-BR");
  });
}

function countTypeValues(entries: SearchIndexEntry[]) {
  const counts = new Map<SearchContentType, SearchFacet>();

  for (const type of searchContentTypeOrder) {
    counts.set(type, {
      value: type,
      label: getSearchContentTypeLabel(type),
      count: 0,
    });
  }

  for (const entry of entries) {
    const current = counts.get(entry.contentType);
    if (!current) {
      continue;
    }

    counts.set(entry.contentType, {
      ...current,
      count: current.count + 1,
    });
  }

  return [...counts.values()]
    .filter((facet) => facet.count > 0)
    .sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }

      return a.label.localeCompare(b.label, "pt-BR");
    });
}

function buildPublicEntries(
  editorialItems: Awaited<ReturnType<typeof getPublishedEditorialItems>>,
  memoryItems: Awaited<ReturnType<typeof getPublishedMemoryItems>>,
  archiveAssets: Awaited<ReturnType<typeof getPublishedArchiveAssets>>,
  archiveCollections: Awaited<ReturnType<typeof getPublishedArchiveCollections>>,
  dossiers: Awaited<ReturnType<typeof getPublishedDossiers>>,
  campaigns: Awaited<ReturnType<typeof getPublishedCampaigns>>,
  impacts: Awaited<ReturnType<typeof getPublishedImpacts>>,
  hubs: Awaited<ReturnType<typeof getPublishedThemeHubs>>,
  territories: Awaited<ReturnType<typeof getPublishedPlaceHubs>>,
  actors: Awaited<ReturnType<typeof getPublishedActorHubs>>,
  patterns: Awaited<ReturnType<typeof getPublishedPatternReads>>,
  editions: Awaited<ReturnType<typeof getPublishedEditorialEditions>>,
  entryRoutes: Awaited<ReturnType<typeof getPublishedEntryRoutes>>,
  participationPaths: Awaited<ReturnType<typeof getPublishedParticipationPaths>>,
) {
  const entries: SearchIndexEntry[] = [];
  for (const item of editorialItems) {
    entries.push(
      makeEntry({
        contentType: "pauta",
        contentKey: item.slug,
        title: item.title,
        excerpt: item.excerpt || item.body || "Pauta editorial do arquivo vivo.",
        href: `/pautas/${item.slug}`,
        kindLabel: "Pauta",
        labels: uniqueLabels([item.category, item.primary_tag, item.series_title, item.neighborhood, ...(item.secondary_tags ?? [])]),
        territoryLabel: item.neighborhood ?? null,
        actorLabel: null,
        updatedAt: getMostRecentValue(item.published_at, item.updated_at),
        featured: Boolean(item.featured || item.featured_order !== null),
        searchTextParts: [item.body, item.series_slug, item.series_title],
      }),
    );
  }

  for (const item of memoryItems) {
    entries.push(
      makeEntry({
        contentType: "memoria",
        contentKey: item.slug,
        title: item.title,
        excerpt: item.excerpt || item.body || "Memória pública do arquivo vivo.",
        href: `/memoria/${item.slug}`,
        kindLabel: "Memória",
        labels: uniqueLabels([item.collection_title, item.memory_collection, item.period_label, item.place_label, item.memory_type]),
        territoryLabel: item.place_label ?? null,
        actorLabel: null,
        updatedAt: getMostRecentValue(item.published_at, item.updated_at, item.created_at),
        featured: Boolean(item.featured || item.highlight_in_memory),
        searchTextParts: [item.body, item.source_note, item.collection_slug, item.related_editorial_slug, item.related_series_slug],
      }),
    );
  }

  for (const asset of archiveAssets) {
    entries.push(
      makeEntry({
        contentType: "acervo",
        contentKey: asset.id,
        title: asset.title,
        excerpt: asset.description || asset.source_label || asset.rights_note || "Documento do acervo público.",
        href: `/acervo/${asset.id}`,
        kindLabel: getArchiveAssetTypeLabel(asset.asset_type),
        labels: uniqueLabels([asset.asset_type, asset.source_label, asset.source_date_label, asset.place_label, asset.collection_slug]),
        territoryLabel: asset.place_label ?? null,
        actorLabel: null,
        updatedAt: getMostRecentValue(asset.updated_at, asset.created_at),
        featured: Boolean(asset.featured),
        searchTextParts: [asset.rights_note, asset.file_url, asset.thumb_url],
      }),
    );
  }

  for (const collection of archiveCollections) {
    entries.push(
      makeEntry({
        contentType: "colecao",
        contentKey: collection.slug,
        title: collection.title,
        excerpt: collection.excerpt || collection.description || "Coleção pública de acervo.",
        href: `/acervo/colecoes/${collection.slug}`,
        kindLabel: "Coleção",
        labels: uniqueLabels([collection.title, collection.slug]),
        territoryLabel: null,
        actorLabel: null,
        updatedAt: getMostRecentValue(collection.updated_at, collection.created_at),
        featured: Boolean(collection.featured),
        searchTextParts: [collection.description],
      }),
    );
  }

  for (const dossier of dossiers) {
    entries.push(
      makeEntry({
        contentType: "dossie",
        contentKey: dossier.slug,
        title: dossier.title,
        excerpt: dossier.lead_question || dossier.excerpt || dossier.description || "Dossiê público do arquivo vivo.",
        href: `/dossies/${dossier.slug}`,
        kindLabel: "Dossiê",
        labels: uniqueLabels([dossier.status, dossier.period_label, dossier.territory_label]),
        territoryLabel: dossier.territory_label ?? null,
        actorLabel: null,
        updatedAt: getMostRecentValue(dossier.updated_at, dossier.created_at),
        featured: Boolean(dossier.featured),
        searchTextParts: [dossier.lead_question, dossier.period_label],
      }),
    );
  }

  for (const campaign of campaigns) {
    entries.push(
      makeEntry({
        contentType: "campanha",
        contentKey: campaign.slug,
        title: campaign.title,
        excerpt: campaign.lead_question || campaign.excerpt || campaign.description || "Campanha pública do arquivo vivo.",
        href: `/campanhas/${campaign.slug}`,
        kindLabel: "Campanha",
        labels: uniqueLabels([campaign.campaign_type, campaign.status, getCampaignStatusLabel(campaign.status), getCampaignTypeLabel(campaign.campaign_type)]),
        territoryLabel: null,
        actorLabel: null,
        updatedAt: getMostRecentValue(campaign.updated_at, campaign.start_date, campaign.created_at),
        featured: Boolean(campaign.featured || campaign.status === "active"),
        searchTextParts: [campaign.lead_question, campaign.end_date],
      }),
    );
  }

  for (const impact of impacts) {
    entries.push(
      makeEntry({
        contentType: "impacto",
        contentKey: impact.slug,
        title: impact.title,
        excerpt: impact.lead_question || impact.excerpt || impact.description || "Consequência pública observada.",
        href: `/impacto/${impact.slug}`,
        kindLabel: "Impacto",
        labels: uniqueLabels([impact.impact_type, impact.status, getImpactStatusLabel(impact.status), getImpactTypeLabel(impact.impact_type), impact.territory_label, impact.date_label]),
        territoryLabel: impact.territory_label ?? null,
        actorLabel: null,
        updatedAt: getMostRecentValue(impact.happened_at, impact.updated_at, impact.created_at),
        featured: Boolean(impact.featured || impact.status === "ongoing"),
        searchTextParts: [impact.lead_question, impact.date_label],
      }),
    );
  }

  for (const hub of hubs) {
    entries.push(
      makeEntry({
        contentType: "eixo",
        contentKey: hub.slug,
        title: hub.title,
        excerpt: hub.lead_question || hub.excerpt || hub.description || "Eixo temático do arquivo vivo.",
        href: `/eixos/${hub.slug}`,
        kindLabel: "Eixo",
        labels: uniqueLabels([getThemeHubStatusLabel(hub.status)]),
        territoryLabel: null,
        actorLabel: null,
        updatedAt: getMostRecentValue(hub.updated_at, hub.created_at),
        featured: Boolean(hub.featured || hub.status === "active"),
        searchTextParts: [hub.lead_question, hub.description],
      }),
    );
  }

  for (const place of territories) {
    entries.push(
      makeEntry({
        contentType: "territorio",
        contentKey: place.slug,
        title: place.title,
        excerpt: place.lead_question || place.excerpt || place.description || "Lugar vivo da cidade.",
        href: `/territorios/${place.slug}`,
        kindLabel: "Território",
        labels: uniqueLabels([place.place_type, place.status, getPlaceHubStatusLabel(place.status), getPlaceHubPlaceTypeLabel(place.place_type), place.territory_label, place.parent_place_slug]),
        territoryLabel: place.territory_label || place.title,
        actorLabel: null,
        updatedAt: getMostRecentValue(place.updated_at, place.created_at),
        featured: Boolean(place.featured || place.status === "active"),
        searchTextParts: [place.address_label, place.lead_question, String(place.latitude ?? ""), String(place.longitude ?? "")],
      }),
    );
  }

  for (const actor of actors) {
    entries.push(
      makeEntry({
        contentType: "ator",
        contentKey: actor.slug,
        title: actor.title,
        excerpt: actor.lead_question || actor.excerpt || actor.description || "Ator recorrente do conflito público.",
        href: `/atores/${actor.slug}`,
        kindLabel: "Ator",
        labels: uniqueLabels([actor.actor_type, actor.status, getActorHubStatusLabel(actor.status), getActorHubActorTypeLabel(actor.actor_type), actor.territory_label]),
        territoryLabel: actor.territory_label ?? null,
        actorLabel: actor.title,
        updatedAt: getMostRecentValue(actor.updated_at, actor.created_at),
        featured: Boolean(actor.featured || actor.status === "active"),
        searchTextParts: [actor.lead_question, actor.description],
      }),
    );
  }

  for (const pattern of patterns) {
    entries.push(
      makeEntry({
        contentType: "padrao",
        contentKey: pattern.slug,
        title: pattern.title,
        excerpt: pattern.lead_question || pattern.excerpt || pattern.description || "Leitura estrutural recorrente.",
        href: `/padroes/${pattern.slug}`,
        kindLabel: "Padrão",
        labels: uniqueLabels([pattern.pattern_type, pattern.status, getPatternReadStatusLabel(pattern.status), getPatternReadTypeLabel(pattern.pattern_type)]),
        territoryLabel: null,
        actorLabel: null,
        updatedAt: getMostRecentValue(pattern.updated_at, pattern.created_at),
        featured: Boolean(pattern.featured || pattern.status === "active"),
        searchTextParts: [pattern.lead_question, pattern.description],
      }),
    );
  }
  for (const edition of editions) {
    entries.push(
      makeEntry({
        contentType: "edicao",
        contentKey: edition.slug,
        title: edition.title,
        excerpt: edition.excerpt || edition.description || edition.period_label || "Síntese editorial recorrente.",
        href: `/edicoes/${edition.slug}`,
        kindLabel: "Edição",
        labels: uniqueLabels([getEditionStatusLabel(edition.status), getEditionTypeLabel(edition.edition_type), edition.period_label]),
        territoryLabel: null,
        actorLabel: null,
        updatedAt: getMostRecentValue(edition.published_at, edition.updated_at, edition.created_at),
        featured: Boolean(edition.featured || edition.status === "published"),
        searchTextParts: [edition.description, edition.period_label],
      }),
    );
  }

  for (const series of getEditorialSeriesCards(editorialItems)) {
    entries.push(
      makeEntry({
        contentType: "serie",
        contentKey: series.slug,
        title: series.title,
        excerpt: series.description || "Série editorial do arquivo vivo.",
        href: `/series/${series.slug}`,
        kindLabel: "Série",
        labels: uniqueLabels([series.axis, `${series.items.length} pautas`]),
        territoryLabel: null,
        actorLabel: null,
        updatedAt: getMostRecentValue(series.items[0]?.published_at, series.items[0]?.updated_at),
        featured: Boolean(series.items.some((item) => item.featured)),
        searchTextParts: [series.axis, series.coverVariant, series.coverImageUrl],
      }),
    );
  }

  for (const route of entryRoutes) {
    entries.push(
      makeEntry({
        contentType: "rota",
        contentKey: route.slug,
        title: route.title,
        excerpt: route.excerpt || route.description || route.audience_label || "Rota de entrada do arquivo vivo.",
        href: `/comecar/${route.slug}`,
        kindLabel: "Rota",
        labels: uniqueLabels([route.audience_label, route.status]),
        territoryLabel: null,
        actorLabel: null,
        updatedAt: getMostRecentValue(route.updated_at, route.created_at),
        featured: Boolean(route.featured),
        searchTextParts: [route.description],
      }),
    );
  }

  for (const path of participationPaths) {
    entries.push(
      makeEntry({
        contentType: "participacao",
        contentKey: path.slug,
        title: path.title,
        excerpt: path.excerpt || path.description || path.audience_label || "Caminho de participação do arquivo vivo.",
        href: `/participe/${path.slug}`,
        kindLabel: "Participação",
        labels: uniqueLabels([path.audience_label, path.status]),
        territoryLabel: null,
        actorLabel: null,
        updatedAt: getMostRecentValue(path.updated_at, path.created_at),
        featured: Boolean(path.featured),
        searchTextParts: [path.description],
      }),
    );
  }

  return entries;
}

export const getPublicSearchIndex = cache(async () => {
  const [
    editorialItems,
    memoryItems,
    archiveAssets,
    archiveCollections,
    dossiers,
    campaigns,
    impacts,
    hubs,
    territories,
    actors,
    patterns,
    editions,
    entryRoutes,
    participationPaths,
  ] = await Promise.all([
    getPublishedEditorialItems(),
    getPublishedMemoryItems(),
    getPublishedArchiveAssets(),
    getPublishedArchiveCollections(),
    getPublishedDossiers(),
    getPublishedCampaigns(),
    getPublishedImpacts(),
    getPublishedThemeHubs(),
    getPublishedPlaceHubs(),
    getPublishedActorHubs(),
    getPublishedPatternReads(),
    getPublishedEditorialEditions(),
    getPublishedEntryRoutes(),
    getPublishedParticipationPaths(),
  ]);

  const entries = buildPublicEntries(
    editorialItems,
    memoryItems,
    archiveAssets,
    archiveCollections,
    dossiers,
    campaigns,
    impacts,
    hubs,
    territories,
    actors,
    patterns,
    editions,
    entryRoutes,
    participationPaths,
  );

  return entries.sort((a, b) => {
    if ((a.featured ? 1 : 0) !== (b.featured ? 1 : 0)) {
      return Number(b.featured) - Number(a.featured);
    }

    const aDate = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const bDate = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    if (aDate !== bDate) {
      return bDate - aDate;
    }

    return a.title.localeCompare(b.title, "pt-BR");
  });
});

export async function searchPublicContent(filters: SearchFilters): Promise<SearchResults> {
  const index = await getPublicSearchIndex();
  const query = filters.query.trim();
  const isRecentSort = filters.sort === "recent" || !query;

  const results = index.filter((entry) => {
    if (!matchesType(entry, filters.contentType)) {
      return false;
    }

    if (!matchesLabel(entry, filters.territory, "territory")) {
      return false;
    }

    if (!matchesLabel(entry, filters.actor, "actor")) {
      return false;
    }

    if (!query) {
      return true;
    }

    return scoreEntry(entry, query) > 0;
  });

  results.sort((a, b) => {
    if (isRecentSort) {
      const aDate = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const bDate = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;

      if (aDate !== bDate) {
        return bDate - aDate;
      }

      if ((a.featured ? 1 : 0) !== (b.featured ? 1 : 0)) {
        return Number(b.featured) - Number(a.featured);
      }

      return a.title.localeCompare(b.title, "pt-BR");
    }

    const aScore = scoreEntry(a, query);
    const bScore = scoreEntry(b, query);

    if (aScore !== bScore) {
      return bScore - aScore;
    }

    const aDate = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const bDate = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    if (aDate !== bDate) {
      return bDate - aDate;
    }

    return a.title.localeCompare(b.title, "pt-BR");
  });

  return {
    query,
    filters,
    results,
    total: results.length,
    facets: {
      types: countTypeValues(index),
      territories: countFacetValues(index, (entry) => entry.territoryLabel),
      actors: countFacetValues(index, (entry) => entry.actorLabel),
    },
  };
}

export function getSearchHotTerms() {
  const terms = [
    site.editorialAxes[0]?.title,
    site.editorialAxes[1]?.title,
    site.editorialAxes[2]?.title,
    site.featuredPautas[0]?.tag,
    site.featuredPautas[1]?.tag,
    site.featuredPautas[2]?.tag,
    "CSN",
    "poluição",
    "acidentes",
    "memória",
    "abandono",
    "saúde",
    "transporte",
  ];

  return terms.filter((term): term is string => Boolean(term));
}
