import { getPublishedArchiveAssets } from "@/lib/archive/queries";
import { getPublishedCampaigns } from "@/lib/campaigns/queries";
import { getArchiveAssetPeriodLabel, getArchiveAssetTypeLabel } from "@/lib/archive/navigation";
import { getPublishedEditorialItems } from "@/lib/editorial/queries";
import { getEditorialSeriesBySlug } from "@/lib/editorial/taxonomy";
import { getPublishedDossiers, getPublishedDossierUpdatesByDossierIds } from "@/lib/dossiers/queries";
import { getDossierStatusLabel } from "@/lib/dossiers/navigation";
import { getDossierUpdateNarrativeLabel, getDossierUpdatePreviewText, sortDossierUpdates } from "@/lib/dossiers/updates";
import { getPublishedMemoryItems } from "@/lib/memory/queries";
import { getPublishedThemeHubLinks, getPublishedThemeHubs } from "@/lib/hubs/queries";
import { getThemeHubStatusLabel } from "@/lib/hubs/navigation";
import { getCampaignStatusLabel, getCampaignTypeLabel } from "@/lib/campaigns/navigation";
import type { ArchiveAsset } from "@/lib/archive/types";
import type { PublicCampaign } from "@/lib/campaigns/types";
import type { EditorialItem } from "@/lib/editorial/types";
import type { InvestigationDossier, InvestigationDossierUpdate } from "@/lib/dossiers/types";
import type { MemoryItem } from "@/lib/memory/types";
import type { ThemeHub } from "@/lib/hubs/types";
import type { RadarItem, RadarPageData, RadarSection, RadarSectionMap, RadarSourceType } from "@/lib/radar/types";

function formatRadarDateLabel(value: string | null | undefined) {
  if (!value) return null;

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function sortRadarItems(items: RadarItem[]) {
  return [...items].sort((a, b) => {
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

    return a.title.localeCompare(b.title);
  });
}

function dedupeRadarItems(items: RadarItem[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.href)) return false;
    seen.add(item.href);
    return true;
  });
}

function getCoverVariantBySource(sourceType: RadarSourceType, featured: boolean, section: RadarSection) {
  if (sourceType === "dossier-update") return section === "calls" ? "ember" : "night";
  if (sourceType === "dossier") return featured ? "ember" : "concrete";
  if (sourceType === "theme-hub") return featured ? "ember" : "steel";
  if (sourceType === "editorial") return featured ? "ember" : "night";
  if (sourceType === "memory") return featured ? "ember" : "steel";
  return featured ? "ember" : "concrete";
}

function buildUpdateItem(update: InvestigationDossierUpdate, dossier: InvestigationDossier): RadarItem {
  const section: RadarSection = update.update_type === "call" ? "calls" : "what_changed";

  return {
    id: `update:${update.id}`,
    section,
    sourceType: "dossier-update",
    title: update.title,
    excerpt: getDossierUpdatePreviewText(update),
    href: `/dossies/${dossier.slug}`,
    primaryLabel: dossier.title,
    secondaryLabel: `${getDossierStatusLabel(dossier.status)} • ${getDossierUpdateNarrativeLabel(update.update_type)}`,
    dateLabel: formatRadarDateLabel(update.published_at || update.created_at),
    coverImageUrl: dossier.cover_image_url,
    coverVariant: getCoverVariantBySource("dossier-update", update.featured, section),
    featured: update.featured || dossier.featured,
    sortDate: update.published_at || update.created_at,
    sortOrder: update.sort_order,
    actionLabel: "Abrir dossiê",
  };
}

function buildEditorialItem(item: EditorialItem): RadarItem {
  const series = item.series_slug ? getEditorialSeriesBySlug(item.series_slug) : null;

  return {
    id: `editorial:${item.id}`,
    section: "what_changed",
    sourceType: "editorial",
    title: item.title,
    excerpt: item.excerpt,
    href: `/pautas/${item.slug}`,
    primaryLabel: "Pauta",
    secondaryLabel: item.series_title || series?.title || item.primary_tag || item.category,
    dateLabel: formatRadarDateLabel(item.published_at || item.updated_at),
    coverImageUrl: item.cover_image_url,
    coverVariant: item.cover_variant || getCoverVariantBySource("editorial", item.featured, "what_changed"),
    featured: item.featured,
    sortDate: item.published_at || item.updated_at,
    sortOrder: item.featured_order ?? 9999,
    actionLabel: "Ler pauta",
  };
}

function buildDossierItem(dossier: InvestigationDossier, latestUpdate: InvestigationDossierUpdate | null): RadarItem {
  return {
    id: `dossier:${dossier.id}`,
    section: "in_course",
    sourceType: "dossier",
    title: dossier.title,
    excerpt: latestUpdate ? getDossierUpdatePreviewText(latestUpdate) : dossier.excerpt || dossier.description,
    href: `/dossies/${dossier.slug}`,
    primaryLabel: "Dossiê",
    secondaryLabel: dossier.lead_question || dossier.period_label || dossier.territory_label,
    dateLabel: formatRadarDateLabel(latestUpdate?.published_at || dossier.updated_at),
    coverImageUrl: dossier.cover_image_url,
    coverVariant: getCoverVariantBySource("dossier", dossier.featured, "in_course"),
    featured: dossier.featured,
    sortDate: latestUpdate?.published_at || dossier.updated_at,
    sortOrder: dossier.sort_order,
    actionLabel: "Abrir dossiê",
  };
}

function buildThemeHubItem(hub: ThemeHub, latestMovement: InvestigationDossierUpdate | null): RadarItem {
  return {
    id: `hub:${hub.id}`,
    section: "hot_fronts",
    sourceType: "theme-hub",
    title: hub.title,
    excerpt: latestMovement ? getDossierUpdatePreviewText(latestMovement) : hub.excerpt || hub.description,
    href: `/eixos/${hub.slug}`,
    primaryLabel: "Eixo",
    secondaryLabel: getThemeHubStatusLabel(hub.status),
    dateLabel: formatRadarDateLabel(latestMovement?.published_at || hub.updated_at),
    coverImageUrl: hub.cover_image_url,
    coverVariant: getCoverVariantBySource("theme-hub", hub.featured, "hot_fronts"),
    featured: hub.featured,
    sortDate: latestMovement?.published_at || hub.updated_at,
    sortOrder: hub.sort_order,
    actionLabel: "Abrir eixo",
  };
}

function buildMemoryItem(item: MemoryItem): RadarItem {
  return {
    id: `memory:${item.id}`,
    section: "archive_present",
    sourceType: "memory",
    title: item.title,
    excerpt: item.excerpt,
    href: `/memoria/${item.slug}`,
    primaryLabel: "Memória",
    secondaryLabel: item.collection_title || item.memory_collection,
    dateLabel: formatRadarDateLabel(item.published_at || item.updated_at),
    coverImageUrl: item.cover_image_url,
    coverVariant: getCoverVariantBySource("memory", item.featured || item.highlight_in_memory, "archive_present"),
    featured: item.featured || item.highlight_in_memory,
    sortDate: item.published_at || item.updated_at,
    sortOrder: item.timeline_rank ?? 9999,
    actionLabel: "Ler memória",
  };
}

function buildArchiveItem(asset: ArchiveAsset): RadarItem {
  return {
    id: `archive:${asset.id}`,
    section: "archive_present",
    sourceType: "archive",
    title: asset.title,
    excerpt: asset.description || asset.source_label || "Material-base do arquivo vivo.",
    href: `/acervo/${asset.id}`,
    primaryLabel: getArchiveAssetTypeLabel(asset.asset_type),
    secondaryLabel: asset.source_label || asset.place_label || asset.collection_slug || asset.rights_note,
    dateLabel: asset.source_date_label || getArchiveAssetPeriodLabel(asset),
    coverImageUrl: asset.thumb_url || asset.file_url,
    coverVariant: getCoverVariantBySource("archive", asset.featured, "archive_present"),
    featured: asset.featured,
    sortDate: asset.updated_at || asset.created_at,
    sortOrder: asset.sort_order,
    actionLabel: "Abrir documento",
  };
}

function buildCampaignItem(campaign: PublicCampaign): RadarItem {
  return {
    id: `campaign:${campaign.id}`,
    section: "calls",
    sourceType: "campaign",
    title: campaign.title,
    excerpt: campaign.excerpt || campaign.description,
    href: `/campanhas/${campaign.slug}`,
    primaryLabel: "Campanha",
    secondaryLabel: `${getCampaignStatusLabel(campaign.status)} • ${getCampaignTypeLabel(campaign.campaign_type)}`,
    dateLabel: formatRadarDateLabel(campaign.start_date || campaign.updated_at),
    coverImageUrl: campaign.cover_image_url,
    coverVariant: getCoverVariantBySource("campaign", campaign.featured, "calls"),
    featured: campaign.featured || campaign.status === "active",
    sortDate: campaign.start_date || campaign.updated_at,
    sortOrder: campaign.sort_order,
    actionLabel: "Abrir campanha",
  };
}
function getLatestUpdateForDossier(dossierId: string, updatesByDossierId: Map<string, InvestigationDossierUpdate[]>) {
  return updatesByDossierId.get(dossierId)?.[0] ?? null;
}

function initializeSections(): RadarSectionMap {
  return {
    what_changed: [],
    in_course: [],
    hot_fronts: [],
    archive_present: [],
    calls: [],
  };
}

export async function getRadarPageData(): Promise<RadarPageData> {
  const [dossiers, editorialItems, memoryItems, archiveAssets, hubs, campaigns] = await Promise.all([
    getPublishedDossiers(),
    getPublishedEditorialItems(),
    getPublishedMemoryItems(),
    getPublishedArchiveAssets(),
    getPublishedThemeHubs(),
    getPublishedCampaigns(),
  ]);

  const dossierIds = dossiers.map((dossier) => dossier.id);
  const [updatesByDossierId, hubLinksById] = await Promise.all([
    getPublishedDossierUpdatesByDossierIds(dossierIds),
    Promise.all(hubs.map(async (hub) => [hub.id, await getPublishedThemeHubLinks(hub.id)] as const)),
  ]);

  const hubLinksMap = new Map(hubLinksById);
  const dossierBySlug = new Map(dossiers.map((dossier) => [dossier.slug, dossier]));

  const updateItems = sortRadarItems(
    dossiers.flatMap((dossier) => (updatesByDossierId.get(dossier.id) ?? []).map((update) => buildUpdateItem(update, dossier))),
  );

  const editorialRadarItems = sortRadarItems(
    editorialItems
      .filter((item) => item.featured || item.published_at)
      .slice(0, 4)
      .map((item) => buildEditorialItem(item)),
  );

  const activeDossierItems = sortRadarItems(
    dossiers
      .filter((dossier) => dossier.status === "in_progress" || dossier.status === "monitoring")
      .map((dossier) => buildDossierItem(dossier, getLatestUpdateForDossier(dossier.id, updatesByDossierId))),
  );

  const hubItems = sortRadarItems(
    hubs
      .filter((hub) => hub.status === "active" || hub.status === "monitoring")
      .map((hub) => {
        const hubLinks = hubLinksMap.get(hub.id) ?? [];
        const dossierLinks = hubLinks.filter((link) => link.link_type === "dossier");
        const relatedDossiers = dossierLinks
          .map((link) => dossierBySlug.get(link.link_key))
          .filter((item): item is InvestigationDossier => Boolean(item));
        const latestMovement = sortDossierUpdates(
          relatedDossiers.flatMap((dossier) => updatesByDossierId.get(dossier.id) ?? []),
        )[0] ?? null;

        return buildThemeHubItem(hub, latestMovement);
      }),
  );

  const campaignItems = sortRadarItems(
    campaigns
      .filter((campaign) => campaign.public_visibility && (campaign.status === "active" || campaign.status === "monitoring" || campaign.status === "upcoming"))
      .slice(0, 4)
      .map((campaign) => buildCampaignItem(campaign)),
  );

  const archiveRadarItems = sortRadarItems([
    ...memoryItems
      .filter((item) => item.featured || item.highlight_in_memory || item.timeline_rank !== null)
      .slice(0, 3)
      .map((item) => buildMemoryItem(item)),
    ...archiveAssets
      .filter((asset) => asset.public_visibility && (asset.featured || asset.sort_order <= 3))
      .slice(0, 3)
      .map((asset) => buildArchiveItem(asset)),
  ]);

  const sections = initializeSections();
  sections.what_changed = sortRadarItems([...updateItems.filter((item) => item.section === "what_changed"), ...editorialRadarItems]).slice(0, 6);
  sections.in_course = activeDossierItems.slice(0, 6);
  sections.hot_fronts = hubItems.slice(0, 4);
  sections.archive_present = archiveRadarItems.slice(0, 4);
  sections.calls = sortRadarItems([...updateItems.filter((item) => item.section === "calls"), ...campaignItems]).slice(0, 6);

  const spotlight =
    sections.what_changed[0] ?? sections.in_course[0] ?? sections.hot_fronts[0] ?? sections.archive_present[0] ?? sections.calls[0] ?? null;

  return {
    spotlight,
    sections,
    counts: {
      updates: sections.what_changed.length + sections.calls.length,
      dossiers: sections.in_course.length,
      hubs: sections.hot_fronts.length,
      archive: sections.archive_present.length,
      calls: sections.calls.length,
    },
  };
}

export async function getRadarHomeItems(limit = 4) {
  const data = await getRadarPageData();
  const items = dedupeRadarItems([
    data.spotlight,
    data.sections.what_changed[0],
    data.sections.in_course[0],
    data.sections.hot_fronts[0],
    data.sections.archive_present[0],
    data.sections.calls[0],
  ].filter((item): item is RadarItem => Boolean(item)));

  return items.slice(0, limit);
}









