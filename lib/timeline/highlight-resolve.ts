import { getPublishedArchiveAssets } from "@/lib/archive/queries";
import { getArchiveAssetTypeLabel } from "@/lib/archive/navigation";
import { getPublishedArchiveCollections } from "@/lib/archive/collections";
import { getPublishedActorHubs } from "@/lib/actors/queries";
import { getPublishedCampaigns } from "@/lib/campaigns/queries";
import { getCampaignStatusLabel, getCampaignTypeLabel } from "@/lib/campaigns/navigation";
import { getPublishedEditorialItems } from "@/lib/editorial/queries";
import { getPublishedEditorialEditions } from "@/lib/editions/queries";
import { getEditionStatusLabel, getEditionTypeLabel } from "@/lib/editions/navigation";
import { getPublishedDossiers, getPublishedDossierUpdatesByDossierIds } from "@/lib/dossiers/queries";
import { getDossierUpdateNarrativeLabel, getDossierUpdatePreviewText } from "@/lib/dossiers/updates";
import { getPublishedImpacts } from "@/lib/impact/queries";
import { getImpactStatusLabel, getImpactTypeLabel } from "@/lib/impact/navigation";
import { getPublishedMemoryItems } from "@/lib/memory/queries";
import { getPublishedPatternReads } from "@/lib/patterns/queries";
import { getPatternReadStatusLabel, getPatternReadTypeLabel } from "@/lib/patterns/navigation";
import { getPublishedPlaceHubs } from "@/lib/territories/queries";
import { getPlaceHubPlaceTypeLabel, getPlaceHubStatusLabel } from "@/lib/territories/navigation";
import { getPublishedThemeHubs } from "@/lib/hubs/queries";
import { getThemeHubStatusLabel } from "@/lib/hubs/navigation";
import type { ArchiveAsset, ArchiveCollection } from "@/lib/archive/types";
import type { ActorHub } from "@/lib/actors/types";
import type { PublicCampaign } from "@/lib/campaigns/types";
import type { EditorialEdition } from "@/lib/editions/types";
import type { InvestigationDossierUpdate } from "@/lib/dossiers/types";
import type { PublicImpact } from "@/lib/impact/types";
import type { MemoryItem } from "@/lib/memory/types";
import type { PatternRead } from "@/lib/patterns/types";
import type { PlaceHub } from "@/lib/territories/types";
import type { ThemeHub } from "@/lib/hubs/types";
import type {
  TimelineHighlight,
  TimelineHighlightLink,
  TimelineHighlightLinkOption,
  TimelineHighlightLinkRole,
  TimelineHighlightLinkType,
  TimelineHighlightResolvedLink,
  TimelineHighlightTimelineEntry,
} from "@/lib/timeline/highlights";
import { getTimelineHighlightLinkRoleLabel } from "@/lib/timeline/highlights";

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function formatDateLabel(value: string | null | undefined) {
  if (!value) return null;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function linkRef(type: TimelineHighlightLinkType | string, key: string) {
  return `${type}:${key}`;
}

export function parseTimelineHighlightLinkRef(ref: string) {
  const [type, ...rest] = ref.split(":");
  const key = rest.join(":").trim();
  if (!type || !key) return null;
  return { type, key };
}

type ResolveContext = {
  editorialItems: Awaited<ReturnType<typeof getPublishedEditorialItems>>;
  memoryItems: Awaited<ReturnType<typeof getPublishedMemoryItems>>;
  archiveAssets: Awaited<ReturnType<typeof getPublishedArchiveAssets>>;
  archiveCollections: Awaited<ReturnType<typeof getPublishedArchiveCollections>>;
  dossiers: Awaited<ReturnType<typeof getPublishedDossiers>>;
  dossierUpdates: InvestigationDossierUpdate[];
  campaigns: Awaited<ReturnType<typeof getPublishedCampaigns>>;
  impacts: Awaited<ReturnType<typeof getPublishedImpacts>>;
  themeHubs: Awaited<ReturnType<typeof getPublishedThemeHubs>>;
  placeHubs: Awaited<ReturnType<typeof getPublishedPlaceHubs>>;
  actorHubs: Awaited<ReturnType<typeof getPublishedActorHubs>>;
  patterns: Awaited<ReturnType<typeof getPublishedPatternReads>>;
  editions: Awaited<ReturnType<typeof getPublishedEditorialEditions>>;
};

function resolveReference(type: string, key: string, context: ResolveContext) {
  switch (type) {
    case "editorial": {
      const item = context.editorialItems.find((entry) => entry.slug === key);
      return item ? { href: `/pautas/${item.slug}`, title: item.title, excerpt: item.excerpt || item.body || null, typeLabel: "Pauta" } : null;
    }
    case "memory": {
      const item = context.memoryItems.find((entry) => entry.slug === key);
      return item ? { href: `/memoria/${item.slug}`, title: item.title, excerpt: item.excerpt || item.body || null, typeLabel: "Memória" } : null;
    }
    case "archive": {
      const item = context.archiveAssets.find((entry) => entry.id === key);
      return item ? { href: `/acervo/${item.id}`, title: item.title, excerpt: item.description || item.source_label || null, typeLabel: getArchiveAssetTypeLabel(item.asset_type) } : null;
    }
    case "collection": {
      const item = context.archiveCollections.find((entry) => entry.slug === key);
      return item ? { href: `/acervo/colecoes/${item.slug}`, title: item.title, excerpt: item.excerpt || item.description || null, typeLabel: "Coleção" } : null;
    }
    case "dossier": {
      const item = context.dossiers.find((entry) => entry.slug === key);
      return item ? { href: `/dossies/${item.slug}`, title: item.title, excerpt: item.excerpt || item.description || null, typeLabel: "Dossiê" } : null;
    }
    case "dossier_update": {
      const update = context.dossierUpdates.find((entry) => entry.slug && entry.slug === key);
      if (!update) return null;
      const dossier = context.dossiers.find((entry) => entry.id === update.dossier_id);
      return {
        href: dossier ? `/dossies/${dossier.slug}` : "/dossies",
        title: update.title,
        excerpt: update.excerpt || getDossierUpdatePreviewText(update),
        typeLabel: getDossierUpdateNarrativeLabel(update.update_type),
      };
    }
    case "campaign": {
      const item = context.campaigns.find((entry) => entry.slug === key);
      return item ? { href: `/campanhas/${item.slug}`, title: item.title, excerpt: item.excerpt || item.description || null, typeLabel: "Campanha" } : null;
    }
    case "impact": {
      const item = context.impacts.find((entry) => entry.slug === key);
      return item ? { href: `/impacto/${item.slug}`, title: item.title, excerpt: item.excerpt || item.description || null, typeLabel: "Impacto" } : null;
    }
    case "hub": {
      const item = context.themeHubs.find((entry) => entry.slug === key);
      return item ? { href: `/eixos/${item.slug}`, title: item.title, excerpt: item.excerpt || item.description || null, typeLabel: "Eixo" } : null;
    }
    case "territory": {
      const item = context.placeHubs.find((entry) => entry.slug === key);
      return item ? { href: `/territorios/${item.slug}`, title: item.title, excerpt: item.excerpt || item.description || null, typeLabel: "Território" } : null;
    }
    case "actor": {
      const item = context.actorHubs.find((entry) => entry.slug === key);
      return item ? { href: `/atores/${item.slug}`, title: item.title, excerpt: item.excerpt || item.description || null, typeLabel: "Ator" } : null;
    }
    case "pattern": {
      const item = context.patterns.find((entry) => entry.slug === key);
      return item ? { href: `/padroes/${item.slug}`, title: item.title, excerpt: item.excerpt || item.description || null, typeLabel: "Padrão" } : null;
    }
    case "edition": {
      const item = context.editions.find((entry) => entry.slug === key);
      return item ? { href: `/edicoes/${item.slug}`, title: item.title, excerpt: item.excerpt || item.description || null, typeLabel: "Edição" } : null;
    }
    case "page":
      return key.startsWith("/") ? { href: key, title: key, excerpt: null, typeLabel: "Página" } : null;
    case "external":
      return key.startsWith("http") ? { href: key, title: key, excerpt: null, typeLabel: "Externo" } : null;
    default:
      return null;
  }
}

export function resolveTimelineHighlightLinks(links: TimelineHighlightLink[], context: ResolveContext): TimelineHighlightResolvedLink[] {
  return links.flatMap((link) => {
    const resolved = resolveReference(link.link_type, link.link_key, context);
    if (!resolved) return [];
    return [
      {
        ...link,
        href: resolved.href,
        title: resolved.title,
        excerpt: resolved.excerpt,
        typeLabel: resolved.typeLabel,
        roleLabel: getTimelineHighlightLinkRoleLabel(link.link_role),
        external: link.link_type === "external",
      },
    ];
  });
}

export function buildTimelineHighlightTimeline(resolvedLinks: TimelineHighlightResolvedLink[]): TimelineHighlightTimelineEntry[] {
  return [...resolvedLinks]
    .sort((a, b) => {
      if ((a.featured ? 1 : 0) !== (b.featured ? 1 : 0)) {
        return Number(b.featured) - Number(a.featured);
      }

      const aYear = a.timeline_year ?? Number.POSITIVE_INFINITY;
      const bYear = b.timeline_year ?? Number.POSITIVE_INFINITY;
      if (aYear !== bYear) {
        return aYear - bYear;
      }

      if (a.sort_order !== b.sort_order) {
        return a.sort_order - b.sort_order;
      }

      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    })
    .map((item) => ({
      ...item,
      yearLabel: item.timeline_label || (item.timeline_year ? String(item.timeline_year) : "Sem data"),
    }));
}

export function groupTimelineHighlightLinksByRole(resolvedLinks: TimelineHighlightResolvedLink[]) {
  return resolvedLinks.reduce<Record<string, TimelineHighlightResolvedLink[]>>((groups, link) => {
    const key = link.link_role || "context";
    groups[key] = groups[key] ? [...groups[key], link] : [link];
    return groups;
  }, {});
}

export function buildTimelineHighlightLinkOptions(context: ResolveContext): TimelineHighlightLinkOption[] {
  const editorialOptions = context.editorialItems.map((item) => ({ value: linkRef("editorial", item.slug), label: `Pauta · ${item.title}` }));
  const memoryOptions = context.memoryItems.map((item) => ({ value: linkRef("memory", item.slug), label: `Memória · ${item.title}` }));
  const archiveOptions = context.archiveAssets.map((item) => ({ value: linkRef("archive", item.id), label: `Acervo · ${item.title}` }));
  const collectionOptions = context.archiveCollections.map((item) => ({ value: linkRef("collection", item.slug), label: `Coleção · ${item.title}` }));
  const dossierOptions = context.dossiers.map((item) => ({ value: linkRef("dossier", item.slug), label: `Dossiê · ${item.title}` }));
  const dossierUpdateOptions = context.dossierUpdates.flatMap((update) => {
    const dossier = context.dossiers.find((entry) => entry.id === update.dossier_id);
    if (!dossier || !update.slug) return [];
    return [{ value: linkRef("dossier_update", update.slug), label: `Atualização · ${dossier.title} · ${update.title}` }];
  });
  const campaignOptions = context.campaigns.map((item) => ({ value: linkRef("campaign", item.slug), label: `Campanha · ${item.title}` }));
  const impactOptions = context.impacts.map((item) => ({ value: linkRef("impact", item.slug), label: `Impacto · ${item.title}` }));
  const hubOptions = context.themeHubs.map((item) => ({ value: linkRef("hub", item.slug), label: `Eixo · ${item.title}` }));
  const territoryOptions = context.placeHubs.map((item) => ({ value: linkRef("territory", item.slug), label: `Território · ${item.title}` }));
  const actorOptions = context.actorHubs.map((item) => ({ value: linkRef("actor", item.slug), label: `Ator · ${item.title}` }));
  const patternOptions = context.patterns.map((item) => ({ value: linkRef("pattern", item.slug), label: `Padrão · ${item.title}` }));
  const editionOptions = context.editions.map((item) => ({ value: linkRef("edition", item.slug), label: `Edição · ${item.title}` }));

  return [
    ...editorialOptions,
    ...memoryOptions,
    ...archiveOptions,
    ...collectionOptions,
    ...dossierOptions,
    ...dossierUpdateOptions,
    ...campaignOptions,
    ...impactOptions,
    ...hubOptions,
    ...territoryOptions,
    ...actorOptions,
    ...patternOptions,
    ...editionOptions,
  ].sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
}

export function getTimelineHighlightHeroVariant(type: string) {
  switch (type) {
    case "origin":
      return "steel";
    case "rupture":
      return "night";
    case "recurrence":
      return "ember";
    case "consequence":
      return "concrete";
    case "turning_point":
      return "steel";
    case "archive_marker":
      return "paper";
    default:
      return "night";
  }
}

export function getTimelineHighlightContentLabels(highlight: TimelineHighlight) {
  return [highlight.highlight_type, highlight.period_label, highlight.date_label].filter(Boolean) as string[];
}
