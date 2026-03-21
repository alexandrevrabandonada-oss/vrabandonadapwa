import { cache } from "react";

import { getPublishedArchiveAssets } from "@/lib/archive/queries";
import { getPublishedArchiveCollections } from "@/lib/archive/collections";
import { getPublishedActorHubs } from "@/lib/actors/queries";
import { getActorHubActorTypeLabel, getActorHubStatusLabel } from "@/lib/actors/navigation";
import { getPublishedCampaigns } from "@/lib/campaigns/queries";
import { getCampaignStatusLabel, getCampaignTypeLabel } from "@/lib/campaigns/navigation";
import { getPublishedEditorialItems } from "@/lib/editorial/queries";
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
import { getPublishedDossiers, getPublishedDossierUpdatesByDossierIds } from "@/lib/dossiers/queries";
import { getDossierStatusLabel } from "@/lib/dossiers/navigation";
import { getDossierUpdatePreviewText, getDossierUpdateNarrativeLabel, sortDossierUpdates } from "@/lib/dossiers/updates";
import { getEditorialSeriesCards } from "@/lib/editorial/taxonomy";
import { getSearchFollowKind, searchContentTypeOrder } from "@/lib/search/navigation";
import type { SearchContentType } from "@/lib/search/types";
import { site } from "@/lib/site";
import { getTimelineContentTypeLabel, getTimelineEntryHref, getTimelinePeriodKey, getTimelinePeriodLabel, getTimelineSaveKind } from "@/lib/timeline/navigation";
import type { TimelineDateBasis, TimelineEntry, TimelineFacet, TimelineFilters, TimelinePageData } from "@/lib/timeline/types";
import type { InvestigationDossier, InvestigationDossierUpdate } from "@/lib/dossiers/types";
import type { MemoryItem } from "@/lib/memory/types";
import type { ArchiveAsset, ArchiveCollection } from "@/lib/archive/types";
import type { PublicCampaign } from "@/lib/campaigns/types";
import type { PublicImpact } from "@/lib/impact/types";
import type { ThemeHub } from "@/lib/hubs/types";
import type { PlaceHub } from "@/lib/territories/types";
import type { ActorHub } from "@/lib/actors/types";
import type { PatternRead } from "@/lib/patterns/types";
import type { EditorialEdition } from "@/lib/editions/types";
import type { EntryRoute } from "@/lib/entry-routes/types";
import type { ParticipationPath } from "@/lib/participation/types";
import type { EditorialItem } from "@/lib/editorial/types";
function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function uniqueLabels(values: Array<string | null | undefined>) {
  const seen = new Set<string>();
  const output: string[] = [];

  for (const value of values) {
    const label = value?.trim();
    if (!label) continue;
    const key = normalize(label);
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(label);
  }

  return output;
}

function extractYear(value: string | null | undefined) {
  if (!value) return null;
  const match = value.match(/(19|20)\d{2}/);
  return match ? Number.parseInt(match[0], 10) : null;
}

function formatDateLabel(value: string | null | undefined) {
  if (!value) return null;

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatYearLabel(year: number | null, fallbackLabel: string | null = null) {
  if (fallbackLabel) return fallbackLabel;
  if (year === null || Number.isNaN(year)) return null;
  return String(year);
}

function getSourceDateBasis(year: number | null, explicit: TimelineDateBasis) {
  if (year === null || Number.isNaN(year)) return explicit;
  if (explicit !== "unknown") return explicit;
  return "editorial";
}

function makeEntry(args: {
  contentType: SearchContentType;
  contentKey: string;
  title: string;
  excerpt: string | null;
  contentHref: string;
  kindLabel: string;
  labels: Array<string | null | undefined>;
  territoryLabel: string | null;
  actorLabel: string | null;
  yearValue: number | null;
  yearLabel: string | null;
  dateLabel: string | null;
  dateBasis: TimelineDateBasis;
  featured: boolean;
  sortDate: string;
  sortOrder: number;
  sourceNote: string | null;
}) {
  const yearValue = args.yearValue;
  const periodKey = getTimelinePeriodKey(yearValue);

  return {
    id: `${args.contentType}:${args.contentKey}`,
    contentType: args.contentType,
    contentKey: args.contentKey,
    title: args.title,
    excerpt: args.excerpt,
    contentHref: args.contentHref,
    timelineHref: getTimelineEntryHref(args.contentType, args.contentKey),
    kindLabel: args.kindLabel,
    labels: uniqueLabels([args.kindLabel, ...args.labels]),
    territoryLabel: args.territoryLabel,
    actorLabel: args.actorLabel,
    yearValue,
    yearLabel: formatYearLabel(yearValue, args.yearLabel),
    dateLabel: args.dateLabel,
    dateBasis: getSourceDateBasis(yearValue, args.dateBasis),
    periodKey,
    periodLabel: getTimelinePeriodLabel(periodKey),
    featured: args.featured,
    sortDate: args.sortDate,
    sortOrder: args.sortOrder,
    saveKind: getTimelineSaveKind(args.contentType),
    followKind: getSearchFollowKind(args.contentType),
    sourceNote: args.sourceNote,
  };
}

function sortEntries(entries: TimelineEntry[], sort: TimelineFilters["sort"] = "chronological") {
  return [...entries].sort((a, b) => {
    if (sort === "recent") {
      if ((a.featured ? 1 : 0) !== (b.featured ? 1 : 0)) {
        return Number(b.featured) - Number(a.featured);
      }

      const aDate = new Date(a.sortDate).getTime();
      const bDate = new Date(b.sortDate).getTime();
      if (aDate !== bDate) {
        return bDate - aDate;
      }

      if (a.sortOrder !== b.sortOrder) {
        return a.sortOrder - b.sortOrder;
      }

      return a.title.localeCompare(b.title, "pt-BR");
    }

    const aYear = a.yearValue ?? Number.POSITIVE_INFINITY;
    const bYear = b.yearValue ?? Number.POSITIVE_INFINITY;
    if (aYear !== bYear) {
      return aYear - bYear;
    }

    if ((a.featured ? 1 : 0) !== (b.featured ? 1 : 0)) {
      return Number(b.featured) - Number(a.featured);
    }

    if (a.sortOrder !== b.sortOrder) {
      return a.sortOrder - b.sortOrder;
    }

    return a.title.localeCompare(b.title, "pt-BR");
  });
}

function scoreEntry(entry: TimelineEntry, query: string) {
  const normalizedQuery = normalize(query);

  if (!normalizedQuery) {
    const date = entry.sortDate ? new Date(entry.sortDate).getTime() : 0;
    return Math.max(0, 24 - Math.min(24, (Date.now() - date) / 86_400_000)) + (entry.featured ? 18 : 0);
  }

  const tokens = normalizedQuery.split(" ").filter(Boolean);
  const title = normalize(entry.title);
  const excerpt = normalize(entry.excerpt || "");
  const labels = normalize(entry.labels.join(" "));
  const period = normalize(entry.periodLabel);
  const territory = normalize(entry.territoryLabel || "");
  const actor = normalize(entry.actorLabel || "");
  let score = 0;

  if (title === normalizedQuery) score += 360;
  if (entry.contentKey === normalizedQuery) score += 260;
  if (title.startsWith(normalizedQuery)) score += 150;
  if (entry.contentKey.startsWith(normalizedQuery)) score += 110;
  if (title.includes(normalizedQuery)) score += 110;
  if (labels.includes(normalizedQuery)) score += 95;
  if (excerpt.includes(normalizedQuery)) score += 70;
  if (period.includes(normalizedQuery)) score += 55;
  if (territory.includes(normalizedQuery)) score += 55;
  if (actor.includes(normalizedQuery)) score += 55;

  for (const token of tokens) {
    if (title.includes(token)) score += 26;
    if (labels.includes(token)) score += 18;
    if (excerpt.includes(token)) score += 10;
    if (territory.includes(token)) score += 10;
    if (actor.includes(token)) score += 10;
  }

  if (entry.featured) score += 14;

  const date = entry.sortDate ? new Date(entry.sortDate).getTime() : 0;
  score += Math.max(0, 14 - Math.min(14, (Date.now() - date) / 86_400_000));

  return score;
}

function matchesLabel(entry: TimelineEntry, filterValue: string, target: "territory" | "actor") {
  if (!filterValue || filterValue === "all") return true;
  const normalizedFilter = normalize(filterValue);
  const directValue = target === "territory" ? entry.territoryLabel : entry.actorLabel;
  if (directValue && normalize(directValue) === normalizedFilter) return true;
  return entry.labels.some((label) => normalize(label) === normalizedFilter);
}

function matchesType(entry: TimelineEntry, type: string) {
  if (!type || type === "all") return true;
  return entry.contentType === type;
}

function matchesPeriod(entry: TimelineEntry, period: string) {
  if (!period || period === "all") return true;
  return entry.periodKey === period;
}

function countFacetValues(entries: TimelineEntry[], selector: (entry: TimelineEntry) => string | null): TimelineFacet[] {
  const counts = new Map<string, TimelineFacet>();

  for (const entry of entries) {
    const value = selector(entry)?.trim();
    if (!value) continue;
    const key = normalize(value);
    const current = counts.get(key);
    counts.set(key, {
      value,
      label: current?.label ?? value,
      count: (current?.count ?? 0) + 1,
    });
  }

  return [...counts.values()].sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return a.label.localeCompare(b.label, "pt-BR");
  });
}

function countTypeValues(entries: TimelineEntry[]) {
  const counts = new Map<SearchContentType, TimelineFacet>();
  for (const type of searchContentTypeOrder) {
    counts.set(type, { value: type, label: getTimelineContentTypeLabel(type), count: 0 });
  }

  for (const entry of entries) {
    const current = counts.get(entry.contentType);
    if (!current) continue;
    counts.set(entry.contentType, { ...current, count: current.count + 1 });
  }

  return [...counts.values()].filter((facet) => facet.count > 0);
}

function countPeriodValues(entries: TimelineEntry[]) {
  const order: TimelineFacet[] = [
    { value: "origens", label: getTimelinePeriodLabel("origens"), count: 0 },
    { value: "formacao", label: getTimelinePeriodLabel("formacao"), count: 0 },
    { value: "reconfiguracao", label: getTimelinePeriodLabel("reconfiguracao"), count: 0 },
    { value: "presente", label: getTimelinePeriodLabel("presente"), count: 0 },
    { value: "agora", label: getTimelinePeriodLabel("agora"), count: 0 },
    { value: "sem_data", label: getTimelinePeriodLabel("sem_data"), count: 0 },
  ];

  const counts = new Map(order.map((facet) => [facet.value, { ...facet }] as const));

  for (const entry of entries) {
    const current = counts.get(entry.periodKey);
    if (!current) continue;
    counts.set(entry.periodKey, { ...current, count: current.count + 1 });
  }

  return [...counts.values()].filter((facet) => facet.count > 0);
}
function buildEditorialItems(editorialItems: EditorialItem[]) {
  return editorialItems.map((item) =>
    makeEntry({
      contentType: "pauta",
      contentKey: item.slug,
      title: item.title,
      excerpt: item.excerpt || item.body || "Pauta editorial do arquivo vivo.",
      contentHref: `/pautas/${item.slug}`,
      kindLabel: "Pauta",
      labels: [item.category, item.primary_tag, item.series_title, item.neighborhood, ...(item.secondary_tags ?? [])],
      territoryLabel: item.neighborhood ?? null,
      actorLabel: null,
      yearValue: extractYear(item.published_at || item.updated_at),
      yearLabel: formatDateLabel(item.published_at || item.updated_at),
      dateLabel: formatDateLabel(item.published_at || item.updated_at),
      dateBasis: "editorial",
      featured: Boolean(item.featured || item.featured_order !== null),
      sortDate: item.published_at || item.updated_at || item.created_at,
      sortOrder: item.featured_order ?? 9999,
      sourceNote: item.primary_tag || item.category,
    }),
  );
}

function buildMemoryItems(memoryItems: MemoryItem[]) {
  return memoryItems.map((item) => {
    const yearValue = item.year_start ?? extractYear(item.published_at || item.updated_at || item.created_at);
    const yearLabel = item.year_start && item.year_end ? `${item.year_start}–${item.year_end}` : item.period_label || (item.year_start ? String(item.year_start) : formatDateLabel(item.published_at || item.updated_at));

    return makeEntry({
      contentType: "memoria",
      contentKey: item.slug,
      title: item.title,
      excerpt: item.excerpt || item.body || "Memória pública do arquivo vivo.",
      contentHref: `/memoria/${item.slug}`,
      kindLabel: "Memória",
      labels: [item.collection_title, item.memory_collection, item.period_label, item.place_label, item.memory_type],
      territoryLabel: item.place_label ?? null,
      actorLabel: null,
      yearValue,
      yearLabel,
      dateLabel: yearLabel,
      dateBasis: item.year_start ? "historical" : "editorial",
      featured: Boolean(item.featured || item.highlight_in_memory),
      sortDate: item.published_at || item.updated_at || item.created_at,
      sortOrder: item.timeline_rank ?? 9999,
      sourceNote: item.source_note,
    });
  });
}

function buildArchiveItems(assets: ArchiveAsset[]) {
  return assets.map((asset) => {
    const yearValue = asset.approximate_year ?? extractYear(asset.source_date_label) ?? extractYear(asset.updated_at || asset.created_at);
    const dateLabel = asset.source_date_label || (asset.approximate_year ? `c. ${asset.approximate_year}` : formatDateLabel(asset.updated_at || asset.created_at));

    return makeEntry({
      contentType: "acervo",
      contentKey: asset.id,
      title: asset.title,
      excerpt: asset.description || asset.source_label || asset.rights_note || "Documento do acervo público.",
      contentHref: `/acervo/${asset.id}`,
      kindLabel: asset.asset_type ? `Acervo · ${asset.asset_type}` : "Acervo",
      labels: [asset.asset_type, asset.source_label, asset.source_date_label, asset.place_label, asset.collection_slug],
      territoryLabel: asset.place_label ?? null,
      actorLabel: null,
      yearValue,
      yearLabel: dateLabel,
      dateLabel,
      dateBasis: asset.approximate_year ? "approximate" : "editorial",
      featured: Boolean(asset.featured),
      sortDate: asset.updated_at || asset.created_at,
      sortOrder: asset.sort_order,
      sourceNote: asset.rights_note,
    });
  });
}

function buildCollectionItems(collections: ArchiveCollection[]) {
  return collections.map((collection) =>
    makeEntry({
      contentType: "colecao",
      contentKey: collection.slug,
      title: collection.title,
      excerpt: collection.excerpt || collection.description || "Coleção pública de acervo.",
      contentHref: `/acervo/colecoes/${collection.slug}`,
      kindLabel: "Coleção",
      labels: [collection.title, collection.slug],
      territoryLabel: null,
      actorLabel: null,
      yearValue: extractYear(collection.created_at || collection.updated_at),
      yearLabel: formatDateLabel(collection.updated_at || collection.created_at),
      dateLabel: formatDateLabel(collection.updated_at || collection.created_at),
      dateBasis: "editorial",
      featured: Boolean(collection.featured),
      sortDate: collection.updated_at || collection.created_at,
      sortOrder: collection.sort_order,
      sourceNote: collection.description,
    }),
  );
}

function buildDossierItems(dossiers: InvestigationDossier[], updatesByDossierId: Map<string, InvestigationDossierUpdate[]>) {
  return dossiers.map((dossier) => {
    const latestUpdate = sortDossierUpdates(updatesByDossierId.get(dossier.id) ?? [])[0] ?? null;
    const dateSource = latestUpdate?.published_at || dossier.updated_at || dossier.created_at;
    const yearValue = extractYear(dateSource);

    return makeEntry({
      contentType: "dossie",
      contentKey: dossier.slug,
      title: dossier.title,
      excerpt: latestUpdate ? getDossierUpdatePreviewText(latestUpdate) : dossier.lead_question || dossier.excerpt || dossier.description || "Dossiê público do arquivo vivo.",
      contentHref: `/dossies/${dossier.slug}`,
      kindLabel: "Dossiê",
      labels: [getDossierStatusLabel(dossier.status), dossier.period_label, dossier.territory_label, latestUpdate ? getDossierUpdateNarrativeLabel(latestUpdate.update_type) : null],
      territoryLabel: dossier.territory_label ?? null,
      actorLabel: null,
      yearValue,
      yearLabel: formatDateLabel(dateSource) || dossier.period_label,
      dateLabel: formatDateLabel(dateSource) || dossier.period_label,
      dateBasis: latestUpdate ? "editorial" : "operational",
      featured: Boolean(dossier.featured || latestUpdate?.featured || dossier.status === "in_progress"),
      sortDate: dateSource,
      sortOrder: dossier.sort_order,
      sourceNote: latestUpdate?.excerpt || dossier.lead_question,
    });
  });
}

function buildCampaignItems(campaigns: PublicCampaign[]) {
  return campaigns.map((campaign) =>
    makeEntry({
      contentType: "campanha",
      contentKey: campaign.slug,
      title: campaign.title,
      excerpt: campaign.lead_question || campaign.excerpt || campaign.description || "Campanha pública do arquivo vivo.",
      contentHref: `/campanhas/${campaign.slug}`,
      kindLabel: "Campanha",
      labels: [campaign.campaign_type, campaign.status, getCampaignStatusLabel(campaign.status), getCampaignTypeLabel(campaign.campaign_type)],
      territoryLabel: null,
      actorLabel: null,
      yearValue: extractYear(campaign.start_date || campaign.updated_at || campaign.created_at),
      yearLabel: formatDateLabel(campaign.start_date || campaign.updated_at || campaign.created_at),
      dateLabel: formatDateLabel(campaign.start_date || campaign.updated_at || campaign.created_at),
      dateBasis: campaign.start_date ? "operational" : "editorial",
      featured: Boolean(campaign.featured || campaign.status === "active"),
      sortDate: campaign.start_date || campaign.updated_at || campaign.created_at,
      sortOrder: campaign.sort_order,
      sourceNote: campaign.lead_question,
    }),
  );
}

function buildImpactItems(impacts: PublicImpact[]) {
  return impacts.map((impact) =>
    makeEntry({
      contentType: "impacto",
      contentKey: impact.slug,
      title: impact.title,
      excerpt: impact.lead_question || impact.excerpt || impact.description || "Consequência pública observada.",
      contentHref: `/impacto/${impact.slug}`,
      kindLabel: "Impacto",
      labels: [impact.impact_type, impact.status, getImpactStatusLabel(impact.status), getImpactTypeLabel(impact.impact_type), impact.territory_label, impact.date_label],
      territoryLabel: impact.territory_label ?? null,
      actorLabel: null,
      yearValue: extractYear(impact.happened_at || impact.updated_at || impact.created_at),
      yearLabel: impact.date_label || formatDateLabel(impact.happened_at || impact.updated_at || impact.created_at),
      dateLabel: impact.date_label || formatDateLabel(impact.happened_at || impact.updated_at || impact.created_at),
      dateBasis: impact.happened_at ? "operational" : "editorial",
      featured: Boolean(impact.featured || impact.status === "ongoing"),
      sortDate: impact.happened_at || impact.updated_at || impact.created_at,
      sortOrder: impact.sort_order,
      sourceNote: impact.lead_question,
    }),
  );
}

function buildThemeHubItems(hubs: ThemeHub[]) {
  return hubs.map((hub) =>
    makeEntry({
      contentType: "eixo",
      contentKey: hub.slug,
      title: hub.title,
      excerpt: hub.lead_question || hub.excerpt || hub.description || "Eixo temático do arquivo vivo.",
      contentHref: `/eixos/${hub.slug}`,
      kindLabel: "Eixo",
      labels: [getThemeHubStatusLabel(hub.status)],
      territoryLabel: null,
      actorLabel: null,
      yearValue: extractYear(hub.updated_at || hub.created_at),
      yearLabel: formatDateLabel(hub.updated_at || hub.created_at),
      dateLabel: formatDateLabel(hub.updated_at || hub.created_at),
      dateBasis: "editorial",
      featured: Boolean(hub.featured || hub.status === "active"),
      sortDate: hub.updated_at || hub.created_at,
      sortOrder: hub.sort_order,
      sourceNote: hub.lead_question,
    }),
  );
}
function buildTerritoryItems(territories: PlaceHub[]) {
  return territories.map((place) =>
    makeEntry({
      contentType: "territorio",
      contentKey: place.slug,
      title: place.title,
      excerpt: place.lead_question || place.excerpt || place.description || "Lugar vivo da cidade.",
      contentHref: `/territorios/${place.slug}`,
      kindLabel: "Território",
      labels: [place.place_type, place.status, getPlaceHubStatusLabel(place.status), getPlaceHubPlaceTypeLabel(place.place_type), place.territory_label, place.parent_place_slug],
      territoryLabel: place.territory_label || place.title,
      actorLabel: null,
      yearValue: extractYear(place.updated_at || place.created_at),
      yearLabel: formatDateLabel(place.updated_at || place.created_at),
      dateLabel: formatDateLabel(place.updated_at || place.created_at),
      dateBasis: "editorial",
      featured: Boolean(place.featured || place.status === "active"),
      sortDate: place.updated_at || place.created_at,
      sortOrder: place.sort_order,
      sourceNote: place.lead_question,
    }),
  );
}

function buildActorItems(actors: ActorHub[]) {
  return actors.map((actor) =>
    makeEntry({
      contentType: "ator",
      contentKey: actor.slug,
      title: actor.title,
      excerpt: actor.lead_question || actor.excerpt || actor.description || "Ator recorrente do conflito público.",
      contentHref: `/atores/${actor.slug}`,
      kindLabel: "Ator",
      labels: [actor.actor_type, actor.status, getActorHubStatusLabel(actor.status), getActorHubActorTypeLabel(actor.actor_type), actor.territory_label],
      territoryLabel: actor.territory_label ?? null,
      actorLabel: actor.title,
      yearValue: extractYear(actor.updated_at || actor.created_at),
      yearLabel: formatDateLabel(actor.updated_at || actor.created_at),
      dateLabel: formatDateLabel(actor.updated_at || actor.created_at),
      dateBasis: "editorial",
      featured: Boolean(actor.featured || actor.status === "active"),
      sortDate: actor.updated_at || actor.created_at,
      sortOrder: actor.sort_order,
      sourceNote: actor.lead_question,
    }),
  );
}

function buildPatternItems(patterns: PatternRead[]) {
  return patterns.map((pattern) =>
    makeEntry({
      contentType: "padrao",
      contentKey: pattern.slug,
      title: pattern.title,
      excerpt: pattern.lead_question || pattern.excerpt || pattern.description || "Leitura estrutural recorrente.",
      contentHref: `/padroes/${pattern.slug}`,
      kindLabel: "Padrão",
      labels: [pattern.pattern_type, pattern.status, getPatternReadStatusLabel(pattern.status), getPatternReadTypeLabel(pattern.pattern_type)],
      territoryLabel: null,
      actorLabel: null,
      yearValue: extractYear(pattern.updated_at || pattern.created_at),
      yearLabel: formatDateLabel(pattern.updated_at || pattern.created_at),
      dateLabel: formatDateLabel(pattern.updated_at || pattern.created_at),
      dateBasis: "editorial",
      featured: Boolean(pattern.featured || pattern.status === "active"),
      sortDate: pattern.updated_at || pattern.created_at,
      sortOrder: pattern.sort_order,
      sourceNote: pattern.lead_question,
    }),
  );
}

function buildEditionItems(editions: EditorialEdition[]) {
  return editions.map((edition) =>
    makeEntry({
      contentType: "edicao",
      contentKey: edition.slug,
      title: edition.title,
      excerpt: edition.excerpt || edition.description || edition.period_label || "Síntese editorial recorrente.",
      contentHref: `/edicoes/${edition.slug}`,
      kindLabel: "Edição",
      labels: [getEditionStatusLabel(edition.status), getEditionTypeLabel(edition.edition_type), edition.period_label],
      territoryLabel: null,
      actorLabel: null,
      yearValue: extractYear(edition.published_at || edition.updated_at || edition.created_at),
      yearLabel: formatDateLabel(edition.published_at || edition.updated_at || edition.created_at),
      dateLabel: formatDateLabel(edition.published_at || edition.updated_at || edition.created_at),
      dateBasis: edition.published_at ? "editorial" : "operational",
      featured: Boolean(edition.featured || edition.status === "published"),
      sortDate: edition.published_at || edition.updated_at || edition.created_at,
      sortOrder: edition.sort_order,
      sourceNote: edition.period_label,
    }),
  );
}

function buildSeriesItems(editorialItems: EditorialItem[]) {
  return getEditorialSeriesCards(editorialItems).map((series, index) =>
    makeEntry({
      contentType: "serie",
      contentKey: series.slug,
      title: series.title,
      excerpt: series.description || "Série editorial do arquivo vivo.",
      contentHref: `/series/${series.slug}`,
      kindLabel: "Série",
      labels: [series.axis, `${series.items.length} pautas`],
      territoryLabel: null,
      actorLabel: null,
      yearValue: extractYear(series.items[0]?.published_at || series.items[0]?.updated_at || null),
      yearLabel: formatDateLabel(series.items[0]?.published_at || series.items[0]?.updated_at || null),
      dateLabel: formatDateLabel(series.items[0]?.published_at || series.items[0]?.updated_at || null),
      dateBasis: "editorial",
      featured: Boolean(series.items.some((item) => item.featured)),
      sortDate: series.items[0]?.published_at || series.items[0]?.updated_at || new Date().toISOString(),
      sortOrder: index + 1,
      sourceNote: series.axis,
    }),
  );
}

function buildRouteItems(routes: EntryRoute[]) {
  return routes.map((route) =>
    makeEntry({
      contentType: "rota",
      contentKey: route.slug,
      title: route.title,
      excerpt: route.excerpt || route.description || route.audience_label || "Rota de entrada do arquivo vivo.",
      contentHref: `/comecar/${route.slug}`,
      kindLabel: "Rota",
      labels: [route.audience_label, route.status],
      territoryLabel: null,
      actorLabel: null,
      yearValue: extractYear(route.updated_at || route.created_at),
      yearLabel: formatDateLabel(route.updated_at || route.created_at),
      dateLabel: formatDateLabel(route.updated_at || route.created_at),
      dateBasis: "editorial",
      featured: Boolean(route.featured),
      sortDate: route.updated_at || route.created_at,
      sortOrder: route.sort_order,
      sourceNote: route.description,
    }),
  );
}

function buildParticipationItems(paths: ParticipationPath[]) {
  return paths.map((path) =>
    makeEntry({
      contentType: "participacao",
      contentKey: path.slug,
      title: path.title,
      excerpt: path.excerpt || path.description || path.audience_label || "Caminho de participação do arquivo vivo.",
      contentHref: `/participe/${path.slug}`,
      kindLabel: "Participação",
      labels: [path.audience_label, path.status],
      territoryLabel: null,
      actorLabel: null,
      yearValue: extractYear(path.updated_at || path.created_at),
      yearLabel: formatDateLabel(path.updated_at || path.created_at),
      dateLabel: formatDateLabel(path.updated_at || path.created_at),
      dateBasis: "editorial",
      featured: Boolean(path.featured),
      sortDate: path.updated_at || path.created_at,
      sortOrder: path.sort_order,
      sourceNote: path.description,
    }),
  );
}

async function buildTimelineEntries() {
  const [editorialItems, memoryItems, archiveAssets, archiveCollections, dossiers, campaigns, impacts, hubs, territories, actors, patterns, editions, routes, participationPaths] = await Promise.all([
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

  const dossierIds = dossiers.map((item) => item.id);
  const updatesByDossierId = await getPublishedDossierUpdatesByDossierIds(dossierIds);

  return [
    ...buildEditorialItems(editorialItems),
    ...buildMemoryItems(memoryItems),
    ...buildArchiveItems(archiveAssets),
    ...buildCollectionItems(archiveCollections),
    ...buildDossierItems(dossiers, updatesByDossierId),
    ...buildCampaignItems(campaigns),
    ...buildImpactItems(impacts),
    ...buildThemeHubItems(hubs),
    ...buildTerritoryItems(territories),
    ...buildActorItems(actors),
    ...buildPatternItems(patterns),
    ...buildEditionItems(editions),
    ...buildSeriesItems(editorialItems),
    ...buildRouteItems(routes),
    ...buildParticipationItems(participationPaths),
  ] as TimelineEntry[];
}

export const getPublishedTimelineEntries = cache(async () => {
  const entries = await buildTimelineEntries();
  return sortEntries(entries, "chronological");
});

export async function getTimelineEntryByContent(contentType: SearchContentType, contentKey: string) {
  const entries = await getPublishedTimelineEntries();
  return entries.find((entry) => entry.contentType === contentType && entry.contentKey === contentKey) ?? null;
}

function filterEntries(entries: TimelineEntry[], filters: TimelineFilters) {
  const query = filters.query.trim();

  return entries.filter((entry) => {
    if (!matchesType(entry, filters.contentType)) return false;
    if (!matchesLabel(entry, filters.territory, "territory")) return false;
    if (!matchesLabel(entry, filters.actor, "actor")) return false;
    if (!matchesPeriod(entry, filters.period)) return false;
    if (!query) return true;
    return scoreEntry(entry, query) > 0;
  });
}

export async function getTimelinePageData(filters: TimelineFilters): Promise<TimelinePageData> {
  const index = await getPublishedTimelineEntries();
  const filtered = filterEntries(index, filters);
  const entries = sortEntries(filtered, filters.sort);

  return {
    entries,
    spotlight: entries[0] ?? index[0] ?? null,
    total: entries.length,
    facets: {
      types: countTypeValues(index),
      territories: countFacetValues(index, (entry) => entry.territoryLabel),
      actors: countFacetValues(index, (entry) => entry.actorLabel),
      periods: countPeriodValues(index),
    },
  };
}

export function getTimelineFeaturedEntries(entries: TimelineEntry[], limit = 4) {
  return entries.filter((entry) => entry.featured).slice(0, limit);
}

export function getTimelineRelatedEntries(entry: TimelineEntry, entries: TimelineEntry[]) {
  return entries
    .filter((candidate) => candidate.id !== entry.id)
    .filter((candidate) => {
      if (candidate.territoryLabel && entry.territoryLabel && normalize(candidate.territoryLabel) === normalize(entry.territoryLabel)) return true;
      if (candidate.actorLabel && entry.actorLabel && normalize(candidate.actorLabel) === normalize(entry.actorLabel)) return true;
      if (candidate.periodKey === entry.periodKey) return true;
      if (candidate.contentType === entry.contentType) return true;
      return false;
    })
    .slice(0, 4);
}

export function getTimelineChronologicalGroups(entries: TimelineEntry[]) {
  const groups = new Map<string, TimelineEntry[]>();

  for (const entry of entries) {
    const list = groups.get(entry.periodKey) ?? [];
    list.push(entry);
    groups.set(entry.periodKey, list);
  }

  const orderedKeys = ["origens", "formacao", "reconfiguracao", "presente", "agora", "sem_data"] as const;
  return orderedKeys
    .map((periodKey) => ({ periodKey, label: getTimelinePeriodLabel(periodKey), entries: sortEntries(groups.get(periodKey) ?? [], "chronological") }))
    .filter((group) => group.entries.length > 0);
}

export function getTimelineDateBasisCount(entries: TimelineEntry[], basis: TimelineDateBasis) {
  return entries.filter((entry) => entry.dateBasis === basis).length;
}

export function getTimelineQueryHotTerms() {
  return [
    site.editorialAxes[0]?.title,
    site.editorialAxes[1]?.title,
    site.editorialAxes[2]?.title,
    site.featuredPautas[0]?.tag,
    site.featuredPautas[1]?.tag,
    site.featuredPautas[2]?.tag,
    "CSN",
    "pó preto",
    "Vila Santa Cecília",
    "acidentes",
    "hospital",
    "escola",
    "memória",
    "abandono",
    "território",
  ].filter((term): term is string => Boolean(term));
}





