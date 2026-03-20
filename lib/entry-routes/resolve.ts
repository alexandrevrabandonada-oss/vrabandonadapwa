import type { ArchiveAsset, ArchiveCollection } from "@/lib/archive/types";
import type { EditorialItem, EditorialSeries } from "@/lib/editorial/types";
import type { InvestigationDossier } from "@/lib/dossiers/types";
import type { MemoryItem } from "@/lib/memory/types";
import type { ThemeHub } from "@/lib/hubs/types";
import type { EntryRouteItem, EntryRouteResolvedItem } from "@/lib/entry-routes/types";
import { getEntryRouteItemRoleLabel, getEntryRouteItemRoleTone, getEntryRouteItemTypeLabel } from "@/lib/entry-routes/navigation";

export type EntryRouteLinkOption = {
  value: string;
  label: string;
};

export type EntryRouteResolutionContext = {
  editorialItems: EditorialItem[];
  dossiers: InvestigationDossier[];
  memoryItems: MemoryItem[];
  archiveAssets: ArchiveAsset[];
  archiveCollections: ArchiveCollection[];
  hubs: ThemeHub[];
  seriesCards: EditorialSeries[];
};

function getFallbackHref(type: string, key: string) {
  switch (type) {
    case "editorial":
      return `/pautas/${key}`;
    case "dossier":
      return `/dossies/${key}`;
    case "memory":
      return `/memoria/${key}`;
    case "archive":
      return `/acervo/${key}`;
    case "collection":
      return `/acervo/colecoes/${key}`;
    case "hub":
      return `/eixos/${key}`;
    case "series":
      return `/series/${key}`;
    default:
      return "/";
  }
}

function sortResolvedItems(items: EntryRouteResolvedItem[]) {
  return [...items].sort((a, b) => {
    const roleA = a.role === "start" ? 1 : a.role === "context" ? 2 : a.role === "proof" ? 3 : a.role === "deepen" ? 4 : 5;
    const roleB = b.role === "start" ? 1 : b.role === "context" ? 2 : b.role === "proof" ? 3 : b.role === "deepen" ? 4 : 5;
    if (roleA !== roleB) return roleA - roleB;
    if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
    return a.title.localeCompare(b.title);
  });
}

export function buildEntryRouteLinkOptions(context: EntryRouteResolutionContext): EntryRouteLinkOption[] {
  const editorial = context.editorialItems.map((item) => ({ value: `editorial:${item.slug}`, label: `Pauta · ${item.title}` }));
  const dossiers = context.dossiers.map((item) => ({ value: `dossier:${item.slug}`, label: `Dossiê · ${item.title}` }));
  const memory = context.memoryItems.map((item) => ({ value: `memory:${item.slug}`, label: `Memória · ${item.title}` }));
  const archive = context.archiveAssets.map((item) => ({ value: `archive:${item.id}`, label: `Acervo · ${item.title}` }));
  const collections = context.archiveCollections.map((item) => ({ value: `collection:${item.slug}`, label: `Coleção · ${item.title}` }));
  const hubs = context.hubs.map((item) => ({ value: `hub:${item.slug}`, label: `Eixo · ${item.title}` }));
  const series = context.seriesCards.map((item) => ({ value: `series:${item.slug}`, label: `Série · ${item.title}` }));

  return [...editorial, ...dossiers, ...memory, ...archive, ...collections, ...hubs, ...series].sort((a, b) => a.label.localeCompare(b.label));
}

export function resolveEntryRouteItem(item: EntryRouteItem, context: EntryRouteResolutionContext): EntryRouteResolvedItem | null {
  let title = item.item_key;
  let excerpt: string | null = null;
  let href = getFallbackHref(item.item_type, item.item_key);
  let coverImageUrl: string | null = null;
  let coverVariant: string | null = null;
  const primaryLabel = getEntryRouteItemTypeLabel(item.item_type);
  let secondaryLabel: string | null = null;

  if (item.item_type === "editorial") {
    const found = context.editorialItems.find((entry) => entry.slug === item.item_key);
    if (found) {
      title = found.title;
      excerpt = found.excerpt;
      href = `/pautas/${found.slug}`;
      coverImageUrl = found.cover_image_url;
      coverVariant = found.cover_variant;
      secondaryLabel = found.series_title || found.primary_tag || found.category;
    }
  }

  if (item.item_type === "dossier") {
    const found = context.dossiers.find((entry) => entry.slug === item.item_key);
    if (found) {
      title = found.title;
      excerpt = found.excerpt || found.description;
      href = `/dossies/${found.slug}`;
      coverImageUrl = found.cover_image_url;
      coverVariant = found.featured ? "ember" : "concrete";
      secondaryLabel = found.lead_question || found.period_label || found.territory_label;
    }
  }

  if (item.item_type === "memory") {
    const found = context.memoryItems.find((entry) => entry.slug === item.item_key);
    if (found) {
      title = found.title;
      excerpt = found.excerpt;
      href = `/memoria/${found.slug}`;
      coverImageUrl = found.cover_image_url;
      coverVariant = found.highlight_in_memory || found.featured ? "ember" : "concrete";
      secondaryLabel = found.collection_title || found.memory_collection;
    }
  }

  if (item.item_type === "archive") {
    const found = context.archiveAssets.find((entry) => entry.id === item.item_key);
    if (found) {
      title = found.title;
      excerpt = found.description || found.source_label;
      href = `/acervo/${found.id}`;
      coverImageUrl = found.thumb_url || found.file_url;
      coverVariant = found.featured ? "ember" : "concrete";
      secondaryLabel = found.collection_slug || found.place_label || found.rights_note;
    }
  }

  if (item.item_type === "collection") {
    const found = context.archiveCollections.find((entry) => entry.slug === item.item_key);
    if (found) {
      title = found.title;
      excerpt = found.excerpt || found.description;
      href = `/acervo/colecoes/${found.slug}`;
      coverImageUrl = found.cover_image_url;
      coverVariant = found.featured ? "ember" : "concrete";
      secondaryLabel = found.excerpt || found.description;
    }
  }

  if (item.item_type === "hub") {
    const found = context.hubs.find((entry) => entry.slug === item.item_key);
    if (found) {
      title = found.title;
      excerpt = found.excerpt || found.description;
      href = `/eixos/${found.slug}`;
      coverImageUrl = found.cover_image_url;
      coverVariant = found.featured ? "ember" : "concrete";
      secondaryLabel = found.lead_question || found.excerpt || found.description;
    }
  }

  if (item.item_type === "series") {
    const found = context.seriesCards.find((entry) => entry.slug === item.item_key);
    if (found) {
      title = found.title;
      excerpt = found.description;
      href = `/series/${found.slug}`;
      coverImageUrl = found.coverImageUrl ?? null;
      coverVariant = found.coverVariant;
      secondaryLabel = found.axis;
    }
  }

  return {
    ...item,
    title,
    excerpt,
    href,
    coverImageUrl,
    coverVariant,
    primaryLabel,
    secondaryLabel,
    roleLabel: getEntryRouteItemRoleLabel(item.role),
    orderLabel: getEntryRouteItemRoleTone(item.role),
  };
}

export function resolveEntryRouteItems(items: EntryRouteItem[], context: EntryRouteResolutionContext) {
  return sortResolvedItems(
    items
      .map((item) => resolveEntryRouteItem(item, context))
      .filter((item): item is EntryRouteResolvedItem => Boolean(item)),
  );
}

export function groupEntryRouteItemsByRole(items: EntryRouteResolvedItem[]) {
  return items.reduce<Partial<Record<string, EntryRouteResolvedItem[]>>>((acc, item) => {
    const key = item.role;
    acc[key] = [...(acc[key] ?? []), item];
    return acc;
  }, {});
}

export function getEntryRouteLeadItem(items: EntryRouteResolvedItem[]) {
  return items.find((item) => item.role === "start") ?? items[0] ?? null;
}