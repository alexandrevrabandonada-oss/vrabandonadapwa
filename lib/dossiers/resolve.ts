import type { ArchiveAsset } from "@/lib/archive/types";
import type { EditorialItem, EditorialSeries } from "@/lib/editorial/types";
import type { MemoryItem } from "@/lib/memory/types";
import type { ArchiveCollection } from "@/lib/archive/types";
import type { DossierResolvedLink, InvestigationDossierLink } from "@/lib/dossiers/types";
import { getDossierLinkHref, getDossierLinkTypeLabel, parseDossierLinkRef } from "@/lib/dossiers/navigation";

export type DossierLinkOption = {
  value: string;
  label: string;
};

export type DossierResolutionContext = {
  editorialItems: EditorialItem[];
  memoryItems: MemoryItem[];
  archiveAssets: ArchiveAsset[];
  archiveCollections: ArchiveCollection[];
  seriesCards: EditorialSeries[];
};

function sortResolvedLinks(items: DossierResolvedLink[]) {
  return [...items].sort((a, b) => {
    if ((a.featured ? 1 : 0) !== (b.featured ? 1 : 0)) {
      return Number(b.featured) - Number(a.featured);
    }

    if (a.sort_order !== b.sort_order) {
      return a.sort_order - b.sort_order;
    }

    return a.title.localeCompare(b.title);
  });
}

export function buildDossierLinkOptions(context: DossierResolutionContext) {
  const editorialOptions = context.editorialItems.map((item) => ({ value: `editorial:${item.slug}`, label: `Pauta · ${item.title}` }));
  const memoryOptions = context.memoryItems.map((item) => ({ value: `memory:${item.slug}`, label: `Memória · ${item.title}` }));
  const archiveOptions = context.archiveAssets.map((item) => ({ value: `archive:${item.id}`, label: `Acervo · ${item.title}` }));
  const collectionOptions = context.archiveCollections.map((item) => ({ value: `collection:${item.slug}`, label: `Coleção · ${item.title}` }));
  const seriesOptions = context.seriesCards.map((item) => ({ value: `series:${item.slug}`, label: `Série · ${item.title}` }));

  return [...editorialOptions, ...memoryOptions, ...archiveOptions, ...collectionOptions, ...seriesOptions].sort((a, b) => a.label.localeCompare(b.label));
}

export function resolveDossierLinks(links: InvestigationDossierLink[], context: DossierResolutionContext) {
  const resolved = links
    .map((link) => {
      const parsed = parseDossierLinkRef(`${link.link_type}:${link.link_key}`);
      if (!parsed) {
        return null;
      }

      if (parsed.type === "editorial") {
        const item = context.editorialItems.find((entry) => entry.slug === parsed.key);
        return item
          ? {
              id: link.id,
              link_type: link.link_type,
              link_key: link.link_key,
              title: item.title,
              excerpt: item.excerpt,
              href: getDossierLinkHref(parsed.type, parsed.key),
              featured: link.featured,
              sort_order: link.sort_order,
            }
          : null;
      }

      if (parsed.type === "memory") {
        const item = context.memoryItems.find((entry) => entry.slug === parsed.key);
        return item
          ? {
              id: link.id,
              link_type: link.link_type,
              link_key: link.link_key,
              title: item.title,
              excerpt: item.excerpt,
              href: getDossierLinkHref(parsed.type, parsed.key),
              featured: link.featured,
              sort_order: link.sort_order,
            }
          : null;
      }

      if (parsed.type === "archive") {
        const item = context.archiveAssets.find((entry) => entry.id === parsed.key);
        return item
          ? {
              id: link.id,
              link_type: link.link_type,
              link_key: link.link_key,
              title: item.title,
              excerpt: item.description || item.source_label,
              href: getDossierLinkHref(parsed.type, parsed.key),
              featured: link.featured,
              sort_order: link.sort_order,
            }
          : null;
      }

      if (parsed.type === "collection") {
        const item = context.archiveCollections.find((entry) => entry.slug === parsed.key);
        return item
          ? {
              id: link.id,
              link_type: link.link_type,
              link_key: link.link_key,
              title: item.title,
              excerpt: item.excerpt || item.description,
              href: getDossierLinkHref(parsed.type, parsed.key),
              featured: link.featured,
              sort_order: link.sort_order,
            }
          : null;
      }

      if (parsed.type === "series") {
        const item = context.seriesCards.find((entry) => entry.slug === parsed.key);
        return item
          ? {
              id: link.id,
              link_type: link.link_type,
              link_key: link.link_key,
              title: item.title,
              excerpt: item.description,
              href: getDossierLinkHref(parsed.type, parsed.key),
              featured: link.featured,
              sort_order: link.sort_order,
            }
          : null;
      }

      return null;
    })
    .filter((entry): entry is DossierResolvedLink => Boolean(entry));

  return sortResolvedLinks(resolved);
}

export function groupDossierLinksByType(links: DossierResolvedLink[]) {
  return links.reduce<Partial<Record<string, DossierResolvedLink[]>>>((acc, link) => {
    const key = link.link_type;
    acc[key] = [...(acc[key] ?? []), link];
    return acc;
  }, {});
}

export function getDossierLinkTypeHeading(type: string) {
  return getDossierLinkTypeLabel(type);
}

export function getDossierLinkPreviewText(link: DossierResolvedLink) {
  return link.excerpt || getDossierLinkTypeLabel(link.link_type);
}

