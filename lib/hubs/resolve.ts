import type { ArchiveAsset } from "@/lib/archive/types";
import type { ArchiveCollection } from "@/lib/archive/types";
import type { EditorialItem, EditorialSeries } from "@/lib/editorial/types";
import type { MemoryItem } from "@/lib/memory/types";
import type { InvestigationDossier } from "@/lib/dossiers/types";
import type { ThemeHubResolvedLink, ThemeHubTimelineEntry, ThemeHubLink } from "@/lib/hubs/types";
import { getThemeHubLinkHref, getThemeHubLinkRoleLabel, getThemeHubLinkTypeLabel, getThemeHubLinkRef, parseThemeHubLinkRef, getThemeHubLinkRoleOrder } from "@/lib/hubs/navigation";

export type ThemeHubLinkOption = {
  value: string;
  label: string;
};

export type ThemeHubResolutionContext = {
  editorialItems: EditorialItem[];
  memoryItems: MemoryItem[];
  archiveAssets: ArchiveAsset[];
  archiveCollections: ArchiveCollection[];
  dossiers: InvestigationDossier[];
  seriesCards: EditorialSeries[];
};

function sortResolvedLinks(items: ThemeHubResolvedLink[]) {
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
      return getThemeHubLinkRoleOrder(a.link_role) - getThemeHubLinkRoleOrder(b.link_role);
    }

    if (a.sort_order !== b.sort_order) {
      return a.sort_order - b.sort_order;
    }

    return a.title.localeCompare(b.title);
  });
}

export function buildThemeHubLinkOptions(context: ThemeHubResolutionContext) {
  const editorialOptions = context.editorialItems.map((item) => ({ value: `editorial:${item.slug}`, label: `Pauta · ${item.title}` }));
  const dossierOptions = context.dossiers.map((item) => ({ value: `dossier:${item.slug}`, label: `Dossiê · ${item.title}` }));
  const memoryOptions = context.memoryItems.map((item) => ({ value: `memory:${item.slug}`, label: `Memória · ${item.title}` }));
  const archiveOptions = context.archiveAssets.map((item) => ({ value: `archive:${item.id}`, label: `Acervo · ${item.title}` }));
  const collectionOptions = context.archiveCollections.map((item) => ({ value: `collection:${item.slug}`, label: `Coleção · ${item.title}` }));
  const seriesOptions = context.seriesCards.map((item) => ({ value: `series:${item.slug}`, label: `Série · ${item.title}` }));

  return [...editorialOptions, ...dossierOptions, ...memoryOptions, ...archiveOptions, ...collectionOptions, ...seriesOptions].sort((a, b) => a.label.localeCompare(b.label));
}

export function resolveThemeHubLinks(links: ThemeHubLink[], context: ThemeHubResolutionContext) {
  const resolved = links
    .map((link) => {
      const parsed = parseThemeHubLinkRef(getThemeHubLinkRef(link.link_type, link.link_key));
      if (!parsed) {
        return null;
      }

      let title = link.link_key;
      let excerpt: string | null = null;
      const href = getThemeHubLinkHref(parsed.type, parsed.key);

      if (parsed.type === "editorial") {
        const item = context.editorialItems.find((entry) => entry.slug === parsed.key);
        if (item) {
          title = item.title;
          excerpt = item.excerpt;
        }
      }

      if (parsed.type === "dossier") {
        const item = context.dossiers.find((entry) => entry.slug === parsed.key);
        if (item) {
          title = item.title;
          excerpt = item.excerpt || item.description;
        }
      }

      if (parsed.type === "memory") {
        const item = context.memoryItems.find((entry) => entry.slug === parsed.key);
        if (item) {
          title = item.title;
          excerpt = item.excerpt;
        }
      }

      if (parsed.type === "archive") {
        const item = context.archiveAssets.find((entry) => entry.id === parsed.key);
        if (item) {
          title = item.title;
          excerpt = item.description || item.source_label;
        }
      }

      if (parsed.type === "collection") {
        const item = context.archiveCollections.find((entry) => entry.slug === parsed.key);
        if (item) {
          title = item.title;
          excerpt = item.excerpt || item.description;
        }
      }

      if (parsed.type === "series") {
        const item = context.seriesCards.find((entry) => entry.slug === parsed.key);
        if (item) {
          title = item.title;
          excerpt = item.description;
        }
      }

      return {
        id: link.id,
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
      } satisfies ThemeHubResolvedLink;
    })
    .filter((entry): entry is ThemeHubResolvedLink => Boolean(entry));

  return sortResolvedLinks(resolved);
}

export function groupThemeHubLinksByType(links: ThemeHubResolvedLink[]) {
  return links.reduce<Partial<Record<string, ThemeHubResolvedLink[]>>>((acc, link) => {
    const key = link.link_type;
    acc[key] = [...(acc[key] ?? []), link];
    return acc;
  }, {});
}

export function groupThemeHubLinksByRole(links: ThemeHubResolvedLink[]) {
  return links.reduce<Partial<Record<string, ThemeHubResolvedLink[]>>>((acc, link) => {
    const key = link.link_role;
    acc[key] = [...(acc[key] ?? []), link];
    return acc;
  }, {});
}

export function buildThemeHubTimeline(links: ThemeHubResolvedLink[]): ThemeHubTimelineEntry[] {
  return sortResolvedLinks(links)
    .filter((link) => link.timeline_year !== null || Boolean(link.timeline_label))
    .map((link) => ({
      ...link,
      yearLabel: link.timeline_label || (link.timeline_year ? String(link.timeline_year) : "linha aberta"),
      roleLabel: getThemeHubLinkRoleLabel(link.link_role),
    }))
    .sort((a, b) => {
      const aYear = a.timeline_year ?? Number.POSITIVE_INFINITY;
      const bYear = b.timeline_year ?? Number.POSITIVE_INFINITY;

      if (aYear !== bYear) {
        return aYear - bYear;
      }

      if (a.link_role !== b.link_role) {
        return getThemeHubLinkRoleOrder(a.link_role) - getThemeHubLinkRoleOrder(b.link_role);
      }

      return a.sort_order - b.sort_order;
    });
}

export function getThemeHubLinkTypeHeading(type: string) {
  return getThemeHubLinkTypeLabel(type);
}

export function getThemeHubLinkPreviewText(link: ThemeHubResolvedLink) {
  return link.timeline_note || link.excerpt || getThemeHubLinkTypeLabel(link.link_type);
}
