import type {
  ArchiveAsset,
  ArchiveCollection,
} from "@/lib/archive/types";
import type { EditorialItem } from "@/lib/editorial/types";
import type { MemoryItem } from "@/lib/memory/types";
import type { InvestigationDossier } from "@/lib/dossiers/types";
import type { PublicCampaign } from "@/lib/campaigns/types";
import type { PublicImpact } from "@/lib/impact/types";
import type { ThemeHub } from "@/lib/hubs/types";
import type { PlaceHubResolvedLink, PlaceHubTimelineEntry, PlaceHubLink } from "@/lib/territories/types";
import { getPlaceHubLinkHref, getPlaceHubLinkRef, getPlaceHubLinkRoleLabel, getPlaceHubLinkTypeLabel, getPlaceHubLinkRoleOrder, parsePlaceHubLinkRef } from "@/lib/territories/navigation";

export type PlaceHubLinkOption = {
  value: string;
  label: string;
};

export type PlaceHubResolutionContext = {
  editorialItems: EditorialItem[];
  memoryItems: MemoryItem[];
  archiveAssets: ArchiveAsset[];
  archiveCollections: ArchiveCollection[];
  dossiers: InvestigationDossier[];
  campaigns: PublicCampaign[];
  impacts: PublicImpact[];
  themeHubs: ThemeHub[];
};

function sortResolvedLinks(items: PlaceHubResolvedLink[]) {
  return [...items].sort((a, b) => {
    if ((a.featured ? 1 : 0) !== (b.featured ? 1 : 0)) {
      return Number(b.featured) - Number(a.featured);
    }

    const aYear = a.timeline_year ?? Number.POSITIVE_INFINITY;
    const bYear = b.timeline_year ?? Number.POSITIVE_INFINITY;
    if (aYear !== bYear) {
      return aYear - bYear;
    }

    if (a.link_role !== b.link_role) {
      return getPlaceHubLinkRoleOrder(a.link_role) - getPlaceHubLinkRoleOrder(b.link_role);
    }

    if (a.sort_order !== b.sort_order) {
      return a.sort_order - b.sort_order;
    }

    return a.title.localeCompare(b.title);
  });
}

function pageOptions() {
  return [
    { value: "page:/agora", label: "Página · Agora" },
    { value: "page:/envie", label: "Página · Envie" },
    { value: "page:/metodo", label: "Página · Método" },
    { value: "page:/participe", label: "Página · Participe" },
    { value: "page:/apoie", label: "Página · Apoie" },
    { value: "page:/comecar", label: "Página · Começar" },
    { value: "page:/impacto", label: "Página · Impacto" },
    { value: "page:/campanhas", label: "Página · Campanhas" },
    { value: "page:/dossies", label: "Página · Dossiês" },
    { value: "page:/eixos", label: "Página · Eixos" },
    { value: "page:/memoria", label: "Página · Memória" },
    { value: "page:/acervo", label: "Página · Acervo" },
  ];
}

export function buildPlaceHubLinkOptions(context: PlaceHubResolutionContext) {
  const editorialOptions = context.editorialItems.map((item) => ({ value: `editorial:${item.slug}`, label: `Pauta · ${item.title}` }));
  const dossierOptions = context.dossiers.map((item) => ({ value: `dossier:${item.slug}`, label: `Dossiê · ${item.title}` }));
  const memoryOptions = context.memoryItems.map((item) => ({ value: `memory:${item.slug}`, label: `Memória · ${item.title}` }));
  const archiveOptions = context.archiveAssets.map((item) => ({ value: `archive:${item.id}`, label: `Acervo · ${item.title}` }));
  const collectionOptions = context.archiveCollections.map((item) => ({ value: `collection:${item.slug}`, label: `Coleção · ${item.title}` }));
  const campaignOptions = context.campaigns.map((item) => ({ value: `campaign:${item.slug}`, label: `Campanha · ${item.title}` }));
  const impactOptions = context.impacts.map((item) => ({ value: `impact:${item.slug}`, label: `Impacto · ${item.title}` }));
  const hubOptions = context.themeHubs.map((item) => ({ value: `hub:${item.slug}`, label: `Eixo · ${item.title}` }));

  return [
    ...editorialOptions,
    ...dossierOptions,
    ...memoryOptions,
    ...archiveOptions,
    ...collectionOptions,
    ...campaignOptions,
    ...impactOptions,
    ...hubOptions,
    ...pageOptions(),
  ].sort((a, b) => a.label.localeCompare(b.label));
}

function resolveTitleAndExcerpt(type: string, key: string, context: PlaceHubResolutionContext) {
  let title = key;
  let excerpt: string | null = null;

  if (type === "editorial") {
    const item = context.editorialItems.find((entry) => entry.slug === key);
    if (item) {
      title = item.title;
      excerpt = item.excerpt;
    }
  }

  if (type === "dossier") {
    const item = context.dossiers.find((entry) => entry.slug === key);
    if (item) {
      title = item.title;
      excerpt = item.excerpt || item.description;
    }
  }

  if (type === "memory") {
    const item = context.memoryItems.find((entry) => entry.slug === key);
    if (item) {
      title = item.title;
      excerpt = item.excerpt;
    }
  }

  if (type === "archive") {
    const item = context.archiveAssets.find((entry) => entry.id === key);
    if (item) {
      title = item.title;
      excerpt = item.description || item.source_label;
    }
  }

  if (type === "collection") {
    const item = context.archiveCollections.find((entry) => entry.slug === key);
    if (item) {
      title = item.title;
      excerpt = item.excerpt || item.description;
    }
  }

  if (type === "campaign") {
    const item = context.campaigns.find((entry) => entry.slug === key);
    if (item) {
      title = item.title;
      excerpt = item.excerpt || item.description;
    }
  }

  if (type === "impact") {
    const item = context.impacts.find((entry) => entry.slug === key);
    if (item) {
      title = item.title;
      excerpt = item.excerpt || item.description;
    }
  }

  if (type === "hub") {
    const item = context.themeHubs.find((entry) => entry.slug === key);
    if (item) {
      title = item.title;
      excerpt = item.excerpt || item.description;
    }
  }

  if (type === "page") {
    const routeLabel = key.replace(/^\//, "");
    title = routeLabel.charAt(0).toUpperCase() + routeLabel.slice(1);
    excerpt = null;
  }

  return { title, excerpt };
}

export function resolvePlaceHubLinks(links: PlaceHubLink[], context: PlaceHubResolutionContext) {
  const resolved = links
    .map((link) => {
      const parsed = parsePlaceHubLinkRef(getPlaceHubLinkRef(link.link_type, link.link_key));
      if (!parsed) {
        return null;
      }

      const href = getPlaceHubLinkHref(parsed.type, parsed.key);
      const { title, excerpt } = resolveTitleAndExcerpt(parsed.type, parsed.key, context);

      return {
        id: link.id,
        place_hub_id: link.place_hub_id,
        link_type: link.link_type,
        link_key: link.link_key,
        link_role: link.link_role,
        timeline_year: link.timeline_year,
        timeline_label: link.timeline_label,
        timeline_note: link.timeline_note,
        title,
        excerpt,
        href,
        featured: link.featured,
        sort_order: link.sort_order,
        created_at: link.created_at,
        updated_at: link.updated_at,
        typeLabel: getPlaceHubLinkTypeLabel(link.link_type),
        roleLabel: getPlaceHubLinkRoleLabel(link.link_role),
        external: parsed.type === "external",
      } satisfies PlaceHubResolvedLink;
    })
    .filter((entry): entry is PlaceHubResolvedLink => Boolean(entry));

  return sortResolvedLinks(resolved);
}

export function groupPlaceHubLinksByType(links: PlaceHubResolvedLink[]) {
  return links.reduce<Partial<Record<string, PlaceHubResolvedLink[]>>>((acc, link) => {
    const key = link.link_type;
    acc[key] = [...(acc[key] ?? []), link];
    return acc;
  }, {});
}

export function groupPlaceHubLinksByRole(links: PlaceHubResolvedLink[]) {
  return links.reduce<Partial<Record<string, PlaceHubResolvedLink[]>>>((acc, link) => {
    const key = link.link_role;
    acc[key] = [...(acc[key] ?? []), link];
    return acc;
  }, {});
}

export function buildPlaceHubTimeline(links: PlaceHubResolvedLink[]): PlaceHubTimelineEntry[] {
  return sortResolvedLinks(links)
    .filter((link) => link.timeline_year !== null || Boolean(link.timeline_label))
    .map((link) => ({
      ...link,
      yearLabel: link.timeline_label || (link.timeline_year ? String(link.timeline_year) : "linha aberta"),
    }))
    .sort((a, b) => {
      const aYear = a.timeline_year ?? Number.POSITIVE_INFINITY;
      const bYear = b.timeline_year ?? Number.POSITIVE_INFINITY;

      if (aYear !== bYear) {
        return aYear - bYear;
      }

      if (a.link_role !== b.link_role) {
        return getPlaceHubLinkRoleOrder(a.link_role) - getPlaceHubLinkRoleOrder(b.link_role);
      }

      return a.sort_order - b.sort_order;
    });
}

export function getPlaceHubLinkTypeHeading(type: string) {
  return getPlaceHubLinkTypeLabel(type);
}

export function getPlaceHubLinkPreviewText(link: PlaceHubResolvedLink) {
  return link.timeline_note || link.excerpt || getPlaceHubLinkTypeLabel(link.link_type);
}
